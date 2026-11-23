from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


TRANSICIONES_VALIDAS: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear_pedido(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        ids_productos = [item.producto_id for item in data.items]
        if len(ids_productos) != len(set(ids_productos)):
            raise ProductoRepetido(
                "No se permiten productos repetidos en el mismo pedido."
            )

        with self.uow as uow:
            ahora = datetime.now(timezone.utc)
            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega.strip(),
                notas=data.notas.strip() if data.notas else None,
                total=0.0,
                created_at=ahora,
                updated_at=ahora,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"El producto con id {item.producto_id} no existe o está inactivo."
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible."
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}'. "
                        f"Disponible: {producto.stock}, solicitado: {item.cantidad}."
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,  # type: ignore[arg-type]
                    producto_id=producto.id,  # type: ignore[arg-type]
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.pedidos.add_detalle(detalle)
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)

            pedido_cargado = uow.pedidos.get_by_id_with_items(
                pedido.id  # type: ignore[arg-type]
            )
            return PedidoRead.model_validate(pedido_cargado)

    def listar_pedidos(
        self,
        usuario_id: int,
        rol: str,
        skip: int = 0,
        limit: int = 20,
        estado: EstadoPedido | None = None,
    ) -> PedidosPaginados:
        filtro_usuario = None if rol == "admin" else usuario_id
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=filtro_usuario,
                estado=estado,
                skip=skip,
                limit=limit,
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
            )

    def obtener_pedido(
        self, pedido_id: int, usuario_id: int, rol: str
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado.")
            if rol != "admin" and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tenés permiso para ver este pedido.")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(
        self, pedido_id: int, nuevo_estado: EstadoPedido
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado.")

            permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, set())
            if nuevo_estado not in permitidos:
                raise TransicionInvalida(
                    f"No se puede pasar un pedido de '{pedido.estado}' a '{nuevo_estado}'."
                )

            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar_pedido_propio(
        self, pedido_id: int, usuario_id: int
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado.")
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tenés permiso para cancelar este pedido.")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos en estado PENDIENTE."
                )

            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            pedidos_hoy = uow.pedidos.count_pedidos_hoy()
            ingresos_entregados = uow.pedidos.sum_ingresos_entregados()
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=pedidos_hoy,
                ingresos_entregados=ingresos_entregados,
            )

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for detalle in pedido.items:
            producto = uow.productos.get_by_id(detalle.producto_id)
            if producto is not None:
                producto.stock += detalle.cantidad
                uow.productos.add(producto)

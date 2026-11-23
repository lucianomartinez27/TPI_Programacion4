"""Service para el módulo de pedidos con máquina de estados y reglas de negocio."""

from collections.abc import Sequence
from datetime import datetime, timezone

from app.core.database import session_factory
from app.modules.pedidos.enums import EstadoPedido
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    DetallePedidoRead,
    PedidoAjeno,
    PedidoCreate,
    PedidoNoEncontrado,
    PedidoRead,
    PedidosPaginados,
    ProductoNoDisponible,
    ProductoRepetido,
    ResumenPedidos,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

# Mapa de transiciones válidas de la máquina de estados
TRANSICIONES = {
    EstadoPedido.PENDIENTE: [EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO],
    EstadoPedido.EN_PREPARACION: [EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO],
    EstadoPedido.ENTREGADO: [],
    EstadoPedido.CANCELADO: [],
}


class PedidoService:
    """Lógica de negocio para la gestión de pedidos."""

    def __init__(self, uow: PedidoUnitOfWork | None = None):
        self.uow = uow or PedidoUnitOfWork(session_factory)

    def create_pedido(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        """
        Crea un pedido con sus líneas, descuenta stock y copia nombre/precio.
        RN-01: al menos un ítem, sin productos repetidos, stock suficiente.
        """
        if not data.items:
            raise PedidoNoEncontrado("El pedido debe tener al menos un ítem")

        producto_ids = [item.producto_id for item in data.items]
        if len(producto_ids) != len(set(producto_ids)):
            raise ProductoRepetido("No se pueden repetir productos en el mismo pedido")

        with self.uow as uow:
            # Validar y preparar líneas
            lineas: list[DetallePedido] = []
            total = 0.0

            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise PedidoNoEncontrado(f"El producto {item.producto_id} no existe")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto {producto.nombre} no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para {producto.nombre} "
                        f"(disponible: {producto.stock}, solicitado: {item.cantidad})"
                    )

                # Descuento de stock a través del repositorio
                producto.stock -= item.cantidad
                uow.productos.save(producto)

                subtotal = producto.precio_base * item.cantidad
                total += subtotal

                detalle = DetallePedido(
                    pedido_id=0,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                lineas.append(detalle)

            # Crear pedido (el repositorio hace flush para obtener pedido.id)
            pedido = Pedido(
                usuario_id=usuario_id,
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=total,
            )
            uow.pedidos.add(pedido)

            # Crear líneas con el pedido_id obtenido tras el flush
            for detalle in lineas:
                detalle.pedido_id = pedido.id
                uow.detalle_pedidos.add(detalle)

            return self._build_pedido_read(pedido, lineas)

    def get_pedido(self, pedido_id: int) -> PedidoRead:
        """Obtiene un pedido con sus líneas."""
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            lineas = uow.detalle_pedidos.get_by_pedido(pedido.id)
            return self._build_pedido_read(pedido, lineas)

    def list_pedidos(
        self, usuario_id: int, role: str, skip: int = 0, limit: int = 100, estado: EstadoPedido | None = None
    ) -> PedidosPaginados:
        """
        Lista pedidos: propios si es user, todos si es admin.
        Soporta filtro por estado y paginación.
        """
        with self.uow as uow:
            if role == "admin":
                total, pedidos = uow.pedidos.get_all_admin(skip=skip, limit=limit, estado=estado)
            else:
                total, pedidos = uow.pedidos.get_by_user(
                    usuario_id, skip=skip, limit=limit, estado=estado
                )
            items = [
                self._build_pedido_read(p, uow.detalle_pedidos.get_by_pedido(p.id))
                for p in pedidos
            ]
            return PedidosPaginados(total=total, items=items)

    def get_resumen(self) -> ResumenPedidos:
        """Devuelve el resumen de pedidos para el panel de administración."""
        with self.uow as uow:
            counts = uow.pedidos.get_counts_by_state()
            return ResumenPedidos(
                pendientes=counts.get(EstadoPedido.PENDIENTE, 0),
                en_preparacion=counts.get(EstadoPedido.EN_PREPARACION, 0),
                entregados=counts.get(EstadoPedido.ENTREGADO, 0),
                cancelados=counts.get(EstadoPedido.CANCELADO, 0),
                pedidos_hoy=uow.pedidos.get_today_count(),
                ingresos_entregados=uow.pedidos.get_delivered_revenue(),
            )

    def cancelar_pedido(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """
        Cancela un pedido propio en estado PENDIENTE.
        RN-03: cancelar restituye stock.
        """
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")

            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tienes permiso para cancelar este pedido")

            if pedido.estado != EstadoPedido.PENDIENTE:
                raise TransicionInvalida("Solo se pueden cancelar pedidos en estado PENDIENTE")

            # Restituir stock (RN-03)
            lineas = uow.detalle_pedidos.get_by_pedido(pedido_id)
            for linea in lineas:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto:
                    producto.stock += linea.cantidad
                    uow.productos.save(producto)

            pedido.estado = EstadoPedido.CANCELADO
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.save(pedido)

            return self._build_pedido_read(pedido, lineas)

    def update_estado_admin(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        """
        Cambia el estado de un pedido (solo admin).
        RN-02: solo transiciones válidas.
        RN-03: cancelar restituye stock.
        """
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")

            # Validar transición
            allowed = TRANSICIONES.get(pedido.estado, [])
            if data.estado not in allowed:
                raise TransicionInvalida(
                    f"No se puede cambiar de {pedido.estado.value} a {data.estado.value}"
                )

            lineas = uow.detalle_pedidos.get_by_pedido(pedido_id)

            # Cancelar: restituir stock (RN-03)
            if data.estado == EstadoPedido.CANCELADO:
                for linea in lineas:
                    producto = uow.productos.get_by_id(linea.producto_id)
                    if producto:
                        producto.stock += linea.cantidad
                        uow.productos.save(producto)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.save(pedido)

            return self._build_pedido_read(pedido, lineas)

    def _build_pedido_read(self, pedido: Pedido, lineas: Sequence[DetallePedido]) -> PedidoRead:
        """Construye un PedidoRead con sus líneas."""
        return PedidoRead(
            id=pedido.id,
            usuario_id=pedido.usuario_id,
            estado=pedido.estado,
            forma_pago=pedido.forma_pago,
            direccion_entrega=pedido.direccion_entrega,
            notas=pedido.notas,
            total=pedido.total,
            created_at=pedido.created_at,
            updated_at=pedido.updated_at,
            items=[
                DetallePedidoRead.model_validate(l) for l in lineas
            ],
        )

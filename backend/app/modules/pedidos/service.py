"""Service para el módulo de pedidos con máquina de estados y reglas de negocio."""

from datetime import datetime

from sqlmodel import Session

from app.modules.pedidos.models import DetallePedido, Pedido, EstadoPedido
from app.modules.pedidos.repository import DetallePedidoRepository, PedidoRepository
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
from app.modules.productos.models import Producto

# Mapa de transiciones válidas de la máquina de estados
TRANSICIONES = {
    EstadoPedido.PENDIENTE: [EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO],
    EstadoPedido.EN_PREPARACION: [EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO],
    EstadoPedido.ENTREGADO: [],
    EstadoPedido.CANCELADO: [],
}


class PedidoService:
    """Lógica de negocio para la gestión de pedidos."""

    uow = PedidoUnitOfWork

    def __init__(self, session: Session):
        self.session = session
        self.pedido_repo = PedidoRepository(session)
        self.detalle_repo = DetallePedidoRepository(session)

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
            lineas = []
            total = 0.0

            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None:
                    raise PedidoNoEncontrado(f"El producto {item.producto_id} no existe")
                if not producto.activo or not producto.disponible:
                    raise ProductoNoDisponible(f"El producto {producto.nombre} no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para {producto.nombre} "
                        f"(disponible: {producto.stock}, solicitado: {item.cantidad})"
                    )

                # Descuento de stock
                producto.stock -= item.cantidad
                uow.session.add(producto)

                subtotal = producto.precio_base * item.cantidad
                total += subtotal

                detalle = DetallePedido(
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                lineas.append(detalle)

            # Crear pedido
            pedido = Pedido(
                usuario_id=usuario_id,
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=total,
            )
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            # Crear líneas con el pedido_id
            for detalle in lineas:
                detalle.pedido_id = pedido.id
                uow.session.add(detalle)

            uow.session.flush()
            uow.session.refresh(pedido)

            return self._build_pedido_read(pedido, uow.session)

    def get_pedido(self, pedido_id: int) -> PedidoRead:
        """Obtiene un pedido con sus líneas."""
        pedido = self.pedido_repo.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return self._build_pedido_read(pedido, self.session)

    def list_pedidos(
        self, usuario_id: int, role: str, skip: int = 0, limit: int = 100, estado: EstadoPedido | None = None
    ) -> PedidosPaginados:
        """
        Lista pedidos: propios si es user, todos si es admin.
        Soporta filtro por estado y paginación.
        """
        if role == "admin":
            total, pedidos = self.pedido_repo.get_all_admin(skip=skip, limit=limit, estado=estado)
        else:
            total, pedidos = self.pedido_repo.get_by_user(
                usuario_id, skip=skip, limit=limit, estado=estado
            )
        items = [self._build_pedido_read(p, self.session) for p in pedidos]
        return PedidosPaginados(total=total, items=items)

    def get_resumen(self) -> ResumenPedidos:
        """Devuelve el resumen de pedidos para el panel de administración."""
        counts = self.pedido_repo.get_counts_by_state()
        return ResumenPedidos(
            pendientes=counts.get(EstadoPedido.PENDIENTE, 0),
            en_preparacion=counts.get(EstadoPedido.EN_PREPARACION, 0),
            entregados=counts.get(EstadoPedido.ENTREGADO, 0),
            cancelados=counts.get(EstadoPedido.CANCELADO, 0),
            pedidos_hoy=self.pedido_repo.get_today_count(),
            ingresos_entregados=self.pedido_repo.get_delivered_revenue(),
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
                    uow.session.add(producto)

            pedido.estado = EstadoPedido.CANCELADO
            pedido.updated_at = datetime.now()
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            return self._build_pedido_read(pedido, uow.session)

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

            # Cancelar: restituir stock (RN-03)
            if data.estado == EstadoPedido.CANCELADO:
                lineas = uow.detalle_pedidos.get_by_pedido(pedido_id)
                for linea in lineas:
                    producto = uow.productos.get_by_id(linea.producto_id)
                    if producto:
                        producto.stock += linea.cantidad
                        uow.session.add(producto)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now()
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            return self._build_pedido_read(pedido, uow.session)

    def _build_pedido_read(self, pedido: Pedido, session: Session) -> PedidoRead:
        """Construye un PedidoRead con sus líneas."""
        lineas = self.detalle_repo.get_by_pedido(pedido.id)
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

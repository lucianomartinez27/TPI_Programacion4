// Tipos compartidos con el backend

export interface UserRead {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  disabled: boolean;
  created_at: string;
}

export interface UsuarioListRead {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  disabled: boolean;
  created_at: string;
}

export interface CategoriaRead {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface ProductoRead {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria: CategoriaRead | null;
}

export interface ProductosPaginados {
  total: number;
  items: ProductoRead[];
}

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  EN_PREPARACION = 'EN_PREPARACION',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export enum FormaPago {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export interface DetallePedidoRead {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
  subtotal: number;
}

export interface PedidoRead {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedidoRead[];
}

export interface PedidosPaginados {
  total: number;
  items: PedidoRead[];
}

export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}

// Items del carrito (estado local)
export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_base: number;
  cantidad: number;
  imagen_url: string | null;
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { useAdminPedidos, useUpdateEstadoPedidoMutation } from '../hooks/useAdmin';
import type { EstadoPedido, FormaPago } from '../../../shared/api/types';
import { EstadoPedido as EP, FormaPago as FP } from '../../../shared/api/types';
import { PEDIDOS_KEY } from '../../orders/hooks/useOrders';
import { useQueryClient } from '@tanstack/react-query';
import { Package, ChevronRight, ChevronLeft, LayoutDashboard, ShoppingCart, Tag, Users } from 'lucide-react';

const LIMIT = 10;

const adminLinks = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/categorias', label: 'Categorías', icon: Tag },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
];

function AdminSidebar() {
  return (
    <nav className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Admin</h2>
      <ul className="space-y-1">
        {adminLinks.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const formaPagoLabel: Record<FP, string> = {
  [FP.EFECTIVO]: 'Efectivo',
  [FP.TRANSFERENCIA]: 'Transferencia',
};

const transiciones: Record<EP, EP[]> = {
  [EP.PENDIENTE]: [EP.EN_PREPARACION, EP.CANCELADO],
  [EP.EN_PREPARACION]: [EP.ENTREGADO, EP.CANCELADO],
  [EP.ENTREGADO]: [],
  [EP.CANCELADO]: [],
};

export function AdminPedidosPage() {
  const [page, setPage] = useState(0);
  const [selectedPedido, setSelectedPedido] = useState<number | null>(null);
  const [filterEstado, setFilterEstado] = useState<EP | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EP | null>(null);

  const { data, isLoading } = useAdminPedidos(page * LIMIT, LIMIT, filterEstado);
  const updateEstado = useUpdateEstadoPedidoMutation();
  const qc = useQueryClient();

  const pedidoSeleccionado = data?.items.find((p) => p.id === selectedPedido);
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  const confirmarCambio = () => {
    if (selectedPedido && nuevoEstado) {
      updateEstado.mutate({ id: selectedPedido, estado: nuevoEstado });
      setModalOpen(false);
      setNuevoEstado(null);
      qc.invalidateQueries({ queryKey: PEDIDOS_KEY });
    }
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de pedidos</h1>
            <p className="text-gray-500 mt-1">Administra todos los pedidos</p>
          </div>

          {/* Filtro */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => { setFilterEstado(undefined); setPage(0); }}
              className={`px-3 py-1.5 text-sm rounded-full border ${
                !filterEstado ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            {Object.values(EP).map((estado) => (
              <button
                key={estado}
                onClick={() => { setFilterEstado(estado); setPage(0); }}
                className={`px-3 py-1.5 text-sm rounded-full border ${
                  filterEstado === estado ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {estado === EP.PENDIENTE ? 'Pendiente' :
                 estado === EP.EN_PREPARACION ? 'En preparación' :
                 estado === EP.ENTREGADO ? 'Entregado' : 'Cancelado'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista */}
            <div className="lg:col-span-2 space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-32" />
                  </div>
                ))
              ) : data?.items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay pedidos</p>
                </div>
              ) : (
                <>
                  {data?.items.map((pedido) => (
                    <Card
                      key={pedido.id}
                      className={`cursor-pointer transition-colors ${
                        selectedPedido === pedido.id ? 'ring-2 ring-orange-500' : 'hover:shadow-md'
                      }`}
                    >
                      <div
                        className="flex items-center justify-between"
                        onClick={() => setSelectedPedido(pedido.id)}
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">Pedido #{pedido.id}</h3>
                            <BadgeEstado estado={pedido.estado} />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {pedido.direccion_entrega} — {formaPagoLabel[pedido.forma_pago]}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">${pedido.total.toFixed(2)}</p>
                          <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                        </div>
                      </div>
                    </Card>
                  ))}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-gray-600">{page + 1} / {totalPages}</span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Detalle */}
            <div>
              {pedidoSeleccionado ? (
                <Card title={`Pedido #${pedidoSeleccionado.id}`}>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-500">Estado</span>
                      <div className="mt-1"><BadgeEstado estado={pedidoSeleccionado.estado} /></div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Pago</span>
                      <p className="font-medium">{formaPagoLabel[pedidoSeleccionado.forma_pago]}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Dirección</span>
                      <p className="font-medium">{pedidoSeleccionado.direccion_entrega}</p>
                    </div>
                    {pedidoSeleccionado.notas && (
                      <div>
                        <span className="text-sm text-gray-500">Notas</span>
                        <p className="font-medium">{pedidoSeleccionado.notas}</p>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <span className="text-sm text-gray-500">Productos</span>
                      <ul className="mt-2 space-y-2">
                        {pedidoSeleccionado.items.map((item) => (
                          <li key={item.id} className="flex justify-between text-sm">
                            <span>{item.cantidad}x {item.nombre_producto}</span>
                            <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                        <span>Total</span>
                        <span className="text-orange-600">${pedidoSeleccionado.total.toFixed(2)}</span>
                      </div>
                    </div>
                    {transiciones[pedidoSeleccionado.estado].length > 0 && (
                      <div className="border-t pt-3">
                        <span className="text-sm text-gray-500">Cambiar estado</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {transiciones[pedidoSeleccionado.estado].map((estado) => (
                            <Button
                              key={estado}
                              variant={estado === EP.CANCELADO ? 'danger' : 'primary'}
                              size="sm"
                              onClick={() => { setNuevoEstado(estado); setModalOpen(true); }}
                            >
                              {estado === EP.EN_PREPARACION ? 'Preparar' :
                               estado === EP.ENTREGADO ? 'Entregar' : 'Cancelar'}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="text-center py-8 text-gray-400">
                    <Package className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-sm">Seleccioná un pedido</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <AdminSidebar />
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirmar cambio de estado">
        <p className="text-gray-700 mb-4">
          ¿Estás seguro de cambiar el estado a{' '}
          <strong>
            {nuevoEstado === EP.EN_PREPARACION ? 'En preparación' :
             nuevoEstado === EP.ENTREGADO ? 'Entregado' :
             nuevoEstado === EP.CANCELADO ? 'Cancelado' : nuevoEstado}
          </strong>
          {' '}del pedido #{selectedPedido}?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" loading={updateEstado.isPending} onClick={confirmarCambio}>
            Confirmar
          </Button>
        </div>
      </Modal>
    </MainLayout>
  );
}

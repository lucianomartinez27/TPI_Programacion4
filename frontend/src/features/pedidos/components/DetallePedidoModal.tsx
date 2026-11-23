import type { Pedido } from '../types/pedido.types';
import { Modal } from '@/shared/ui/Modal';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { formatFecha, formatPrecio } from '@/shared/utils/formatters';

interface DetallePedidoModalProps {
  pedido: Pedido | null;
  onClose: () => void;
}

export function DetallePedidoModal({
  pedido,
  onClose,
}: DetallePedidoModalProps) {
  return (
    <Modal
      open={pedido !== null}
      onClose={onClose}
      title={pedido ? `Detalle del Pedido #${pedido.id}` : 'Detalle'}
      maxWidthClass="max-w-2xl"
    >
      {pedido && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 rounded-xl bg-stone-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-stone-500">Estado</p>
              <div className="mt-1">
                <BadgeEstado estado={pedido.estado} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500">Fecha</p>
              <p className="mt-1 font-medium text-stone-900">
                {formatFecha(pedido.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500">
                Forma de pago
              </p>
              <p className="mt-1 font-medium text-stone-900">
                {pedido.forma_pago === 'EFECTIVO'
                  ? 'Efectivo'
                  : 'Transferencia bancaria'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500">
                Dirección de entrega
              </p>
              <p className="mt-1 font-medium text-stone-900">
                {pedido.direccion_entrega}
              </p>
            </div>
            {pedido.notas && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-stone-500">Notas</p>
                <p className="mt-1 text-stone-800">{pedido.notas}</p>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-right">Precio unit.</th>
                  <th className="px-4 py-3 text-center">Cant.</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {pedido.items.map((item) => (
                  <tr key={item.producto_id}>
                    <td className="px-4 py-3 font-medium text-stone-900">
                      {item.nombre_producto}
                    </td>
                    <td className="px-4 py-3 text-right text-stone-600">
                      {formatPrecio(item.precio_unitario)}
                    </td>
                    <td className="px-4 py-3 text-center text-stone-700">
                      {item.cantidad}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-900">
                      {formatPrecio(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-50 font-semibold text-stone-900">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right">
                    Total del pedido
                  </td>
                  <td className="px-4 py-3 text-right text-base text-orange-700">
                    {formatPrecio(pedido.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

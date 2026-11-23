import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  ChefHat,
  Clock,
  DollarSign,
  XCircle,
} from 'lucide-react';
import { useResumenPedidos } from '../hooks/usePedidos';
import { ResumenCard } from '../components/ResumenCard';
import { handleApiError } from '@/shared/api/handleApiError';
import { formatPrecio } from '@/shared/utils/formatters';
import { Skeleton } from '@/shared/components/Skeleton';
import { EstadoError } from '@/shared/components/EstadoError';
import { Button } from '@/shared/ui/Button';

export function AdminResumenPage() {
  const resumenQuery = useResumenPedidos();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Resumen del negocio
          </h1>
          <p className="text-sm text-stone-500">
            Indicadores en tiempo real sobre el estado de pedidos e ingresos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/pedidos">
            <Button variant="secondary" size="sm">
              Gestionar pedidos
            </Button>
          </Link>
          <Link to="/admin/productos">
            <Button size="sm">Gestionar productos</Button>
          </Link>
        </div>
      </div>

      {resumenQuery.isPending ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : resumenQuery.isError ? (
        <EstadoError
          mensaje={handleApiError(resumenQuery.error)}
          onReintentar={() => void resumenQuery.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard
            titulo="Pedidos pendientes"
            valor={resumenQuery.data.pendientes}
            descripcion="Esperando comenzar preparación"
            icono={<Clock className="h-6 w-6" />}
            colorClass="bg-amber-50 text-amber-600"
          />
          <ResumenCard
            titulo="En preparación"
            valor={resumenQuery.data.en_preparacion}
            descripcion="Actualmente en cocina"
            icono={<ChefHat className="h-6 w-6" />}
            colorClass="bg-sky-50 text-sky-600"
          />
          <ResumenCard
            titulo="Entregados"
            valor={resumenQuery.data.entregados}
            descripcion="Pedidos completados con éxito"
            icono={<CheckCircle2 className="h-6 w-6" />}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <ResumenCard
            titulo="Cancelados"
            valor={resumenQuery.data.cancelados}
            descripcion="Pedidos cancelados (stock restituido)"
            icono={<XCircle className="h-6 w-6" />}
            colorClass="bg-red-50 text-red-600"
          />
          <ResumenCard
            titulo="Pedidos de hoy"
            valor={resumenQuery.data.pedidos_hoy}
            descripcion="Creados en la jornada actual"
            icono={<CalendarCheck className="h-6 w-6" />}
            colorClass="bg-orange-50 text-orange-600"
          />
          <ResumenCard
            titulo="Ingresos entregados"
            valor={formatPrecio(resumenQuery.data.ingresos_entregados)}
            descripcion="Suma total de pedidos en estado ENTREGADO"
            icono={<DollarSign className="h-6 w-6" />}
            colorClass="bg-emerald-100 text-emerald-700"
          />
        </div>
      )}
    </div>
  );
}

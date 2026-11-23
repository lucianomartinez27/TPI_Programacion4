import { CheckCircle, ChefHat, Clock, DollarSign, TrendingUp, XCircle } from 'lucide-react';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { AdminSidebar } from '../../../shared/layout/AdminSidebar';
import { Card } from '../../../shared/ui/Card';
import { EstadoError, Skeleton } from '../../../shared/components';
import { useResumenPedidos } from '../hooks/useAdmin';

export function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos();

  const cards = [
    {
      title: 'Pendientes',
      value: data?.pendientes ?? 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'En preparación',
      value: data?.en_preparacion ?? 0,
      icon: ChefHat,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Entregados',
      value: data?.entregados ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Cancelados',
      value: data?.cancelados ?? 0,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Pedidos hoy',
      value: data?.pedidos_hoy ?? 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Ingresos (entregados)',
      value: `$${(data?.ingresos_entregados ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel de administración</h1>
            <p className="text-gray-500 mt-1">Resumen general del negocio</p>
          </div>

          {isLoading ? (
            <Skeleton variant="stats" count={6} />
          ) : isError ? (
            <EstadoError error={error} onRetry={() => void refetch()} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <Card key={card.title}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${card.bg}`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      <p className="text-sm text-gray-500">{card.title}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <AdminSidebar />
        </div>
      </div>
    </MainLayout>
  );
}

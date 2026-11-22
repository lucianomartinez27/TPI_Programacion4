import { Link } from 'react-router-dom';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { useResumenPedidos } from '../hooks/useAdmin';
import { Clock, ChefHat, CheckCircle, XCircle, TrendingUp, DollarSign, LayoutDashboard, Package, Tag, ShoppingCart, Users } from 'lucide-react';

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

export function AdminResumenPage() {
  const { data, isLoading } = useResumenPedidos();

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              ))}
            </div>
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

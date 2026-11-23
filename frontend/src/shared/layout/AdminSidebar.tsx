import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingCart, Users } from 'lucide-react';

export const adminLinks = [
  { to: '/admin/resumen', label: 'Resumen', icon: LayoutDashboard },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/categorias', label: 'Categorías', icon: Tag },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
];

export function AdminSidebar() {
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

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingCart, Users } from 'lucide-react';

const adminLinks = [
  { to: '/admin/resumen', label: 'Resumen', icon: LayoutDashboard },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/categorias', label: 'Categorías', icon: Tag },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
];

export function AdminSidebar() {
  return (
    <nav className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Admin
      </h2>
      <ul className="space-y-1">
        {adminLinks.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-brand font-semibold'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-brand'
                }`
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

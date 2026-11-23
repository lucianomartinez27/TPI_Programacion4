import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  LogOut,
  ShieldCheck,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/shared/ui/Button';

const adminLinks = [
  { to: '/admin/resumen', label: 'Resumen' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/usuarios', label: 'Usuarios' },
];

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidadCarrito = useCartStore((s) =>
    s.items.reduce((acc, item) => acc + item.cantidad, 0),
  );
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-orange-50 text-orange-700'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-stone-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-xs">
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            <span>
              Food<span className="text-orange-600">Store</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              Catálogo
            </NavLink>
            <NavLink to="/carrito" className={navLinkClass}>
              <ShoppingCart className="h-4 w-4" />
              Carrito
              {cantidadCarrito > 0 && (
                <span className="ml-0.5 rounded-full bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">
                  {cantidadCarrito}
                </span>
              )}
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={navLinkClass}>
                <ClipboardList className="h-4 w-4" />
                Mis pedidos
              </NavLink>
            )}
            {usuario?.role === 'admin' && (
              <NavLink to="/admin/resumen" className={navLinkClass}>
                <ShieldCheck className="h-4 w-4" />
                Panel Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/carrito"
            className="relative flex items-center rounded-lg p-2 text-stone-600 hover:bg-stone-100 md:hidden"
            aria-label="Carrito"
          >
            <ShoppingCart className="h-5 w-5" />
            {cantidadCarrito > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white">
                {cantidadCarrito}
              </span>
            )}
          </Link>

          {usuario ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-stone-900">
                  {usuario.full_name}
                </p>
                <p className="text-xs text-stone-500">
                  @{usuario.username} ·{' '}
                  <span className="font-medium uppercase text-orange-700">
                    {usuario.role}
                  </span>
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navegación móvil básica */}
      <div className="flex items-center gap-1 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden">
        <NavLink to="/" end className={navLinkClass}>
          Catálogo
        </NavLink>
        {usuario && (
          <NavLink to="/mis-pedidos" className={navLinkClass}>
            Mis pedidos
          </NavLink>
        )}
        {usuario?.role === 'admin' && (
          <NavLink to="/admin/resumen" className={navLinkClass}>
            Admin
          </NavLink>
        )}
      </div>

      {/* Subbarra del panel de administración visible solo para admin */}
      {usuario?.role === 'admin' && (
        <div className="border-t border-stone-200 bg-stone-900 text-stone-200">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-6 lg:px-8">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-orange-400">
              Admin:
            </span>
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

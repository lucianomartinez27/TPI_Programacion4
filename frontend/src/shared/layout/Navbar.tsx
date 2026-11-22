import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useLogoutMutation } from '../../features/auth/hooks/useAuthMutations';
import { ShoppingCart, User, Package, LogOut, Menu as MenuIcon, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-orange-600 font-bold text-xl">
            <Package className="h-6 w-6" />
            <span>Food Store</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-orange-600 text-sm font-medium">
              Catálogo
            </Link>
            <Link to="/carrito" className="relative text-gray-700 hover:text-orange-600 text-sm font-medium">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link to="/mis-pedidos" className="text-gray-700 hover:text-orange-600 text-sm font-medium">
                  Mis pedidos
                </Link>
                {isAdmin && (
                  <Link to="/admin/resumen" className="text-gray-700 hover:text-orange-600 text-sm font-medium">
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.full_name} ({user.role})</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-orange-600 text-sm font-medium">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <Link to="/" className="block text-gray-700 hover:text-orange-600 text-sm font-medium">
              Catálogo
            </Link>
            <Link to="/carrito" className="block text-gray-700 hover:text-orange-600 text-sm font-medium">
              Carrito ({totalItems})
            </Link>
            {user ? (
              <>
                <Link to="/mis-pedidos" className="block text-gray-700 hover:text-orange-600 text-sm font-medium">
                  Mis pedidos
                </Link>
                {isAdmin && (
                  <Link to="/admin/resumen" className="block text-gray-700 hover:text-orange-600 text-sm font-medium">
                    Admin
                  </Link>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{user.full_name}</span>
                  <button onClick={handleLogout} className="text-red-600 text-sm">
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-orange-600 text-sm font-medium">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="block text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-center">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

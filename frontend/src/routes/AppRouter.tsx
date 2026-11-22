import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage';
import { CartPage } from '../features/cart/pages/CartPage';
import { CheckoutPage } from '../features/cart/pages/CheckoutPage';
import { OrdersPage } from '../features/orders/pages/OrdersPage';
import { AdminResumenPage } from '../features/admin/pages/AdminResumenPage';
import { AdminPedidosPage } from '../features/admin/pages/AdminPedidosPage';
import { AdminCategoriasPage } from '../features/admin/pages/AdminCategoriasPage';
import { AdminProductosPage } from '../features/admin/pages/AdminProductosPage';
import { AdminUsuariosPage } from '../features/admin/pages/AdminUsuariosPage';
import { ProtectedRoute } from '../shared/layout/ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<CatalogPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/cart" element={<Navigate to="/carrito" replace />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Requieren autenticación */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/orders" element={<Navigate to="/mis-pedidos" replace />} />

        {/* Admin */}
        <Route
          path="/admin/resumen"
          element={
            <ProtectedRoute requireAdmin>
              <AdminResumenPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/resumen" replace />} />
        <Route
          path="/admin/pedidos"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPedidosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <ProtectedRoute requireAdmin>
              <AdminCategoriasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <ProtectedRoute requireAdmin>
              <AdminProductosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsuariosPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

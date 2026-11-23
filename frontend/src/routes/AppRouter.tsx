import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage, RegisterPage, UnauthorizedPage } from '../features/auth';
import { CatalogPage, ProductoDetailPage } from '../features/catalog';
import { CartPage, CheckoutPage } from '../features/cart';
import { OrdersPage, PedidoDetailPage } from '../features/orders';
import {
  AdminCategoriasPage,
  AdminPedidosPage,
  AdminProductosPage,
  AdminResumenPage,
  AdminUsuariosPage,
} from '../features/admin';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<CatalogPage />} />
      <Route path="/productos/:id" element={<ProductoDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/carrito" element={<CartPage />} />
      <Route path="/cart" element={<Navigate to="/carrito" replace />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Requieren sesión autenticada (cualquier rol) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/mis-pedidos" element={<OrdersPage />} />
        <Route path="/mis-pedidos/:id" element={<PedidoDetailPage />} />
        <Route path="/orders" element={<Navigate to="/mis-pedidos" replace />} />
      </Route>

      {/* Requieren rol admin */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<Navigate to="/admin/resumen" replace />} />
        <Route path="/admin/resumen" element={<AdminResumenPage />} />
        <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
        <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
        <Route path="/admin/productos" element={<AdminProductosPage />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
      </Route>

      {/* Ruta comodín (404 -> inicio) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

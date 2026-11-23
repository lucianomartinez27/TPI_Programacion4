import api from '../../../shared/api/axiosInstance';
import type { ProductoRead, ProductosPaginados, CategoriaRead } from '../../../shared/api/types';

export async function listProductos(
  skip = 0,
  limit = 12,
  search?: string,
  categoria_id?: number,
): Promise<ProductosPaginados> {
  const params: Record<string, string | number> = { skip, limit };
  if (search) params.search = search;
  if (categoria_id) params.categoria_id = categoria_id;
  const { data } = await api.get<ProductosPaginados>('/productos/', { params });
  return data;
}

export async function getProducto(id: number): Promise<ProductoRead> {
  const { data } = await api.get<ProductoRead>(`/productos/${id}`);
  return data;
}

export async function getCategorias(): Promise<CategoriaRead[]> {
  const { data } = await api.get<CategoriaRead[]>('/categorias/');
  return data;
}

// Admin
export async function createProducto(data: {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagen_url?: string;
  stock: number;
}): Promise<ProductoRead> {
  const { data: result } = await api.post<ProductoRead>('/productos/', data);
  return result;
}

export async function updateProducto(
  id: number,
  data: {
    categoria_id?: number;
    nombre?: string;
    descripcion?: string;
    precio_base?: number;
    imagen_url?: string;
    stock?: number;
    disponible?: boolean;
    activo?: boolean;
  },
): Promise<ProductoRead> {
  const { data: result } = await api.put<ProductoRead>(`/productos/${id}`, data);
  return result;
}

export async function updateStock(
  id: number,
  payload: { stock: number; disponible?: boolean },
): Promise<ProductoRead> {
  const { data: result } = await api.patch<ProductoRead>(`/productos/${id}/stock`, payload);
  return result;
}

export async function deleteProducto(id: number) {
  return api.delete(`/productos/${id}`);
}

// Admin categorías
export async function createCategoria(data: {
  nombre: string;
  descripcion?: string;
}): Promise<CategoriaRead> {
  const { data: result } = await api.post<CategoriaRead>('/categorias/', data);
  return result;
}

export async function updateCategoria(
  id: number,
  data: { nombre?: string; descripcion?: string; activo?: boolean },
): Promise<CategoriaRead> {
  const { data: result } = await api.put<CategoriaRead>(`/categorias/${id}`, data);
  return result;
}

export async function deleteCategoria(id: number) {
  return api.delete(`/categorias/${id}`);
}

export async function listAllCategorias(): Promise<CategoriaRead[]> {
  const { data } = await api.get<CategoriaRead[]>('/categorias/admin');
  return data;
}

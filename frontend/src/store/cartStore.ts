import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../shared/api/types';

interface CartState {
  items: CartItem[];
  agregarItem: (item: Omit<CartItem, 'cantidad'> & { cantidad?: number }) => void;
  quitarItem: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  totalItems: () => number;
}

export const selectCartTotal = (state: CartState): number =>
  state.items.reduce(
    (sum, item) => sum + (Number(item.precio_base) || 0) * (Number(item.cantidad) || 0),
    0,
  );

export const selectCartTotalItems = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);

function normalizeCartItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const productoId = Number(item.producto_id ?? item.id);
  if (!Number.isFinite(productoId) || productoId <= 0) return null;

  const precioRaw = item.precio_base ?? item.precio ?? 0;
  const precioBase = Number(precioRaw);
  const cantidad = Math.max(1, Math.floor(Number(item.cantidad ?? 1) || 1));

  return {
    producto_id: productoId,
    nombre: typeof item.nombre === 'string' ? item.nombre : 'Producto',
    precio_base: Number.isFinite(precioBase) ? precioBase : 0,
    cantidad,
    imagen_url: typeof item.imagen_url === 'string' ? item.imagen_url : null,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregarItem: (item) => {
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === item.producto_id);
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === item.producto_id
                  ? { ...i, cantidad: i.cantidad + (item.cantidad ?? 1) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                precio_base: Number(item.precio_base) || 0,
                cantidad: item.cantidad ?? 1,
              },
            ],
          };
        });
      },
      quitarItem: (producto_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== producto_id),
        }));
      },
      cambiarCantidad: (producto_id, cantidad) => {
        if (cantidad < 1) {
          get().quitarItem(producto_id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === producto_id ? { ...i, cantidad } : i,
          ),
        }));
      },
      vaciar: () => set({ items: [] }),
      total: () => selectCartTotal(get()),
      totalItems: () => selectCartTotalItems(get()),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { items?: unknown[] } | undefined;
        const normalizedItems = Array.isArray(persisted?.items)
          ? persisted.items
              .map(normalizeCartItem)
              .filter((item): item is CartItem => item !== null)
          : currentState.items;
        return {
          ...currentState,
          items: normalizedItems,
        };
      },
    },
  ),
);

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
            items: [...state.items, { ...item, cantidad: item.cantidad ?? 1 }],
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
      total: () => {
        return get().items.reduce((sum, i) => sum + i.precio_base * i.cantidad, 0);
      },
      totalItems: () => {
        return get().items.reduce((sum, i) => sum + i.cantidad, 0);
      },
    }),
    {
      name: 'cart-storage',
    },
  ),
);

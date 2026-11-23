import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url?: string;
  stock_disponible?: number;
}

interface CartState {
  items: CartItem[];
  agregar: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) => {
        if (cantidad < 1) return;
        set((state) => {
          const existente = state.items.find(
            (i) => i.producto_id === item.producto_id,
          );
          if (existente) {
            const nuevaCantidad =
              item.stock_disponible !== undefined
                ? Math.min(existente.cantidad + cantidad, item.stock_disponible)
                : existente.cantidad + cantidad;
            return {
              items: state.items.map((i) =>
                i.producto_id === item.producto_id
                  ? {
                      ...i,
                      nombre: item.nombre,
                      precio_unitario: item.precio_unitario,
                      imagen_url: item.imagen_url,
                      stock_disponible: item.stock_disponible,
                      cantidad: nuevaCantidad,
                    }
                  : i,
              ),
            };
          }
          const cantidadInicial =
            item.stock_disponible !== undefined
              ? Math.min(cantidad, item.stock_disponible)
              : cantidad;
          if (cantidadInicial < 1) return state;
          return {
            items: [...state.items, { ...item, cantidad: cantidadInicial }],
          };
        });
      },

      quitar: (producto_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== producto_id),
        }));
      },

      cambiarCantidad: (producto_id, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(producto_id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.producto_id !== producto_id) return i;
            const cantValida =
              i.stock_disponible !== undefined
                ? Math.min(cantidad, i.stock_disponible)
                : cantidad;
            return { ...i, cantidad: Math.max(1, cantValida) };
          }),
        }));
      },

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0,
        ),

      cantidadTotal: () =>
        get().items.reduce((acc, item) => acc + item.cantidad, 0),
    }),
    {
      name: 'foodstore-cart',
    },
  ),
);

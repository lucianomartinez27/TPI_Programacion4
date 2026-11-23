import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import type { Producto, ProductoStockUpdate } from '../types/producto.types';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';

interface StockModalProps {
  producto: Producto | null;
  onClose: () => void;
  onSubmit: (id: number, values: ProductoStockUpdate) => Promise<void>;
  serverError: string | null;
}

export function StockModal({
  producto,
  onClose,
  onSubmit,
  serverError,
}: StockModalProps) {
  const [saving, setSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      if (!producto) return;
      setSaving(true);
      try {
        await onSubmit(producto.id, {
          stock: Number(value.stock),
          disponible: value.disponible,
        });
      } finally {
        setSaving(false);
      }
    },
  });

  return (
    <Modal
      open={producto !== null}
      onClose={onClose}
      title={producto ? `Stock y disponibilidad · ${producto.nombre}` : 'Stock'}
      maxWidthClass="max-w-md"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              !Number.isInteger(value) || value < 0
                ? 'El stock debe ser un número entero mayor o igual a 0.'
                : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Stock actual"
              name={field.name}
              type="number"
              min={0}
              step={1}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              error={
                field.state.meta.errors.length > 0
                  ? String(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 accent-orange-600"
              />
              Disponible para la venta en el catálogo
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe
            selector={(s) => [s.canSubmit, s.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || saving}
                isLoading={isSubmitting || saving}
              >
                Actualizar stock
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import type { Categoria } from '@/features/categorias/types/categoria.types';
import type { Producto, ProductoCreate } from '../types/producto.types';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';

interface ProductoFormModalProps {
  open: boolean;
  productoEditar: Producto | null;
  categorias: Categoria[];
  onClose: () => void;
  onSubmit: (values: ProductoCreate) => Promise<void>;
  serverError: string | null;
}

export function ProductoFormModal({
  open,
  productoEditar,
  categorias,
  onClose,
  onSubmit,
  serverError,
}: ProductoFormModalProps) {
  const [saving, setSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      nombre: productoEditar?.nombre ?? '',
      descripcion: productoEditar?.descripcion ?? '',
      precio_base: productoEditar?.precio_base ?? 0,
      imagen_url: productoEditar?.imagen_url ?? '',
      stock: productoEditar?.stock ?? 0,
      disponible: productoEditar?.disponible ?? true,
      categoria_id: productoEditar?.categoria_id ?? (categorias[0]?.id ?? 0),
    },
    onSubmit: async ({ value }) => {
      setSaving(true);
      try {
        await onSubmit({
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim(),
          precio_base: Number(value.precio_base),
          imagen_url: value.imagen_url.trim(),
          stock: Number(value.stock),
          disponible: value.disponible,
          categoria_id: Number(value.categoria_id),
        });
      } finally {
        setSaving(false);
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={productoEditar ? 'Editar producto' : 'Nuevo producto'}
      maxWidthClass="max-w-xl"
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
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const v = value.trim();
              if (!v) return 'El nombre es obligatorio.';
              if (v.length < 2) return 'Mínimo 2 caracteres.';
              return undefined;
            },
          }}
        >
          {(field) => (
            <Input
              label="Nombre del producto"
              name={field.name}
              placeholder="Ej. Pizza Fugazzeta"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={
                field.state.meta.errors.length > 0
                  ? String(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) =>
              !value || value <= 0 ? 'Seleccioná una categoría.' : undefined,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-stone-700"
              >
                Categoría
              </label>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value={0} disabled>
                  Seleccioná una categoría...
                </option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs font-medium text-red-600">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                Number.isNaN(value) || value < 0
                  ? 'El precio debe ser mayor o igual a 0.'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Precio ($)"
                name={field.name}
                type="number"
                min={0}
                step="0.01"
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

          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                !Number.isInteger(value) || value < 0
                  ? 'El stock debe ser un entero mayor o igual a 0.'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Stock inicial"
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
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              label="URL de imagen"
              name={field.name}
              type="url"
              placeholder="https://..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-stone-700"
              >
                Descripción
              </label>
              <textarea
                id={field.name}
                name={field.name}
                rows={3}
                placeholder="Ingredientes, porción, detalles..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
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
              Disponible para la venta
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
                {productoEditar ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}

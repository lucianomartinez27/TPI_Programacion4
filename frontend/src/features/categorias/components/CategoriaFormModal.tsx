import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import type { Categoria, CategoriaCreate } from '../types/categoria.types';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';

interface CategoriaFormModalProps {
  open: boolean;
  categoriaEditar: Categoria | null;
  onClose: () => void;
  onSubmit: (values: CategoriaCreate) => Promise<void>;
  serverError: string | null;
}

export function CategoriaFormModal({
  open,
  categoriaEditar,
  onClose,
  onSubmit,
  serverError,
}: CategoriaFormModalProps) {
  const [saving, setSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      nombre: categoriaEditar?.nombre ?? '',
      descripcion: categoriaEditar?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      setSaving(true);
      try {
        await onSubmit({
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim(),
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
      title={categoriaEditar ? 'Editar categoría' : 'Nueva categoría'}
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
              if (v.length < 2) return 'Debe tener al menos 2 caracteres.';
              if (v.length > 100) return 'Máximo 100 caracteres.';
              return undefined;
            },
          }}
        >
          {(field) => (
            <Input
              label="Nombre"
              name={field.name}
              placeholder="Ej. Postres"
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
                placeholder="Breve descripción de la categoría..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
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
                {categoriaEditar ? 'Guardar cambios' : 'Crear categoría'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}

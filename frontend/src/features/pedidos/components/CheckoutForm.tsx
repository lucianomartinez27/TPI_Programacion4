import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import type { FormaPago } from '../types/pedido.types';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

export interface CheckoutFormValues {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => Promise<void>;
  serverError: string | null;
}

const defaultValues: CheckoutFormValues = {
  direccion_entrega: '',
  forma_pago: 'EFECTIVO',
  notas: '',
};

export function CheckoutForm({ onSubmit, serverError }: CheckoutFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      try {
        await onSubmit(value);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="space-y-5"
    >
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const v = value.trim();
            if (!v) return 'La dirección de entrega es obligatoria.';
            if (v.length < 5) return 'Ingresá al menos 5 caracteres.';
            if (v.length > 200) return 'Máximo 200 caracteres.';
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            name={field.name}
            placeholder="Ej. Av. San Martín 1234, Piso 2 Depto B"
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

      <form.Field name="forma_pago">
        {(field) => (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">
              Forma de pago
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    value: 'EFECTIVO',
                    titulo: 'Efectivo',
                    desc: 'Pagás al recibir tu pedido',
                  },
                  {
                    value: 'TRANSFERENCIA',
                    titulo: 'Transferencia',
                    desc: 'Transferencia bancaria manual',
                  },
                ] as const
              ).map((opcion) => {
                const seleccionada = field.state.value === opcion.value;
                return (
                  <label
                    key={opcion.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                      seleccionada
                        ? 'border-orange-500 bg-orange-50/70'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={opcion.value}
                      checked={seleccionada}
                      onChange={() => field.handleChange(opcion.value)}
                      className="mt-1 accent-orange-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {opcion.titulo}
                      </p>
                      <p className="text-xs text-stone-500">{opcion.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{
          onChange: ({ value }) =>
            value.length > 500
              ? 'Las notas no pueden superar los 500 caracteres.'
              : undefined,
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-stone-700"
            >
              Notas adicionales (opcional)
            </label>
            <textarea
              id={field.name}
              name={field.name}
              rows={3}
              placeholder="Ej. Sin cebolla, tocar timbre 4B..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs font-medium text-red-600">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(s) => [s.canSubmit, s.isSubmitting] as const}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!canSubmit || submitting}
            isLoading={isSubmitting || submitting}
          >
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

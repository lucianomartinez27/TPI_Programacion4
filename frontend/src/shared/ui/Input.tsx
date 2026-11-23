import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-stone-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-300 focus:border-orange-500 focus:ring-orange-200'
        } disabled:bg-stone-100 disabled:text-stone-500 ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-stone-500">{helperText}</p>
      )}
    </div>
  );
}

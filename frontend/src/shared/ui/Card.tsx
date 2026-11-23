import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export function Card({ children, title, actions, className = '', ...rest }: CardProps) {
  return (
    <article
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
      {...rest}
    >
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </article>
  );
}

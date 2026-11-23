import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import {
  useNotificationStore,
  type NotificationType,
} from '@/store/notificationStore';

const estilos: Record<NotificationType, string> = {
  success: 'bg-emerald-700 text-white',
  error: 'bg-red-700 text-white',
  info: 'bg-stone-800 text-white',
};

export function Toast() {
  const id = useNotificationStore((s) => s.id);
  const message = useNotificationStore((s) => s.message);
  const type = useNotificationStore((s) => s.type);
  const show = useNotificationStore((s) => s.show);
  const hideNotification = useNotificationStore((s) => s.hideNotification);

  useEffect(() => {
    if (!show) return;
    const timer = window.setTimeout(hideNotification, 3500);
    return () => window.clearTimeout(timer);
  }, [id, show, hideNotification]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${estilos[type]}`}
    >
      {type === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0" />}
      {type === 'error' && <AlertCircle className="h-5 w-5 shrink-0" />}
      {type === 'info' && <Info className="h-5 w-5 shrink-0" />}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={hideNotification}
        className="rounded p-0.5 opacity-80 hover:opacity-100 cursor-pointer"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

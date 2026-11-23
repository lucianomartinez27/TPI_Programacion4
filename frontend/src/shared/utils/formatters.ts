export function formatPrecio(monto: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(monto);
}

export function formatFecha(isoDate: string): string {
  const fecha = new Date(isoDate);
  if (Number.isNaN(fecha.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fecha);
}

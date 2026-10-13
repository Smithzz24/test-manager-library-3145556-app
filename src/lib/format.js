const STATUS_LABELS = { open: 'Abierto', overdue: 'Vencido', closed: 'Cerrado' };
const ROLE_LABELS = { admin: 'Administrador', librarian: 'Bibliotecario' };

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || '—';
}

export function roleLabel(role) {
  return ROLE_LABELS[role] || role || '—';
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}
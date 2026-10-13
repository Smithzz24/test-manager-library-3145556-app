export const PAGE_SIZES = [10, 20, 50];
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_LOAN_ITEMS = 3;

const trimmed = (value) => (typeof value === 'string' ? value.trim() : '');

export function validateBook(data, { requireIsbn }) {
  const errors = {};
  if (!trimmed(data.title)) errors.title = 'El título es obligatorio.';
  else if (trimmed(data.title).length > 250) errors.title = 'Máximo 250 caracteres.';
  if (!trimmed(data.author)) errors.author = 'El autor es obligatorio.';
  else if (trimmed(data.author).length > 200) errors.author = 'Máximo 200 caracteres.';
  if (requireIsbn && !/^\d{13}$/.test(trimmed(data.isbn))) errors.isbn = 'El ISBN debe tener 13 dígitos.';
  if (!data.category_id) errors.category_id = 'Seleccione una categoría.';
  const copies = Number(data.total_copies);
  if (!Number.isInteger(copies) || copies < 1) errors.total_copies = 'Debe ser un entero mayor o igual a 1.';
  return errors;
}

export function validateMember(data) {
  const errors = {};
  if (!trimmed(data.full_name)) errors.full_name = 'El nombre es obligatorio.';
  else if (trimmed(data.full_name).length > 200) errors.full_name = 'Máximo 200 caracteres.';
  if (!trimmed(data.document_number)) errors.document_number = 'El documento es obligatorio.';
  else if (trimmed(data.document_number).length > 30) errors.document_number = 'Máximo 30 caracteres.';
  return errors;
}

export function validateLoan(memberId, bookIds) {
  const errors = {};
  if (!memberId) errors.member_id = 'Seleccione un socio.';
  if (bookIds.length < 1) errors.items = 'Seleccione al menos un libro.';
  else if (bookIds.length > MAX_LOAN_ITEMS) errors.items = `Máximo ${MAX_LOAN_ITEMS} libros por préstamo.`;
  else if (new Set(bookIds).size !== bookIds.length) errors.items = 'No puede repetir un libro en el mismo préstamo.';
  return errors;
}

export function validateUser(data) {
  const errors = {};
  if (!trimmed(data.username)) errors.username = 'El usuario es obligatorio.';
  else if (trimmed(data.username).length > 120) errors.username = 'Máximo 120 caracteres.';
  if (!data.password) errors.password = 'La contraseña es obligatoria.';
  return errors;
}

export function validateReportRange(from, to) {
  const errors = {};
  if (!from) errors.from = 'La fecha inicial es obligatoria.';
  if (!to) errors.to = 'La fecha final es obligatoria.';
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function totalPages(total, size) {
  if (!total || !size) return 1;
  return Math.max(1, Math.ceil(total / size));
}
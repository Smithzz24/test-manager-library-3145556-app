import { totalPages, PAGE_SIZES } from '../lib/validation.js';

export function ErrorBox({ error }) {
  if (!error) return null;
  const details = Array.isArray(error.details) ? error.details : [];
  return (
    <div className="alert error" role="alert">
      <strong>{error.message || 'Ocurrió un error.'}</strong>
      {error.code && error.code !== 'UNKNOWN' && <span className="code"> ({error.code})</span>}
      {details.length > 0 && (
        <ul>
          {details.map((detail, index) => (
            <li key={index}>
              {detail.field ? `${detail.field}: ` : ''}
              {detail.issue || JSON.stringify(detail)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Success({ children }) {
  if (!children) return null;
  return (
    <div className="alert success" role="status">
      {children}
    </div>
  );
}

export function Loading({ show }) {
  return show ? <p className="muted">Cargando…</p> : null;
}

export function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export function Pager({ page, size, total, onPage, onSize }) {
  const pages = totalPages(total, size);
  return (
    <div className="pager">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {pages} · {total ?? 0} resultados
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Siguiente
      </button>
      {onSize && (
        <select aria-label="Tamaño de página" value={size} onChange={(event) => onSize(Number(event.target.value))}>
          {PAGE_SIZES.map((value) => (
            <option key={value} value={value}>
              {value} por página
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
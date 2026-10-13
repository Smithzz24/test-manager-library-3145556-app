import { useState } from 'react';
import { useAuth } from '../auth/context.js';
import { ErrorBox, Field, Loading } from '../components/ui.jsx';
import { hasErrors, validateReportRange } from '../lib/validation.js';

export function ReportPage() {
  const { api } = useAuth();
  const [range, setRange] = useState({ from: '', to: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  async function submit(event) {
    event.preventDefault();
    const next = validateReportRange(range.from, range.to);
    setErrors(next);
    if (hasErrors(next)) return;
    setLoading(true);
    setError(null);
    try {
      setReport(await api.mostBorrowed(range));
    } catch (err) {
      setError(err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  const rows = report?.rows || [];
  return (
    <section>
      <h2>Libros más prestados</h2>
      <p className="muted">Ambas fechas son inclusivas.</p>
      <form className="filters" onSubmit={submit} noValidate>
        <Field label="Desde" error={errors.from}>
          <input type="date" value={range.from} onChange={(e) => setRange((p) => ({ ...p, from: e.target.value }))} />
        </Field>
        <Field label="Hasta" error={errors.to}>
          <input type="date" value={range.to} onChange={(e) => setRange((p) => ({ ...p, to: e.target.value }))} />
        </Field>
        <button type="submit" className="primary" disabled={loading}>
          Generar
        </button>
      </form>
      <ErrorBox error={error} />
      <Loading show={loading} />
      {report && rows.length === 0 && <p className="muted">No hubo préstamos en el rango.</p>}
      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Libro</th>
              <th>Categoría</th>
              <th>Veces prestado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.book_id}|${row.book_title}|${row.category_name}`}>
                <td>{row.book_title}</td>
                <td>{row.category_name}</td>
                <td>{row.times_borrowed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
import { useState } from 'react';
import { useAuth } from '../auth/context.js';
import { ErrorBox, Loading, Success } from '../components/ui.jsx';
import { formatDateTime, statusLabel } from '../lib/format.js';
import { useLoad } from '../lib/useLoad.js';
import { useNavigate } from '../lib/nav.js';

export function LoanDetailPage({ loanId, flash }) {
  const { api } = useAuth();
  const navigate = useNavigate();
  const loan = useLoad(() => api.getLoan(loanId), [loanId]);
  const [busyItem, setBusyItem] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(flash || '');

  async function returnItem(item) {
    if (!window.confirm(`¿Registrar la devolución de «${item.book_title}»?`)) return;
    setBusyItem(item.id);
    setError(null);
    setMessage('');
    try {
      await api.returnItem(loanId, item.id);
      setMessage(`Se registró la devolución de «${item.book_title}».`);
      loan.reload();
    } catch (err) {
      setError(err);
    } finally {
      setBusyItem(null);
    }
  }

  const data = loan.data;
  return (
    <section>
      <h2>Detalle del préstamo</h2>
      <ErrorBox error={loan.error} />
      <ErrorBox error={error} />
      <Success>{message}</Success>
      <Loading show={loan.loading} />
      {data && (
        <div className="card">
          <dl>
            <dt>Fecha</dt>
            <dd>{formatDateTime(data.loaned_at)}</dd>
            <dt>Estado</dt>
            <dd>
              <span className={`status ${data.status}`}>{statusLabel(data.status)}</span>
            </dd>
            <dt>Socio</dt>
            <dd>
              <button
                type="button"
                className="link"
                onClick={() => navigate('memberDetail', { memberId: data.member_id })}
              >
                Ver socio
              </button>
            </dd>
          </dl>
          <table>
            <thead>
              <tr>
                <th>Libro</th>
                <th>ISBN</th>
                <th>Categoría</th>
                <th>Vence</th>
                <th>Devuelto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(data.items || []).map((item) => (
                <tr key={item.id}>
                  <td>{item.book_title}</td>
                  <td>{item.isbn}</td>
                  <td>{item.category_name}</td>
                  <td>{formatDateTime(item.due_at)}</td>
                  <td>{item.returned_at ? formatDateTime(item.returned_at) : 'Pendiente'}</td>
                  <td className="row-actions">
                    {!item.returned_at && (
                      <button type="button" disabled={busyItem === item.id} onClick={() => returnItem(item)}>
                        {busyItem === item.id ? 'Registrando…' : 'Devolver'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button type="button" onClick={() => navigate('loans')}>
        Volver a préstamos
      </button>
    </section>
  );
}
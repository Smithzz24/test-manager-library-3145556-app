import { useState } from 'react';
import { useAuth } from '../auth/context.js';
import { ErrorBox, Loading, Pager } from '../components/ui.jsx';
import { formatDateTime, statusLabel } from '../lib/format.js';
import { useLoad } from '../lib/useLoad.js';
import { useNavigate } from '../lib/nav.js';
import { DEFAULT_PAGE_SIZE } from '../lib/validation.js';

export function LoansPage({ memberId, memberName }) {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState({ status: '', page: 1, size: DEFAULT_PAGE_SIZE });
  const loans = useLoad(
    () => api.listLoans({ ...query, memberId }),
    [query.status, query.page, query.size, memberId],
  );
  const items = loans.data?.items || [];

  return (
    <section>
      <div className="title-row">
        <h2>Préstamos</h2>
        <button type="button" className="primary" onClick={() => navigate('newLoan')}>
          Registrar préstamo
        </button>
      </div>
      <div className="filters">
        <select
          aria-label="Estado"
          value={query.status}
          onChange={(e) => setQuery((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
        >
          <option value="">Todos los estados</option>
          <option value="open">Abierto</option>
          <option value="overdue">Vencido</option>
          <option value="closed">Cerrado</option>
        </select>
        {memberId && (
          <span className="chip">
            Socio: {memberName || memberId}{' '}
            <button type="button" onClick={() => navigate('loans')}>
              Quitar filtro
            </button>
          </span>
        )}
      </div>
      <ErrorBox error={loans.error} />
      <Loading show={loans.loading} />
      {!loans.loading && !loans.error && items.length === 0 && <p className="muted">No hay préstamos.</p>}
      {items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Libros</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((loan) => (
              <tr key={loan.id}>
                <td>{formatDateTime(loan.loaned_at)}</td>
                <td>
                  <span className={`status ${loan.status}`}>{statusLabel(loan.status)}</span>
                </td>
                <td>{(loan.items || []).map((item) => item.book_title).join(', ')}</td>
                <td className="row-actions">
                  <button type="button" onClick={() => navigate('loanDetail', { loanId: loan.id })}>
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {loans.data && (
        <Pager
          page={query.page}
          size={query.size}
          total={loans.data.total}
          onPage={(page) => setQuery((prev) => ({ ...prev, page }))}
          onSize={(size) => setQuery((prev) => ({ ...prev, size, page: 1 }))}
        />
      )}
    </section>
  );
}
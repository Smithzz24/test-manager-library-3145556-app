import { useState } from 'react';
import { useAuth } from '../auth/context.js';
import { ErrorBox, Field, Loading } from '../components/ui.jsx';
import { useNavigate } from '../lib/nav.js';
import { hasErrors, MAX_LOAN_ITEMS, validateLoan } from '../lib/validation.js';

const PICKER_SIZE = 10;

export function NewLoanPage({ member: initialMember }) {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState(initialMember || null);
  const [books, setBooks] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  function addBook(book) {
    setBooks((prev) => (prev.some((b) => b.id === book.id) || prev.length >= MAX_LOAN_ITEMS ? prev : [...prev, book]));
  }

  async function submit() {
    const bookIds = books.map((b) => b.id);
    const next = validateLoan(member?.id, bookIds);
    setErrors(next);
    if (hasErrors(next)) return;
    setBusy(true);
    setError(null);
    try {
      const loan = await api.createLoan(member.id, bookIds);
      navigate('loanDetail', { loanId: loan.id, flash: 'Préstamo registrado.' });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2>Registrar préstamo</h2>
      <ErrorBox error={error} />
      <div className="grid-2">
        <div className="card">
          <h3>1. Socio</h3>
          {member ? (
            <p>
              <strong>{member.full_name}</strong> ({member.document_number}){' '}
              <button type="button" onClick={() => setMember(null)}>
                Cambiar
              </button>
            </p>
          ) : (
            <Picker
              placeholder="Buscar socio por nombre o documento"
              search={(q) => api.searchMembers({ q, page: 1, size: PICKER_SIZE })}
              render={(m) => `${m.full_name} · ${m.document_number}`}
              onPick={setMember}
            />
          )}
          {errors.member_id && <small className="field-error">{errors.member_id}</small>}
        </div>
        <div className="card">
          <h3>
            2. Libros ({books.length}/{MAX_LOAN_ITEMS})
          </h3>
          <ul className="selected">
            {books.map((book) => (
              <li key={book.id}>
                {book.title}{' '}
                <button type="button" onClick={() => setBooks((prev) => prev.filter((b) => b.id !== book.id))}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          {books.length < MAX_LOAN_ITEMS && (
            <Picker
              placeholder="Buscar libro por título o autor"
              search={(q) => api.searchBooks({ q, page: 1, size: PICKER_SIZE })}
              render={(b) => `${b.title} · ${b.author} (disponibles: ${b.available_copies})`}
              isDisabled={(b) => books.some((x) => x.id === b.id)}
              onPick={addBook}
            />
          )}
          {errors.items && <small className="field-error">{errors.items}</small>}
        </div>
      </div>
      <div className="actions">
        <button type="button" className="primary" disabled={busy} onClick={submit}>
          {busy ? 'Registrando…' : 'Registrar préstamo'}
        </button>
        <button type="button" onClick={() => navigate('loans')}>
          Cancelar
        </button>
      </div>
    </section>
  );
}

function Picker({ placeholder, search, render, onPick, isDisabled = () => false }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function run(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await search(q.trim());
      setResults(data?.items || []);
    } catch (err) {
      setError(err);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={run} className="picker">
      <Field label="Buscar">
        <input placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
      </Field>
      <button type="submit">Buscar</button>
      <ErrorBox error={error} />
      <Loading show={loading} />
      {results && results.length === 0 && <p className="muted">Sin resultados.</p>}
      {results && results.length > 0 && (
        <ul className="results">
          {results.map((item) => (
            <li key={item.id}>
              <span>{render(item)}</span>
              <button type="button" disabled={isDisabled(item)} onClick={() => onPick(item)}>
                Seleccionar
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
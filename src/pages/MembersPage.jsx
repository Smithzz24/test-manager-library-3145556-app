import { useState } from 'react';
import { useAuth } from '../auth/context.js';
import { ErrorBox, Field, Loading, Pager, Success } from '../components/ui.jsx';
import { useLoad } from '../lib/useLoad.js';
import { useNavigate } from '../lib/nav.js';
import { DEFAULT_PAGE_SIZE, hasErrors, validateMember } from '../lib/validation.js';

export function MembersPage() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState({ q: '', page: 1, size: DEFAULT_PAGE_SIZE });
  const [message, setMessage] = useState('');
  const members = useLoad(() => api.searchMembers(query), [query.q, query.page, query.size]);
  const items = members.data?.items || [];

  return (
    <section>
      <h2>Socios</h2>
      <MemberForm
        onCreated={(member) => {
          setMessage(`Se registró a ${member.full_name}.`);
          members.reload();
        }}
      />
      <Success>{message}</Success>
      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery((prev) => ({ ...prev, q: draft.trim(), page: 1 }));
        }}
      >
        <input placeholder="Buscar por nombre o documento" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit">Buscar</button>
      </form>
      <ErrorBox error={members.error} />
      <Loading show={members.loading} />
      {!members.loading && !members.error && items.length === 0 && <p className="muted">No hay socios.</p>}
      {items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((member) => (
              <tr key={member.id}>
                <td>{member.full_name}</td>
                <td>{member.document_number}</td>
                <td className="row-actions">
                  <button type="button" onClick={() => navigate('memberDetail', { memberId: member.id })}>
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {members.data && (
        <Pager
          page={query.page}
          size={query.size}
          total={members.data.total}
          onPage={(page) => setQuery((prev) => ({ ...prev, page }))}
          onSize={(size) => setQuery((prev) => ({ ...prev, size, page: 1 }))}
        />
      )}
    </section>
  );
}

function MemberForm({ onCreated }) {
  const { api } = useAuth();
  const [form, setForm] = useState({ full_name: '', document_number: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const next = validateMember(form);
    setErrors(next);
    if (hasErrors(next)) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api.createMember({
        full_name: form.full_name.trim(),
        document_number: form.document_number.trim(),
      });
      setForm({ full_name: '', document_number: '' });
      onCreated(created);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form inline" onSubmit={submit} noValidate>
      <h3>Nuevo socio</h3>
      <ErrorBox error={error} />
      <Field label="Nombre completo" error={errors.full_name}>
        <input
          value={form.full_name}
          maxLength={200}
          onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
        />
      </Field>
      <Field label="Número de documento" error={errors.document_number}>
        <input
          value={form.document_number}
          maxLength={30}
          onChange={(e) => setForm((prev) => ({ ...prev, document_number: e.target.value }))}
        />
      </Field>
      <button type="submit" className="primary" disabled={busy}>
        {busy ? 'Guardando…' : 'Registrar socio'}
      </button>
    </form>
  );
}
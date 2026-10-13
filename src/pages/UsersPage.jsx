import { useState } from 'react';
import { useAuth } from '../auth/context.js';
import { ErrorBox, Field, Success } from '../components/ui.jsx';
import { hasErrors, validateUser } from '../lib/validation.js';

export function UsersPage() {
  const { api } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const next = validateUser(form);
    setErrors(next);
    if (hasErrors(next)) return;
    setBusy(true);
    setError(null);
    setMessage('');
    try {
      const user = await api.createUser({ username: form.username, password: form.password });
      setMessage(`Se creó el bibliotecario «${user.username}».`);
      setForm({ username: '', password: '' });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2>Crear bibliotecario</h2>
      <form className="card form" onSubmit={submit} noValidate>
        <ErrorBox error={error} />
        <Success>{message}</Success>
        <Field label="Usuario" error={errors.username}>
          <input
            value={form.username}
            maxLength={120}
            autoComplete="off"
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          />
        </Field>
        <Field label="Contraseña" error={errors.password}>
          <input
            type="password"
            value={form.password}
            autoComplete="new-password"
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
        </Field>
        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Creando…' : 'Crear bibliotecario'}
        </button>
      </form>
    </section>
  );
}
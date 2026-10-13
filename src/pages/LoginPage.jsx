import { useState } from 'react';
import { useAuth } from '../auth/context.js';
import { ErrorBox, Field } from '../components/ui.jsx';
import { HealthBadge } from '../components/HealthBadge.jsx';

export function LoginPage() {
  const { login, notice } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (!username.trim()) next.username = 'Ingrese su usuario.';
    if (!password) next.password = 'Ingrese su contraseña.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError(err);
      setPassword('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <form className="card" onSubmit={submit} noValidate>
        <h1>Manager Library</h1>
        <p className="muted">Ingrese con su cuenta de administrador o bibliotecario.</p>
        <HealthBadge />
        {notice && <div className="alert info">{notice}</div>}
        <ErrorBox error={error} />
        <Field label="Usuario" error={errors.username}>
          <input value={username} autoComplete="username" onChange={(e) => setUsername(e.target.value)} />
        </Field>
        <Field label="Contraseña" error={errors.password}>
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
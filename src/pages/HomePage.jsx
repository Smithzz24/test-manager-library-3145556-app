import { useAuth } from '../auth/context.js';
import { HealthBadge } from '../components/HealthBadge.jsx';
import { roleLabel } from '../lib/format.js';
import { useNavigate } from '../lib/nav.js';

export function HomePage() {
  const { session, isAdmin } = useAuth();
  const navigate = useNavigate();
  return (
    <section>
      <h2>Inicio</h2>
      <p>
        Sesión iniciada como <strong>{session.username}</strong> ({roleLabel(session.role)}).
      </p>
      <p>
        Estado del servicio: <HealthBadge />
      </p>
      <div className="actions">
        <button type="button" onClick={() => navigate('books')}>Buscar libros</button>
        <button type="button" onClick={() => navigate('members')}>Socios</button>
        <button type="button" onClick={() => navigate('newLoan')}>Registrar préstamo</button>
        <button type="button" onClick={() => navigate('loans')}>Préstamos</button>
        {isAdmin && <button type="button" onClick={() => navigate('report')}>Reporte</button>}
      </div>
    </section>
  );
}
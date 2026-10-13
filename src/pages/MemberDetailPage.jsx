import { useAuth } from '../auth/context.js';
import { ErrorBox, Loading } from '../components/ui.jsx';
import { useLoad } from '../lib/useLoad.js';
import { useNavigate } from '../lib/nav.js';

export function MemberDetailPage({ memberId }) {
  const { api } = useAuth();
  const navigate = useNavigate();
  const member = useLoad(() => api.getMember(memberId), [memberId]);

  return (
    <section>
      <h2>Detalle del socio</h2>
      <ErrorBox error={member.error} />
      <Loading show={member.loading} />
      {member.data && (
        <div className="card">
          <dl>
            <dt>Nombre</dt>
            <dd>{member.data.full_name}</dd>
            <dt>Documento</dt>
            <dd>{member.data.document_number}</dd>
            <dt>Libros sin devolver</dt>
            <dd>{member.data.active_loans}</dd>
          </dl>
          <div className="actions">
            <button type="button" onClick={() => navigate('loans', { memberId, memberName: member.data.full_name })}>
              Ver préstamos
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => navigate('newLoan', { member: member.data })}
            >
              Registrar préstamo
            </button>
          </div>
        </div>
      )}
      <button type="button" onClick={() => navigate('members')}>
        Volver a socios
      </button>
    </section>
  );
}
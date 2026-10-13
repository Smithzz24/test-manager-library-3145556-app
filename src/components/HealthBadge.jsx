import { useEffect, useState } from 'react';
import { useAuth } from '../auth/context.js';

export function HealthBadge() {
  const { api } = useAuth();
  const [state, setState] = useState({ status: 'checking', message: 'Verificando API…' });

  useEffect(() => {
    let active = true;
    api.health().then(
      (body) =>
        active &&
        setState(
          body && body.status === 'ok'
            ? { status: 'ok', message: 'API disponible' }
            : { status: 'down', message: 'Respuesta de salud inesperada' },
        ),
      (error) => active && setState({ status: 'down', message: `API no disponible: ${error.message}` }),
    );
    return () => {
      active = false;
    };
  }, [api]);

  return <span className={`health ${state.status}`}>{state.message}</span>;
}
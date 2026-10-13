import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createApiClient } from '../api/client.js';
import { createEndpoints } from '../api/endpoints.js';
import { AuthContext } from './context.js';

// The session (including the token) lives only in React memory; it is never persisted.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [notice, setNotice] = useState('');
  const tokenRef = useRef(null);

  const logout = useCallback((message = '') => {
    tokenRef.current = null;
    setSession(null);
    setNotice(message);
  }, []);

  const api = useMemo(() => {
    const client = createApiClient({
      getToken: () => tokenRef.current,
      onUnauthorized: () => logout('Su sesión expiró o no es válida. Inicie sesión de nuevo.'),
    });
    return createEndpoints(client);
  }, [logout]);

  const login = useCallback(
    async (username, password) => {
      const result = await api.login(username, password);
      tokenRef.current = result.access_token;
      setNotice('');
      setSession({
        username: username.trim().toLowerCase(),
        role: result.role,
        expiresAt: Date.now() + Number(result.expires_in || 0) * 1000,
      });
    },
    [api],
  );

  useEffect(() => {
    if (!session || !session.expiresAt) return undefined;
    const remaining = session.expiresAt - Date.now();
    const timer = setTimeout(
      () => logout('Su sesión expiró. Inicie sesión de nuevo.'),
      Math.max(0, Math.min(remaining, 2147483647)),
    );
    return () => clearTimeout(timer);
  }, [session, logout]);

  const value = useMemo(
    () => ({ session, isAdmin: session?.role === 'admin', api, login, logout, notice }),
    [session, api, login, logout, notice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
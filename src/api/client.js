export const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = Array.isArray(details) ? details : [];
  }
}

const GENERIC_MESSAGES = {
  0: 'No se pudo conectar con el servidor.',
  401: 'La sesión no es válida o expiró.',
  403: 'No tiene permisos para esta operación.',
  404: 'El recurso no existe.',
  409: 'La operación entra en conflicto con el estado actual.',
  422: 'Los datos enviados no son válidos.',
};

export function normalizePaginationQuery(params = {}) {
  const normalized = { ...params };
  if ('page' in normalized) {
    const page = Number(normalized.page);
    normalized.page = Number.isInteger(page) && page >= 1 ? page : 1;
  }
  if ('size' in normalized) {
    const size = Number(normalized.size);
    normalized.size = Number.isInteger(size) && size >= 1 && size <= 50 ? size : 20;
  }
  return normalized;
}

export function buildQuery(params = {}) {
  const safe = normalizePaginationQuery(params);
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(safe)) {
    if (value === undefined || value === null || value === '') continue;
    search.append(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

export async function toApiError(response) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const status = response.status;
  if (body && typeof body === 'object' && typeof body.message === 'string') {
    return new ApiError(status, body.code || 'UNKNOWN', body.message, body.details);
  }
  const message = GENERIC_MESSAGES[status] || 'Ocurrió un error inesperado en el servidor.';
  return new ApiError(status, status >= 500 ? 'INTERNAL_ERROR' : 'UNKNOWN', message, []);
}

export function createApiClient({ getToken, onUnauthorized, fetchImpl } = {}) {
  const doFetch = fetchImpl || ((...args) => globalThis.fetch(...args));

  async function request(method, path, { query, body, form } = {}) {
    const token = getToken ? getToken() : null;
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    let payload;
    if (form) {
      payload = form;
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }

    let response;
    try {
      response = await doFetch(`${API_BASE}${path}${buildQuery(query)}`, { method, headers, body: payload });
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', GENERIC_MESSAGES[0]);
    }

    if (!response.ok) {
      const error = await toApiError(response);
      if (response.status === 401 && token && onUnauthorized) onUnauthorized(error);
      throw error;
    }
    if (response.status === 204) return null;
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError(response.status, 'INVALID_RESPONSE', 'La respuesta del servidor no es válida.');
    }
  }

  return {
    request,
    get: (path, query) => request('GET', path, { query }),
    post: (path, body) => request('POST', path, { body }),
    put: (path, body) => request('PUT', path, { body }),
    del: (path) => request('DELETE', path),
    putForm: (path, form) => request('PUT', path, { form }),
  };
}
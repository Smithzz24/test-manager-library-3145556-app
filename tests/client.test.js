import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, buildQuery, createApiClient, normalizePaginationQuery } from '../src/api/client.js';
import { createEndpoints } from '../src/api/endpoints.js';

function fakeFetch(responses) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    const next = responses.shift();
    return new Response(next.body === undefined ? null : JSON.stringify(next.body), { status: next.status });
  };
  fn.calls = calls;
  return fn;
}

test('buildQuery omits empty values and normalizes pagination', () => {
  assert.equal(buildQuery({ q: '', category_id: null, page: 1, size: 20 }), '?page=1&size=20');
  assert.equal(buildQuery({}), '');
  assert.deepEqual(normalizePaginationQuery({ page: '0', size: '99' }), { page: 1, size: 20 });
  assert.deepEqual(normalizePaginationQuery({ page: 2, size: '10' }), { page: 2, size: 10 });
});

test('sends bearer token and JSON body to /api/v1', async () => {
  const fetchImpl = fakeFetch([{ status: 201, body: { id: 'm1' } }]);
  const api = createEndpoints(createApiClient({ getToken: () => 'tok', fetchImpl }));
  const result = await api.createMember({ full_name: 'Ana', document_number: '123' });
  assert.deepEqual(result, { id: 'm1' });
  const { url, init } = fetchImpl.calls[0];
  assert.equal(url, '/api/v1/members');
  assert.equal(init.method, 'POST');
  assert.equal(init.headers.Authorization, 'Bearer tok');
  assert.deepEqual(JSON.parse(init.body), { full_name: 'Ana', document_number: '123' });
});

test('maps book search filters to contract query names', async () => {
  const fetchImpl = fakeFetch([{ status: 200, body: { items: [], page: 2, size: 20, total: 0 } }]);
  const api = createEndpoints(createApiClient({ getToken: () => 't', fetchImpl }));
  await api.searchBooks({ q: 'cien', categoryId: 'c1', page: 2, size: 20 });
  assert.equal(fetchImpl.calls[0].url, '/api/v1/books?q=cien&category_id=c1&page=2&size=20');
});

test('loan creation sends member and item book ids', async () => {
  const fetchImpl = fakeFetch([{ status: 201, body: { id: 'l1' } }]);
  const api = createEndpoints(createApiClient({ getToken: () => 't', fetchImpl }));
  await api.createLoan('m1', ['b1', 'b2']);
  assert.deepEqual(JSON.parse(fetchImpl.calls[0].init.body), {
    member_id: 'm1',
    items: [{ book_id: 'b1' }, { book_id: 'b2' }],
  });
});

test('204 responses resolve to null', async () => {
  const fetchImpl = fakeFetch([{ status: 204 }]);
  const api = createEndpoints(createApiClient({ getToken: () => 't', fetchImpl }));
  assert.equal(await api.withdrawBook('b1'), null);
});

test('error envelope becomes ApiError with code, message and details', async () => {
  const body = { code: 'BOOK_NOT_AVAILABLE', message: 'Sin ejemplares.', details: [{ field: 'items[0].book_id', issue: 'x' }] };
  const fetchImpl = fakeFetch([{ status: 409, body }]);
  const api = createEndpoints(createApiClient({ getToken: () => 't', fetchImpl }));
  await assert.rejects(api.createLoan('m', ['b']), (err) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 409);
    assert.equal(err.code, 'BOOK_NOT_AVAILABLE');
    assert.equal(err.details.length, 1);
    return true;
  });
});

test('authenticated 401 triggers onUnauthorized; login 401 without token does not', async () => {
  let called = 0;
  const unauth = { code: 'UNAUTHENTICATED', message: 'No autenticado.', details: [] };
  const fetchImpl = fakeFetch([
    { status: 401, body: unauth },
    { status: 401, body: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.', details: [] } },
  ]);
  let token = 'expired';
  const api = createEndpoints(
    createApiClient({ getToken: () => token, onUnauthorized: () => called++, fetchImpl }),
  );
  await assert.rejects(api.categories(), { code: 'UNAUTHENTICATED' });
  assert.equal(called, 1);
  token = null;
  await assert.rejects(api.login('ana', 'bad'), { code: 'INVALID_CREDENTIALS' });
  assert.equal(called, 1);
  assert.equal(fetchImpl.calls[1].init.headers.Authorization, undefined);
});

test('non-JSON server failure produces a generic Spanish message', async () => {
  const fetchImpl = async () => new Response('<html>', { status: 500 });
  const api = createEndpoints(createApiClient({ getToken: () => 't', fetchImpl }));
  await assert.rejects(api.health(), (err) => err.status === 500 && err.code === 'INTERNAL_ERROR');
});

test('network failure produces NETWORK_ERROR', async () => {
  const fetchImpl = async () => {
    throw new TypeError('fetch failed');
  };
  const api = createEndpoints(createApiClient({ getToken: () => null, fetchImpl }));
  await assert.rejects(api.health(), { code: 'NETWORK_ERROR', status: 0 });
});
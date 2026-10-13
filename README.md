# test-manager-library-3145556-app

> Integración local: Docker Compose del repositorio hermano `infra` publica esta
> aplicación en `http://localhost:8080`. Nginx reenvía `/api` al backend; el
> navegador no recibe credenciales de PostgreSQL. Para desarrollo se mantiene
> Vite en `http://localhost:5173`. Portadas y lista operativa de vencidos quedan
> ocultas mientras el backend no publique esas funciones. Los textos originales
> y las notas anteriores se conservan.

> **Prueba técnica · Ficha ADSO 3145556**
> Entrega: **martes 13 de octubre de 2026, a las 5:00 p. m.** (17:00, hora Colombia).

Este repositorio es el **frontend** de *Manager Library*, en **React**. **Empieza vacío a propósito**: se construye en el fork de cada aprendiz.

## Instrucciones

Cada aprendiz debe **crear el fork** de los seis repositorios del proyecto y **resolver el proyecto
con el spec planteado**.

1. Hacer fork, a su cuenta de GitHub, de cada repositorio de la tabla del final.
2. Leer el spec en [`test-manager-library-3145556-docs`](https://github.com/code-sena/test-manager-library-3145556-docs).
   Se entrega en dos versiones: `spec-python/` y `spec-.net/`.
3. Desarrollar en los forks.

## El reto se desarrolla con React y PHP (Laravel)

El spec está escrito para Python y para .NET, pero el reto **no** se hace en esos lenguajes:

| Capa | Tecnología del reto |
|---|---|
| Frontend | React |
| Backend | PHP con Laravel |

Lo que el spec define sobre el negocio —historias, criterios de aceptación, reglas, contrato de la
API, modelo de datos— se respeta. Lo que define sobre la tecnología se traduce a React y Laravel.

## La prueba no consiste en escribir el código

El propósito principal es ver la **capacidad de desempeño con SDD** (*Spec-Driven Development*,
desarrollo guiado por especificación): cómo se lee, se interpreta y se aplica una especificación
para llevarla a un stack distinto. El código es el medio, no el fin.

## Entrega

Cuenta lo que quede **subido a los forks antes de las 5:00 p. m.** (17:00). Lo que llegue después no se revisa.
No hay prórroga: suban avances parciales con commits pequeños durante la prueba.

## Los seis repositorios

| Repositorio | Qué va ahí |
|---|---|
| [`test-manager-library-3145556-docs`](https://github.com/code-sena/test-manager-library-3145556-docs) | El spec: `spec-python/` y `spec-.net/` |
| [`test-manager-library-3145556-api`](https://github.com/code-sena/test-manager-library-3145556-api) | Backend en PHP (Laravel) |
| [`test-manager-library-3145556-app`](https://github.com/code-sena/test-manager-library-3145556-app) | Frontend en React |
| [`test-manager-library-3145556-page`](https://github.com/code-sena/test-manager-library-3145556-page) | Sitio público estático de presentación |
| [`test-manager-library-3145556-infra`](https://github.com/code-sena/test-manager-library-3145556-infra) | Contenedores, red, volúmenes y motor de base de datos vacío |
| [`test-manager-library-3145556-tool`](https://github.com/code-sena/test-manager-library-3145556-tool) | Utilidades: sembrador de datos de demostración |

---

## Implementation notes (English)

React 19 + Vite 7 single-page frontend for the Manager Library API contract (`/api/v1`). UI text is Spanish; code and these notes are English.

### Commands

```bash
npm install        # uses package-lock.json
npm run dev        # http://localhost:5173, proxies /api to http://127.0.0.1:8000
npm run lint       # ESLint (flat config)
npm test           # node:test unit tests for the API client and input validation helpers
npm run build      # production bundle in dist/
```

Set `VITE_API_PROXY_TARGET` to proxy `/api` to another backend during `dev`/`preview`. The production bundle calls the relative path `/api/v1`, so the serving web server (for example nginx serving `dist/`) must forward `/api` to the backend.

### Current delivery status

This frontend is functionally implemented for the available contract surface, but several API-backed features are intentionally deferred until the backend exposes them or confirms the contract.

- Login, books, members, loans, and the admin report are wired to `/api/v1` with in-memory tokens only.
- The token is kept only in memory (never `localStorage`/`sessionStorage`); reloading the page signs out.
- Pagination is guarded in the client to only send positive `page` values and `size` values in the valid range `1..50` while keeping the default `page=1` / `size=20` contract.
- Overdue UI is intentionally hidden because `/loans/overdue` is not yet available and the response contract remains pending.
- Cover upload and removal UI is hidden while the backend contract for cover endpoints is still pending.
- The README documents the deferred work explicitly rather than claiming full completion.

### Features implemented

- Login (`POST /auth/login`); session ends on logout, on `expires_in`, or on any 401.
- Role-based navigation: admin sees book management and the most-borrowed report; librarians do not.
- Real API health indicator (`GET /health`).
- Books: text search, category filter, pagination with 10/20/50 choices, admin create, edit (ISBN is read-only on update), and soft delete.
- Members: search with pagination, create, and detail with `active_loans`.
- Loans: create with 1–3 distinct books, list with status filter (and member filter from member detail), detail, and per-item return.
- Report (admin): most-borrowed books for an inclusive `from`/`to` date range.
- Errors use the contract envelope (`code`, `message`, `details`); client-side checks only guard required/format inputs, the server stays authoritative.

### Deferred / not yet implemented

- Overdue list (`GET /loans/overdue`) is intentionally hidden until the backend exposes it.
- Cover upload/removal and cover download are deferred while the backend contract is still pending.
- Loan list date filters (`from`, `to`) are not exposed because their semantics are not settled.
- Invalid pagination is not exposed in the UI; the client sanitizes only valid range values before request dispatch.
- End-to-end verification with the Laravel backend is still pending.
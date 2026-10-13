import { useState } from 'react';
import { useAuth } from '../auth/context.js';
import { ErrorBox, Loading, Pager, Success } from '../components/ui.jsx';
import { useLoad } from '../lib/useLoad.js';
import { useNavigate } from '../lib/nav.js';
import { DEFAULT_PAGE_SIZE } from '../lib/validation.js';

export function BooksPage({ flash }) {
  const { api, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState({ q: '', categoryId: '', page: 1, size: DEFAULT_PAGE_SIZE });
  const [actionError, setActionError] = useState(null);
  const [message, setMessage] = useState(flash || '');

  const categories = useLoad(() => api.categories(), []);
  const books = useLoad(() => api.searchBooks(query), [query.q, query.categoryId, query.page, query.size]);

  function search(event) {
    event.preventDefault();
    setQuery((prev) => ({ ...prev, q: draft.trim(), page: 1 }));
  }

  async function withdraw(book) {
    if (!window.confirm(`¿Retirar «${book.title}» del catálogo?`)) return;
    setActionError(null);
    setMessage('');
    try {
      await api.withdrawBook(book.id);
      setMessage(`Se retiró «${book.title}».`);
      books.reload();
    } catch (err) {
      setActionError(err);
    }
  }

  const categoryList = Array.isArray(categories.data) ? categories.data : [];
  const items = books.data?.items || [];

  return (
    <section>
      <div className="title-row">
        <h2>Libros</h2>
        {isAdmin && (
          <button type="button" className="primary" onClick={() => navigate('bookForm')}>
            Nuevo libro
          </button>
        )}
      </div>
      <form className="filters" onSubmit={search}>
        <input
          placeholder="Buscar por título o autor"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <select
          aria-label="Categoría"
          value={query.categoryId}
          onChange={(e) => setQuery((prev) => ({ ...prev, categoryId: e.target.value, page: 1 }))}
        >
          <option value="">Todas las categorías</option>
          {categoryList.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button type="submit">Buscar</button>
      </form>
      <ErrorBox error={categories.error} />
      <ErrorBox error={books.error} />
      <ErrorBox error={actionError} />
      <Success>{message}</Success>
      <Loading show={books.loading} />
      {!books.loading && !books.error && items.length === 0 && <p className="muted">No hay libros que coincidan.</p>}
      {items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>ISBN</th>
              <th>Categoría</th>
              <th>Disponibles</th>
              {isAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.isbn}</td>
                <td>{book.category?.name}</td>
                <td>
                  {book.available_copies} / {book.total_copies}
                </td>
                {isAdmin && (
                  <td className="row-actions">
                    <button type="button" onClick={() => navigate('bookForm', { bookId: book.id })}>
                      Editar
                    </button>
                    <button type="button" className="danger" onClick={() => withdraw(book)}>
                      Retirar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {books.data && (
        <Pager
          page={query.page}
          size={query.size}
          total={books.data.total}
          onPage={(page) => setQuery((prev) => ({ ...prev, page }))}
          onSize={(size) => setQuery((prev) => ({ ...prev, size, page: 1 }))}
        />
      )}
    </section>
  );
}
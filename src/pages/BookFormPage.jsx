import { useEffect, useState } from 'react';
import { useAuth } from '../auth/context.js';
import { ErrorBox, Field, Loading } from '../components/ui.jsx';
import { useLoad } from '../lib/useLoad.js';
import { useNavigate } from '../lib/nav.js';
import { hasErrors, validateBook } from '../lib/validation.js';

const EMPTY = { title: '', author: '', isbn: '', category_id: '', total_copies: '1' };
const COVER_FEATURE_ENABLED = false;

export function BookFormPage({ bookId }) {
  const { api } = useAuth();
  const navigate = useNavigate();
  const editing = Boolean(bookId);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const categories = useLoad(() => api.categories(), []);
  const book = useLoad(() => (editing ? api.getBook(bookId) : Promise.resolve(null)), [bookId]);

  useEffect(() => {
    if (book.data) {
      setForm({
        title: book.data.title || '',
        author: book.data.author || '',
        isbn: book.data.isbn || '',
        category_id: book.data.category?.id || '',
        total_copies: String(book.data.total_copies ?? 1),
      });
    }
  }, [book.data]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const next = validateBook(form, { requireIsbn: !editing });
    setErrors(next);
    if (hasErrors(next)) return;
    setBusy(true);
    setError(null);
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      category_id: form.category_id,
      total_copies: Number(form.total_copies),
    };
    try {
      if (editing) {
        await api.updateBook(bookId, payload);
        navigate('books', { flash: `Se actualizÃ³ Â«${payload.title}Â».` });
      } else {
        await api.createBook({ ...payload, isbn: form.isbn.trim() });
        navigate('books', { flash: `Se creÃ³ Â«${payload.title}Â».` });
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const categoryList = Array.isArray(categories.data) ? categories.data : [];

  return (
    <section>
      <h2>{editing ? 'Editar libro' : 'Nuevo libro'}</h2>
      <ErrorBox error={categories.error} />
      <ErrorBox error={book.error} />
      <Loading show={editing && book.loading} />
      {(!editing || book.data) && (
        <form className="card form" onSubmit={submit} noValidate>
          <ErrorBox error={error} />
          <Field label="TÃ­tulo" error={errors.title}>
            <input value={form.title} maxLength={250} onChange={set('title')} />
          </Field>
          <Field label="Autor" error={errors.author}>
            <input value={form.author} maxLength={200} onChange={set('author')} />
          </Field>
          <Field label="ISBN (13 dÃ­gitos)" error={errors.isbn}>
            <input
              value={form.isbn}
              inputMode="numeric"
              maxLength={13}
              disabled={editing}
              title={editing ? 'El ISBN no se puede modificar.' : undefined}
              onChange={set('isbn')}
            />
          </Field>
          <Field label="CategorÃ­a" error={errors.category_id}>
            <select value={form.category_id} onChange={set('category_id')}>
              <option value="">Seleccioneâ€¦</option>
              {categoryList.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ejemplares totales" error={errors.total_copies}>
            <input type="number" min={1} step={1} value={form.total_copies} onChange={set('total_copies')} />
          </Field>
          {editing && book.data && (
            <p className="muted">Disponibles actualmente: {book.data.available_copies}</p>
          )}
          <div className="actions">
            <button type="submit" className="primary" disabled={busy}>
              {busy ? 'Guardandoâ€¦' : 'Guardar'}
            </button>
            <button type="button" onClick={() => navigate('books')}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      {COVER_FEATURE_ENABLED && editing && book.data && <CoverPanel book={book.data} onChanged={book.reload} />}
    </section>
  );
}

function CoverPanel({ book, onChanged }) {
  const { api } = useAuth();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setFile(null);
      onChanged();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  function upload(event) {
    event.preventDefault();
    if (!file) {
      setError({ message: 'Seleccione una imagen JPG o PNG.' });
      return;
    }
    run(() => api.uploadCover(book.id, file), 'Portada cargada.');
  }

  return (
    <form className="card form" onSubmit={upload}>
      <h3>Portada</h3>
      <p className="muted">{book.cover_key ? 'El libro tiene portada registrada.' : 'El libro no tiene portada.'}</p>
      <ErrorBox error={error} />
      <div className="actions">
        <button type="submit" disabled={busy}>Subir portada</button>
        {book.cover_key && (
          <button
            type="button"
            className="danger"
            disabled={busy}
            onClick={() => run(() => api.deleteCover(book.id), 'Portada eliminada.')}
          >
            Quitar portada
          </button>
        )}
      </div>
    </form>
  );
}

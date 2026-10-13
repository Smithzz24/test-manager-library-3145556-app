export function createEndpoints(client) {
  const id = (value) => encodeURIComponent(value);
  return {
    health: () => client.get('/health'),
    login: (username, password) => client.post('/auth/login', { username, password }),

    createUser: (data) => client.post('/users', { ...data, role: 'librarian' }),

    categories: () => client.get('/categories'),

    searchBooks: ({ q, categoryId, page, size }) =>
      client.get('/books', { q, category_id: categoryId, page, size }),
    getBook: (bookId) => client.get(`/books/${id(bookId)}`),
    createBook: (data) => client.post('/books', data),
    updateBook: (bookId, data) => client.put(`/books/${id(bookId)}`, data),
    withdrawBook: (bookId) => client.del(`/books/${id(bookId)}`),
    uploadCover: (bookId, file) => {
      const form = new FormData();
      form.append('file', file);
      return client.putForm(`/books/${id(bookId)}/cover`, form);
    },
    deleteCover: (bookId) => client.del(`/books/${id(bookId)}/cover`),

    searchMembers: ({ q, page, size }) => client.get('/members', { q, page, size }),
    getMember: (memberId) => client.get(`/members/${id(memberId)}`),
    createMember: (data) => client.post('/members', data),

    createLoan: (memberId, bookIds) =>
      client.post('/loans', { member_id: memberId, items: bookIds.map((bookId) => ({ book_id: bookId })) }),
    listLoans: ({ status, memberId, page, size }) =>
      client.get('/loans', { status, member_id: memberId, page, size }),
    getLoan: (loanId) => client.get(`/loans/${id(loanId)}`),
    returnItem: (loanId, itemId) => client.post(`/loans/${id(loanId)}/items/${id(itemId)}/return`),
    overdue: () => client.get('/loans/overdue'),

    mostBorrowed: ({ from, to }) => client.get('/reports/most-borrowed', { from, to }),
  };
}
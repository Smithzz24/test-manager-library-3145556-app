import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasErrors, totalPages, validateBook, validateLoan, validateMember } from '../src/lib/validation.js';

const book = { title: 'T', author: 'A', isbn: '9780307474728', category_id: 'c', total_copies: '2' };

test('book validation requires a 13-digit ISBN only on create', () => {
  assert.equal(hasErrors(validateBook(book, { requireIsbn: true })), false);
  assert.ok(validateBook({ ...book, isbn: '978-03' }, { requireIsbn: true }).isbn);
  assert.equal(validateBook({ ...book, isbn: '' }, { requireIsbn: false }).isbn, undefined);
});

test('book validation rejects total copies below 1 or non-integer', () => {
  assert.ok(validateBook({ ...book, total_copies: '0' }, { requireIsbn: false }).total_copies);
  assert.ok(validateBook({ ...book, total_copies: '1.5' }, { requireIsbn: false }).total_copies);
});

test('loan validation enforces 1 to 3 distinct books and a member', () => {
  assert.ok(validateLoan('', ['a']).member_id);
  assert.ok(validateLoan('m', []).items);
  assert.ok(validateLoan('m', ['a', 'b', 'c', 'd']).items);
  assert.ok(validateLoan('m', ['a', 'a']).items);
  assert.equal(hasErrors(validateLoan('m', ['a', 'b', 'c'])), false);
});

test('member validation requires name and document', () => {
  assert.deepEqual(Object.keys(validateMember({ full_name: ' ', document_number: '' })).sort(), [
    'document_number',
    'full_name',
  ]);
});

test('totalPages', () => {
  assert.equal(totalPages(0, 20), 1);
  assert.equal(totalPages(41, 20), 3);
});
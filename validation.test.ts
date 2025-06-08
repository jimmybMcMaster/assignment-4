import { expect, test } from 'vitest'
import assignment from './adapter/assignment-4.js'

test('add 1 + 2 = 3', () => {
  expect((1 + 2)).toBe(3)
})

test('subtract 100 - 50 = 50', () => {
    expect((100 -50)).toBe(50)
})

test('Concat: James Barbour', () => {
    expect((`James` + `Barbour`)).toBe(`JamesBarbour`)
})

test('place books on shelf and find them', async () => {
  const bookId = await assignment.createOrUpdateBook({
    name: 'Test Book 1',
    author: 'Test Author',
    description: 'Test Description',
    price: 10,
    image: 'test.jpg'
  })
  
  await assignment.placeBooksOnShelf(bookId, 5, 'A1')
  const locations = await assignment.findBookOnShelf(bookId)
  expect(locations[0].count).toBe(5)
})

test('order books and list pending orders', async () => {
  const bookId = await assignment.createOrUpdateBook({
    name: 'Test Book 2',
    author: 'Test Author',
    description: 'Test Description',
    price: 10,
    image: 'test.jpg'
  })
  
  await assignment.orderBooks([bookId, bookId])
  const orders = await assignment.listOrders()
  expect(orders[0].books[bookId]).toBe(2)
})

test('fulfill order removes stock', async () => {
  const bookId = await assignment.createOrUpdateBook({
    name: 'Test Book 3',
    author: 'Test Author',
    description: 'Test Description',
    price: 10,
    image: 'test.jpg'
  })
  
  await assignment.placeBooksOnShelf(bookId, 10, 'B1')
  const order = await assignment.orderBooks([bookId])
  await assignment.fulfillOrder(order.orderId, [{ book: bookId, shelf: 'B1', numberOfBooks: 1 }])
  const locations = await assignment.findBookOnShelf(bookId)
  expect(locations[0].count).toBe(9)
})

test('books show stock levels', async () => {
  const bookId = await assignment.createOrUpdateBook({
    name: 'Test Book 4',
    author: 'Test Author',
    description: 'Test Description',
    price: 10,
    image: 'test.jpg'
  })
  
  await assignment.placeBooksOnShelf(bookId, 3, 'C1')
  const book = await assignment.lookupBookById(bookId)
  expect(book.stock).toBe(3)
})
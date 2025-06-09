import previous_assignment from './assignment-3.js'

export type BookID = string
export type ShelfId = string
export type OrderId = string

export interface Book {
  id?: BookID
  name: string
  author: string
  description: string
  price: number
  image: string
  stock?: number
}

export interface Filter {
  from?: number
  to?: number
  name?: string
  author?: string
}

export interface BookStock {
  bookId: BookID
  shelf: ShelfId
  count: number
}

export interface Order {
  orderId: OrderId
  books: Record<BookID, number>
  status: 'pending' | 'fulfilled'
  createdAt: Date
}

async function listBooks(filters?: Filter[]): Promise<Book[]> {
  const books = await previous_assignment.listBooks(filters)

  const booksWithStock = await Promise.all(
    books.map(async (book: Book) => {
      if (book.id != null) {
        try {
          const response = await fetch(`http://localhost:3000/warehouse/stock/${book.id}`)
          if (!response.ok) throw new Error()
          const stockData = await response.json()
          return { ...book, stock: stockData.stock }
        } catch {
          return { ...book, stock: 0 }
        }
      }
      return { ...book, stock: 0 }
    })
  )

  return booksWithStock
}

async function createOrUpdateBook(book: Book): Promise<BookID> {
  return await previous_assignment.createOrUpdateBook(book)
}

async function removeBook(book: BookID): Promise<void> {
  await previous_assignment.removeBook(book)
}

async function lookupBookById(book: BookID): Promise<Book> {
  const allBooks = await previous_assignment.listBooks()
  const bookData = allBooks.find(b => b.id === book)

  if (bookData == null) {
    throw new Error(`Book with ID ${book} not found`)
  }

  try {
    const response = await fetch(`http://localhost:3000/warehouse/stock/${book}`)
    if (!response.ok) throw new Error()
    const stockData = await response.json()
    return { ...bookData, stock: stockData.stock }
  } catch {
    return { ...bookData, stock: 0 }
  }
}

async function placeBooksOnShelf(bookId: BookID, numberOfBooks: number, shelf: ShelfId): Promise<void> {
  await lookupBookById(bookId)

  const result = await fetch(`http://localhost:3000/warehouse/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, numberOfBooks, shelf })
  })

  if (!result.ok) {
    throw new Error('Failed to place books on shelf')
  }
}

async function orderBooks(order: BookID[]): Promise<{ orderId: OrderId }> {
  const bookCounts: Record<BookID, number> = {}
  for (const bookId of order) {
    await lookupBookById(bookId)
    bookCounts[bookId] = (bookCounts[bookId] ?? 0) + 1
  }

  const result = await fetch(`http://localhost:3000/warehouse/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ books: bookCounts })
  })

  if (!result.ok) {
    throw new Error('Failed to place order')
  }

  return await result.json()
}

async function findBookOnShelf(book: BookID): Promise<Array<{ shelf: ShelfId, count: number }>> {
  await lookupBookById(book)

  const result = await fetch(`http://localhost:3000/warehouse/books/${book}/shelves`)
  if (!result.ok) {
    throw new Error('Failed to find book on shelf')
  }

  return await result.json()
}

async function fulfillOrder(order: OrderId, booksFulfilled: Array<{ book: BookID, shelf: ShelfId, numberOfBooks: number }>): Promise<void> {
  const result = await fetch(`http://localhost:3000/warehouse/orders/${order}`)
  if (!result.ok) {
    throw new Error('Failed to retrieve order')
  }

  const orderData = await result.json()
  if (orderData.status === 'fulfilled') {
    throw new Error(`Order ${order} is already fulfilled`)
  }

  const fulfillResult = await fetch(`http://localhost:3000/warehouse/orders/${order}/fulfill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fulfillments: booksFulfilled })
  })

  if (!fulfillResult.ok) {
    throw new Error('Failed to fulfill order')
  }
}

async function listOrders(): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
  const result = await fetch(`http://localhost:3000/warehouse/orders/pending`)

  if (!result.ok) {
    throw new Error('Failed to list orders')
  }

  return await result.json()
}

const assignment = 'assignment-4'

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
  placeBooksOnShelf,
  orderBooks,
  findBookOnShelf,
  fulfillOrder,
  listOrders,
  lookupBookById
}

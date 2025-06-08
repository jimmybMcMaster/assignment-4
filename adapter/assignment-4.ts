import previous_assignment from './assignment-3'

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
};

export interface Filter {
  from?: number
  to?: number
  name?: string
  author?: string
};

export interface BookStock {
  bookId: BookID
  shelf: ShelfId
  count: number
}

export interface Warehouse {
  stocks: BookStock[]
}

export interface Order {
  orderId: OrderId
  books: Record<BookID, number>
  status: 'pending' | 'fulfilled'
  createdAt: Date
}

// In memory storage
const warehouse: Warehouse = {
  stocks: []
}

const orders: Order[] = []
let orderCounter = 1


// Helper function to get total stock for a book across all shelves
function getBookStock(bookId: BookID): number {
  return warehouse.stocks
    .filter(stock => stock.bookId === bookId)
    .reduce((total, stock) => total + stock.count, 0)
}

async function listBooks (filters?: Filter[]): Promise<Book[]> {
   // Get books from previous assignment and add stock information
  const books = await previous_assignment.listBooks(filters)
  
  return books.map((book: Book) => ({
    ...book,
    stock: (book.id != null) ? getBookStock(book.id) : 0
  }))
  
}

async function createOrUpdateBook (book: Book): Promise<BookID> {
  return await previous_assignment.createOrUpdateBook(book)
}

async function removeBook (book: BookID): Promise<void> {
  await previous_assignment.removeBook(book)
}

async function lookupBookById (book: BookID): Promise<Book> {
  throw new Error('Todo')
}

async function placeBooksOnShelf (bookId: BookID, numberOfBooks: number, shelf: ShelfId): Promise<void> {
  throw new Error('Todo')
}

async function orderBooks (order: BookID[]): Promise<{ orderId: OrderId }> {
  throw new Error('Todo')
}

async function findBookOnShelf (book: BookID): Promise<Array<{ shelf: ShelfId, count: number }>> {
  throw new Error('Todo')
}

async function fulfilOrder (order: OrderId, booksFulfilled: Array<{ book: BookID, shelf: ShelfId, numberOfBooks: number }>): Promise<void> {
  throw new Error('Todo')
}

async function listOrders (): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
  throw new Error('Todo')
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
  fulfilOrder,
  listOrders,
  lookupBookById
}

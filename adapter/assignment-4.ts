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

async function lookupBookById(book: BookID): Promise<Book> {
  const allBooks = await previous_assignment.listBooks()
  const bookData = allBooks.find(b => b.id === book)
  
  if (bookData == null) {
    throw new Error(`Book with ID ${book} not found`)
  }
  
  return {
    ...bookData,
    stock: getBookStock(book)
  }
}

async function placeBooksOnShelf(bookId: BookID, numberOfBooks: number, shelf: ShelfId): Promise<void> {
  // Validate that the book exists
  await lookupBookById(bookId)
  
  // Find existing stock on this shelf for book
  const existingStock = warehouse.stocks.find(
    stock => stock.bookId === bookId && stock.shelf === shelf
  )
  
  if (existingStock != null) {
    existingStock.count += numberOfBooks
  } else {
    warehouse.stocks.push({
      bookId,
      shelf,
      count: numberOfBooks
    })
  }
}

async function orderBooks(order: BookID[]): Promise<{ orderId: OrderId }> {
  const orderId = `${orderCounter++}`
  
  // Count books in the order
  const bookCounts: Record<BookID, number> = {}
  for (const bookId of order) {
  
    await lookupBookById(bookId)
    
    bookCounts[bookId] = (bookCounts[bookId] ?? 0) + 1
  }
  
  // Create the order
  const newOrder: Order = {
    orderId,
    books: bookCounts,
    status: 'pending',
    createdAt: new Date()
  }
  
  orders.push(newOrder)
  
  return { orderId }
}

async function findBookOnShelf(book: BookID): Promise<Array<{ shelf: ShelfId, count: number }>> {
  await lookupBookById(book)
  
  return warehouse.stocks
    .filter(stock => stock.bookId === book && stock.count > 0)
    .map(stock => ({
      shelf: stock.shelf,
      count: stock.count
    }))
}

async function fulfillOrder(order: OrderId, booksFulfilled: Array<{ book: BookID, shelf: ShelfId, numberOfBooks: number }>): Promise<void> {
  const orderToFulfill = orders.find(o => o.orderId === order)
  if (orderToFulfill == null) {
    throw new Error(`Order ${order} not found`)
  }
  
  if (orderToFulfill.status === 'fulfilled') {
    throw new Error(`Order ${order} is already fulfilled`)
  }
  
  // Validate stock available and deduct
  for (const fulfillment of booksFulfilled) {
    const { book: bookId, shelf, numberOfBooks } = fulfillment
    
    const stockIndex = warehouse.stocks.findIndex(
      stock => stock.bookId === bookId && stock.shelf === shelf
    )
    
    if (stockIndex === -1) {
      throw new Error(`No stock found for book ${bookId} on shelf ${shelf}`)
    }
    
    const stock = warehouse.stocks[stockIndex]
    if (stock.count < numberOfBooks) {
      throw new Error(`Not enough stock for book ${bookId} on shelf ${shelf}. Available: ${stock.count}, requested: ${numberOfBooks}`)
    }
    
    stock.count -= numberOfBooks
  }
  
  orderToFulfill.status = 'fulfilled'
}

async function listOrders(): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
  return orders
    .filter(order => order.status === 'pending')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map(order => ({
      orderId: order.orderId,
      books: order.books
    }))
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

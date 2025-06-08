import { MongoClient, type Db, type Collection } from 'mongodb'
// We are importing the book type here, so we can keep our types consistent with the front end
import { type Book } from './adapter/assignment-3.js'

const uri = (global as any).MONGO_URI as string ?? 'mongodb://mongo'
export const client = new MongoClient(uri)

// Types for warehouse collections
export interface BookStock {
  bookId: string
  shelf: string
  count: number
}

export interface Order {
  orderId: string
  books: Record<string, number>
  status: 'pending' | 'fulfilled'
  createdAt: Date
}

export interface BookDatabaseAccessor {
    database: Db,
    books: Collection<Book>
}

export interface WarehouseDatabaseAccessor extends BookDatabaseAccessor {
    warehouseStocks: Collection<BookStock>
    orders: Collection<Order>
}
 
export function getBookDatabase(): BookDatabaseAccessor {
    // If we aren't testing, we are creating a random database name
    const database = client.db((global as any).MONGO_URI !== undefined ? Math.floor(Math.random() * 100000).toPrecision() : 'mcmasterful-books')
    const books = database.collection<Book>('books')
 
    return {
      database,
      books
    }
}

export function getWarehouseDatabase(): WarehouseDatabaseAccessor {
    // Separate databases for bounded contexts as per instructions
    const listingsDatabase = client.db((global as any).MONGO_URI !== undefined ? Math.floor(Math.random() * 100000).toPrecision() : 'mcmasterful-listings')
    const warehouseDatabase = client.db((global as any).MONGO_URI !== undefined ? Math.floor(Math.random() * 100000).toPrecision() : 'mcmasterful-warehouse')
    
    const books = listingsDatabase.collection<Book>('books')
    const warehouseStocks = warehouseDatabase.collection<BookStock>('warehouseStocks')
    const orders = warehouseDatabase.collection<Order>('orders')
 
    return {
      database: warehouseDatabase, 
      books,
      warehouseStocks,
      orders
    }
}
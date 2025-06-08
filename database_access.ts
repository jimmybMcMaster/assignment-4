import { MongoClient, type Db, type Collection } from 'mongodb'
// We are importing the book type here, so we can keep our types consistent with the front end
import { type Book } from './adapter/assignment-3.js'

const uri = (global as any).MONGO_URI as string ?? 'mongodb://mongo'
export const client = new MongoClient(uri)

export interface BookDatabaseAccessor {
    database: Db,
    books: Collection<Book>
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
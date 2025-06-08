/* import { MongoClient } from 'mongodb'
// We are importing the book type here, so we can keep our types consistent with the front end
import { type Book } from './adapter/assignment-3.js'

// This is the connection string for the mongo database in our docker compose file
const uri = 'mongodb://mongo'

// We're setting up a client, opening the database for our project, and then opening
// a typed collection for our books.
export const client = new MongoClient(uri)
export const database = client.db('mcmasterful-books')
export const bookCollection = database.collection<Book>('books') */

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
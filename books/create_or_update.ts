import { z } from 'zod'
import { type ZodRouter } from 'koa-zod-router'
import { getBookDatabase, type BookDatabaseAccessor } from '../database_access.js'
import { type Book } from '../adapter/assignment-3.js'
import { ObjectId } from 'mongodb'


// Business logic
async function createOrUpdateBook(bookData: Book, database: BookDatabaseAccessor): Promise<{ success: boolean, id?: string }> {
  if (typeof bookData.id === 'string') {
    // Update existing book
    const id = bookData.id
    const result = await database.books.replaceOne(
      { _id: { $eq: ObjectId.createFromHexString(id) } }, 
      {
        id,
        name: bookData.name,
        description: bookData.description,
        price: bookData.price,
        author: bookData.author,
        image: bookData.image
      }
    )
    return { success: result.modifiedCount === 1, id }
  } else {
    // Create new book
    const result = await database.books.insertOne({
      name: bookData.name,
      description: bookData.description,
      price: bookData.price,
      author: bookData.author,
      image: bookData.image
    })
    return { success: true, id: result.insertedId.toString() }
  }
}

// Route handler
export default function createOrUpdateBookRoute(router: ZodRouter): void {
  router.register({
    name: 'create or update a book',
    method: 'post',
    path: '/books',
    validate: {
      body: z.object({
        id: z.string().optional(),
        name: z.string(),
        price: z.coerce.number(),
        description: z.string(),
        author: z.string(),
        image: z.string()
      })
    },
    handler: async (ctx, next) => {
      const body = ctx.request.body
      const db = getBookDatabase()

      try {
        const result = await createOrUpdateBook(body, db)
        
        if (result.success) {
          ctx.body = { id: result.id }
        } else {
          ctx.statusCode = 404
        }
      } catch (e) {
        ctx.statusCode = 500
      }
      
      await next()
    }
  })
}
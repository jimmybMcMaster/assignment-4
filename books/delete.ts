import { z } from 'zod'
import { type ZodRouter } from 'koa-zod-router'
import { getBookDatabase, type BookDatabaseAccessor } from '../database_access.js'
import {  ObjectId } from 'mongodb'

// Business logic
async function deleteBook(id: string, database: BookDatabaseAccessor): Promise<boolean> {
  const objectId = ObjectId.createFromHexString(id)
  const result = await database.books.deleteOne({ _id: { $eq: objectId } })
  return result.deletedCount === 1
}

// Route handler
export default function deleteBookRoute(router: ZodRouter): void {
  router.register({
    name: 'delete a book',
    method: 'delete',
    path: '/books/:id',
    validate: {
      params: z.object({
        id: z.string()
      })
    },
    handler: async (ctx, next) => {
      const id = ctx.request.params.id
      const db = getBookDatabase()
      
      const wasDeleted = await deleteBook(id, db)
      
      if (wasDeleted) {
        ctx.body = {}
      } else {
        ctx.statusCode = 404
      }
      await next()
    }
  })
}
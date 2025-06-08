import { z } from 'zod'
import { type ZodRouter } from 'koa-zod-router'
import { getBookDatabase } from '../database_access.js'
import {  ObjectId } from 'mongodb'

export default function deleteBook (router: ZodRouter): void {
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
      const objectId = ObjectId.createFromHexString(id)
      const db = getBookDatabase()
      const result = await db.books.deleteOne({ _id: { $eq: objectId } })
      if (result.deletedCount === 1) {
        ctx.body = {}
      } else {
        ctx.statusCode = 404
      }
      await next()
    }
  })
}

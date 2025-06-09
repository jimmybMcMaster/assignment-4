import { z } from 'zod'
import { warehouseDatabaseAdapter } from './warehouse_database_adapter.js'
import { type ZodRouter } from 'koa-zod-router'

// Route handlers
export default function warehouseRoutes(router: ZodRouter): void {
  // GET /warehouse/stock/:bookId - Get total stock for a book
  router.register({
    name: 'get book stock',
    method: 'get',
    path: '/warehouse/stock/:bookId',
    validate: {
      params: z.object({
        bookId: z.string()
      })
    },
    handler: async (ctx, next) => {
      const bookId = ctx.params.bookId as string

      try {
        const totalStock = await warehouseDatabaseAdapter.getBookStock(bookId)
        ctx.body = { stock: totalStock }
      } catch {
        ctx.status = 500 
      }
      
      await next()
    }
  })

  // POST /warehouse/stock - Place books on shelf
  router.register({
    name: 'place books on shelf',
    method: 'post',
    path: '/warehouse/stock',
    validate: {
      body: z.object({
        bookId: z.string(),
        numberOfBooks: z.number().min(1),
        shelf: z.string()
      })
    },
    handler: async (ctx, next) => {
      const { bookId, numberOfBooks, shelf } = ctx.request.body

      try {
        await warehouseDatabaseAdapter.addStock(bookId, numberOfBooks, shelf)
        ctx.body = { success: true }
      } catch {
        ctx.status = 500 
      }

      await next()
    }
  })

  // GET /warehouse/books/:bookId/shelves - Find book on shelf
  router.register({
    name: 'find book on shelf',
    method: 'get',
    path: '/warehouse/books/:bookId/shelves',
    validate: {
      params: z.object({
        bookId: z.string()
      })
    },
    handler: async (ctx, next) => {
      const bookId = ctx.params.bookId as string

      try {
        const locations = await warehouseDatabaseAdapter.findBookOnShelf(bookId)
        ctx.body = locations
      } catch {
        ctx.status = 500 
      }

      await next()
    }
  })

  // POST /warehouse/orders - Create new order
  router.register({
    name: 'create order',
    method: 'post',
    path: '/warehouse/orders',
    validate: {
      body: z.object({
        books: z.record(z.string(), z.number().min(1))
      })
    },
    handler: async (ctx, next) => {
      const { books } = ctx.request.body

      try {
        const result = await warehouseDatabaseAdapter.createOrder(books)
        ctx.body = result
      } catch {
        ctx.status = 500 
      }

      await next()
    }
  })

  // GET /warehouse/orders/pending - List pending orders
  router.register({
    name: 'list pending orders',
    method: 'get',
    path: '/warehouse/orders/pending',
    handler: async (ctx, next) => {
      try {
        const orders = await warehouseDatabaseAdapter.listPendingOrders()
        ctx.body = orders
      } catch {
        ctx.status = 500
      }

      await next()
    }
  })

  // GET /warehouse/orders/:orderId - Get order details
  router.register({
    name: 'get order',
    method: 'get',
    path: '/warehouse/orders/:orderId',
    validate: {
      params: z.object({
        orderId: z.string()
      })
    },
    handler: async (ctx, next) => {
      const orderId = ctx.params.orderId as string

      try {
        const order = await warehouseDatabaseAdapter.getOrder(orderId)
        if (order == null) {
          ctx.status = 404 
        } else {
          ctx.body = order
        }
      } catch {
        ctx.status = 500 
      }

      await next()
    }
  })

  // POST /warehouse/orders/:orderId/fulfill - Fulfill an order
  router.register({
    name: 'fulfill order',
    method: 'post',
    path: '/warehouse/orders/:orderId/fulfill',
    validate: {
      params: z.object({
        orderId: z.string()
      }),
      body: z.object({
        fulfillments: z.array(z.object({
          book: z.string(),
          shelf: z.string(),
          numberOfBooks: z.number().min(1)
        }))
      })
    },
    handler: async (ctx, next) => {
      const orderId = ctx.params.orderId as string
      const { fulfillments } = ctx.request.body

      try {
        const order = await warehouseDatabaseAdapter.getOrder(orderId)
        if (order == null) {
          ctx.status = 404 
          return
        }

        if (order.status === 'fulfilled') {
          ctx.status = 400 
          return
        }

        for (const fulfillment of fulfillments) {
          const { book: bookId, shelf, numberOfBooks } = fulfillment
          await warehouseDatabaseAdapter.updateStock(bookId, shelf, -numberOfBooks)
        }

        await warehouseDatabaseAdapter.fulfillOrder(orderId)
        ctx.body = { success: true }
      } catch {
        ctx.status = 500 
      }

      await next()
    }
  })
}

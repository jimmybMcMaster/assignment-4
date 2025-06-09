import { getWarehouseDatabase } from '../database_access.js'
import { type BookID, type ShelfId, type OrderId, type Order } from '../adapter/assignment-4.js'

async function addStock(bookId: BookID, numberOfBooks: number, shelf: ShelfId): Promise<void> {

  const database = getWarehouseDatabase()
  const existingStock = await database.warehouseStocks.findOne({ bookId, shelf })
  
  if (existingStock != null) {
    await database.warehouseStocks.updateOne(
      { bookId, shelf },
      { $inc: { count: numberOfBooks } }
    )
  } else {
    await database.warehouseStocks.insertOne({
      bookId,
      shelf,
      count: numberOfBooks
    })
  }
}

async function getBookStock(bookId: BookID): Promise<number> {
  
  const database = getWarehouseDatabase()
  const stocks = await database.warehouseStocks.find({ bookId }).toArray()
  return stocks.reduce((total, stock) => total + stock.count, 0)
}

async function findBookOnShelf(bookId: BookID): Promise<Array<{ shelf: ShelfId, count: number }>> {
  
  const database = getWarehouseDatabase()
  const stocks = await database.warehouseStocks.find({ 
    bookId, 
    count: { $gt: 0 } 
  }).toArray()
  
  return stocks.map(stock => ({
    shelf: stock.shelf,
    count: stock.count
  }))
}

async function updateStock(bookId: BookID, shelf: ShelfId, countChange: number): Promise<void> {
  
  const database = getWarehouseDatabase()
  const stock = await database.warehouseStocks.findOne({ bookId, shelf })
  
  if (stock == null) {
    throw new Error(`No stock found for book ${bookId} on shelf ${shelf}`)
  }
  
  if (stock.count + countChange < 0) {
    throw new Error(`Not enough stock for book ${bookId} on shelf ${shelf}. Available: ${stock.count}, requested: ${Math.abs(countChange)}`)
  }
  
  await database.warehouseStocks.updateOne(
    { bookId, shelf },
    { $inc: { count: countChange } }
  )
}

async function createOrder(bookCounts: Record<BookID, number>): Promise<{ orderId: OrderId }> {
  
  const database = getWarehouseDatabase()
  const lastOrder = await database.orders.findOne({}, { sort: { orderId: -1 } })
  const nextOrderNum = (lastOrder != null) ? parseInt(lastOrder.orderId) + 1 : 1
  const orderId = nextOrderNum.toString()
  
  const newOrder: Order = {
    orderId,
    books: bookCounts,
    status: 'pending',
    createdAt: new Date()
  }
  
  await database.orders.insertOne(newOrder)
  return { orderId }
}

async function listPendingOrders(): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
  const database = getWarehouseDatabase()
  const orders = await database.orders.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .toArray()
  
  return orders.map((order: { orderId: any; books: any }) => ({
    orderId: order.orderId,
    books: order.books
  }))
}

async function fulfillOrder(orderId: OrderId): Promise<void> {
  const database = getWarehouseDatabase()
  const order = await database.orders.findOne({ orderId })
  
  if (order == null) {
    throw new Error(`Order ${orderId} not found`)
  }
  
  if (order.status === 'fulfilled') {
    throw new Error(`Order ${orderId} is already fulfilled`)
  }
  
  await database.orders.updateOne(
    { orderId },
    { $set: { status: 'fulfilled' } }
  )
}

async function getOrder(orderId: OrderId): Promise<Order | null> {
  const database = getWarehouseDatabase()
  return await database.orders.findOne({ orderId })
}

export const warehouseDatabaseAdapter = {
  addStock,
  getBookStock,
  findBookOnShelf,
  updateStock,
  createOrder,
  listPendingOrders,
  fulfillOrder,
  getOrder
}
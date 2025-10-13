import clientPromise from "./mongodb"
import type { User, Product, Order, ChatMessage, WeatherData, CropRecommendation } from "./mongodb"

export async function connectToDatabase() {
  const client = await clientPromise
  return client.db("agriguide")
}

export class DatabaseService {
  private static async getDb() {
    const client = await clientPromise
    return client.db("agriguide")
  }

  // User operations
  static async createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()
    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection("users").insertOne(user)
    return result
  }

  static async getUserByEmail(email: string) {
    const db = await this.getDb()
    return await db.collection("users").findOne({ email })
  }

  static async getUserById(id: string) {
    const db = await this.getDb()
    return await db.collection("users").findOne({ _id: id })
  }

  // Product operations
  static async createProduct(productData: Omit<Product, "_id" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()
    const product = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection("products").insertOne(product)
    return result
  }

  static async getProducts(filters: any = {}) {
    const db = await this.getDb()
    return await db.collection("products").find(filters).toArray()
  }

  static async getProductById(id: string) {
    const db = await this.getDb()
    return await db.collection("products").findOne({ _id: id })
  }

  static async getProductsByFarmer(farmerId: string) {
    const db = await this.getDb()
    return await db.collection("products").find({ farmerId }).toArray()
  }

  static async updateProduct(id: string, updateData: Partial<Product>) {
    const db = await this.getDb()
    const result = await db
      .collection("products")
      .updateOne({ _id: id }, { $set: { ...updateData, updatedAt: new Date() } })
    return result
  }

  static async deleteProduct(id: string) {
    const db = await this.getDb()
    return await db.collection("products").deleteOne({ _id: id })
  }

  // Order operations
  static async createOrder(orderData: Omit<Order, "_id" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()
    const order = {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection("orders").insertOne(order)
    return result
  }

  static async getOrdersByCustomer(customerId: string) {
    const db = await this.getDb()
    return await db.collection("orders").find({ customerId }).toArray()
  }

  static async getOrdersByFarmer(farmerId: string) {
    const db = await this.getDb()
    return await db.collection("orders").find({ farmerId }).toArray()
  }

  static async updateOrderStatus(orderId: string, status: string) {
    const db = await this.getDb()
    return await db
      .collection("orders")
      .updateOne({ _id: orderId }, { $set: { orderStatus: status, updatedAt: new Date() } })
  }

  // Chat operations
  static async saveChatMessage(messageData: Omit<ChatMessage, "_id" | "createdAt">) {
    const db = await this.getDb()
    const message = {
      ...messageData,
      createdAt: new Date(),
    }
    const result = await db.collection("chat_messages").insertOne(message)
    return result
  }

  static async getChatHistory(userId: string) {
    const db = await this.getDb()
    return await db.collection("chat_messages").find({ userId }).sort({ createdAt: -1 }).limit(50).toArray()
  }

  // Weather operations
  static async saveWeatherData(weatherData: Omit<WeatherData, "_id">) {
    const db = await this.getDb()
    const result = await db.collection("weather_data").insertOne(weatherData)
    return result
  }

  // Crop recommendation operations
  static async saveCropRecommendation(recommendationData: Omit<CropRecommendation, "_id" | "createdAt">) {
    const db = await this.getDb()
    const recommendation = {
      ...recommendationData,
      createdAt: new Date(),
    }
    const result = await db.collection("crop_recommendations").insertOne(recommendation)
    return result
  }

  static async getCropRecommendations(userId: string) {
    const db = await this.getDb()
    return await db.collection("crop_recommendations").find({ userId }).sort({ createdAt: -1 }).toArray()
  }
}

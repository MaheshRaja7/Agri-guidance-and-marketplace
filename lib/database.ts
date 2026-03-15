import clientPromise from "./mongodb"
import type {
  User,
  Product,
  Order,
  ChatMessage,
  WeatherData,
  CropRecommendation,
} from "./mongodb"

import { ObjectId } from "mongodb"

// Connect to database
export async function connectToDatabase() {
  const client = await clientPromise
  return client.db()
}

export class DatabaseService {
  private static async getDb() {
    const client = await clientPromise
    return client.db()
  }

  // ======================
  // USER OPERATIONS
  // ======================

  static async createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()

    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return await db.collection("users").insertOne(user)
  }

  static async getUserByEmail(email: string) {
    const db = await this.getDb()
    return await db.collection("users").findOne({ email })
  }

  static async getUserById(id: string) {
    const db = await this.getDb()

    if (!ObjectId.isValid(id)) return null

    return await db.collection("users").findOne({
      _id: new ObjectId(id),
    })
  }

  // ======================
  // PRODUCT OPERATIONS
  // ======================

  static async createProduct(productData: Omit<Product, "_id" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()

    const product = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return await db.collection("products").insertOne(product)
  }

  static async getProducts(filters: any = {}) {
    const db = await this.getDb()
    return await db.collection("products").find(filters).toArray()
  }

  static async getProductById(id: string) {
    const db = await this.getDb()

    if (!ObjectId.isValid(id)) return null

    return await db.collection("products").findOne({
      _id: new ObjectId(id),
    })
  }

  static async getProductsByFarmer(farmerId: string) {
    const db = await this.getDb()
    return await db.collection("products").find({ farmerId }).toArray()
  }

  static async updateProduct(id: string, updateData: Partial<Product>) {
    const db = await this.getDb()

    if (!ObjectId.isValid(id)) return null

    return await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    )
  }

  static async deleteProduct(id: string) {
    const db = await this.getDb()

    if (!ObjectId.isValid(id)) return null

    return await db.collection("products").deleteOne({
      _id: new ObjectId(id),
    })
  }

  // ======================
  // ORDER OPERATIONS
  // ======================

  static async createOrder(orderData: Omit<Order, "_id" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()

    const order = {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return await db.collection("orders").insertOne(order)
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

    if (!ObjectId.isValid(orderId)) return null

    return await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          orderStatus: status,
          updatedAt: new Date(),
        },
      }
    )
  }

  // ======================
  // CHAT OPERATIONS
  // ======================

  static async saveChatMessage(messageData: Omit<ChatMessage, "_id" | "createdAt">) {
    const db = await this.getDb()

    const message = {
      ...messageData,
      createdAt: new Date(),
    }

    return await db.collection("chat_messages").insertOne(message)
  }

  static async getChatHistory(userId: string) {
    const db = await this.getDb()

    return await db
      .collection("chat_messages")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()
  }

  // ======================
  // WEATHER DATA
  // ======================

  static async saveWeatherData(weatherData: Omit<WeatherData, "_id">) {
    const db = await this.getDb()
    return await db.collection("weather_data").insertOne(weatherData)
  }

  // ======================
  // CROP RECOMMENDATION
  // ======================

  static async saveCropRecommendation(
    recommendationData: Omit<CropRecommendation, "_id" | "createdAt">
  ) {
    const db = await this.getDb()

    const recommendation = {
      ...recommendationData,
      createdAt: new Date(),
    }

    return await db.collection("crop_recommendations").insertOne(recommendation)
  }

  static async getCropRecommendations(userId: string) {
    const db = await this.getDb()

    return await db
      .collection("crop_recommendations")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()
  }
}
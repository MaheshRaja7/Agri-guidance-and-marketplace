import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// Database Models Interface
export interface User {
  _id?: string
  name: string
  email: string
  password: string
  phone: string
  userType: "farmer" | "customer"
  area?: number // in cents for farmers
  city: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  _id?: string
  farmerId: string
  name: string
  description: string
  category: string
  price: number
  quantity: number
  unit: string
  images: string[]
  location: string
  harvestDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  _id?: string
  customerId: string
  farmerId: string
  products: {
    productId: string
    quantity: number
    price: number
  }[]
  totalAmount: number
  paymentMethod: "online" | "offline"
  paymentStatus: "pending" | "completed" | "failed"
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  shippingAddress: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  _id?: string
  userId: string
  message: string
  response: string
  category: "general" | "disease" | "crop_recommendation" | "weather"
  createdAt: Date
}

export interface WeatherData {
  _id?: string
  location: string
  temperature: number
  humidity: number
  windSpeed: number
  description: string
  icon: string
  timestamp: Date
}

export interface CropRecommendation {
  _id?: string
  userId: string
  soilType: string
  location: string
  season: string
  recommendedCrops: {
    name: string
    suitability: number
    expectedYield: string
    profitMargin: string
    farmingProcess: string[]
  }[]
  createdAt: Date
}

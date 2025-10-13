import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "../../../lib/database"
import { AuthService } from "../../../lib/auth"

const mockProducts = [
  {
    _id: "1",
    farmerId: "farmer1",
    name: "Fresh Tomatoes",
    description: "Organic red tomatoes, freshly harvested from our farm. Perfect for cooking and salads.",
    category: "Vegetables",
    price: 40,
    quantity: 50,
    unit: "kg",
    location: "Punjab, India",
    harvestDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    farmerId: "farmer2",
    name: "Basmati Rice",
    description: "Premium quality basmati rice with long grains and aromatic fragrance.",
    category: "Grains",
    price: 120,
    quantity: 100,
    unit: "kg",
    location: "Haryana, India",
    harvestDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "3",
    farmerId: "farmer3",
    name: "Fresh Apples",
    description: "Crispy and sweet red apples, perfect for snacking and cooking.",
    category: "Fruits",
    price: 80,
    quantity: 30,
    unit: "kg",
    location: "Himachal Pradesh, India",
    harvestDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "4",
    farmerId: "farmer4",
    name: "Organic Spinach",
    description: "Fresh green spinach leaves, grown without pesticides.",
    category: "Vegetables",
    price: 25,
    quantity: 20,
    unit: "kg",
    location: "Maharashtra, India",
    harvestDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "5",
    farmerId: "farmer5",
    name: "Turmeric Powder",
    description: "Pure turmeric powder with high curcumin content.",
    category: "Spices",
    price: 200,
    quantity: 10,
    unit: "kg",
    location: "Kerala, India",
    harvestDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const location = searchParams.get("location")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    let products = []

    try {
      const filters: any = {}

      if (category && category !== "all") {
        filters.category = category
      }

      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ]
      }

      if (location) {
        filters.location = { $regex: location, $options: "i" }
      }

      products = await DatabaseService.getProducts(filters)

      if (products.length === 0) {
        console.log("[v0] No products in database, using mock data")
        products = mockProducts
      }
    } catch (dbError) {
      console.log("[v0] Database error, falling back to mock data:", dbError)
      products = mockProducts
    }

    if (category && category !== "all") {
      products = products.filter((product: any) => product.category.toLowerCase() === category.toLowerCase())
    }

    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower),
      )
    }

    if (location) {
      const locationLower = location.toLowerCase()
      products = products.filter((product: any) => product.location.toLowerCase().includes(locationLower))
    }

    // Sort products
    products.sort((a: any, b: any) => {
      if (sortBy === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price
      }
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }
      if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return 0
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ products: mockProducts })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = AuthService.extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded || decoded.userType !== "farmer") {
      return NextResponse.json({ error: "Only farmers can add products" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, category, price, quantity, unit, location, harvestDate } = body

    if (!name || !description || !category || !price || !quantity || !unit || !location) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const productData = {
      farmerId: decoded.userId,
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: Number(price),
      quantity: Number(quantity),
      unit: unit.trim(),
      images: [], // Will be populated when image upload is implemented
      location: location.trim(),
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
    }

    const result = await DatabaseService.createProduct(productData)

    return NextResponse.json({
      message: "Product added successfully",
      productId: result.insertedId,
    })
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "../../../../lib/database"
import { AuthService } from "../../../../lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await DatabaseService.getProductById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get farmer details
    const farmer = await DatabaseService.getUserById(product.farmerId)

    return NextResponse.json({
      ...product.toObject ? product.toObject() : product,
      farmerId: farmer
        ? {
            _id: farmer._id,
            name: farmer.name,
            city: farmer.city,
            rating: farmer.rating,
          }
        : null,
    })
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = AuthService.extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const product = await DatabaseService.getProductById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.farmerId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const result = await DatabaseService.updateProduct(params.id, body)

    return NextResponse.json({ message: "Product updated successfully" })
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = AuthService.extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const product = await DatabaseService.getProductById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.farmerId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await DatabaseService.deleteProduct(params.id)

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Product deletion error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

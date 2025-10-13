import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { items, totalAmount, paymentMethod, shippingAddress, paymentDetails } = await request.json()

    const db = await connectToDatabase()

    // Create order
    const order = {
      userId: decoded.userId,
      items: items,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      shippingAddress: shippingAddress,
      paymentDetails: paymentDetails,
      status: paymentMethod === "cod" ? "confirmed" : "pending",
      paymentStatus: paymentMethod === "cod" ? "pending" : "processing",
      orderDate: new Date(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      trackingNumber: `AGR${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    }

    const result = await db.collection("orders").insertOne(order)

    // Update product quantities
    for (const item of items) {
      await db.collection("products").updateOne({ _id: item.productId }, { $inc: { quantity: -item.quantity } })
    }

    return NextResponse.json({
      success: true,
      orderId: result.insertedId,
      trackingNumber: order.trackingNumber,
      message: paymentMethod === "cod" ? "Order placed successfully! Pay on delivery." : "Payment processing...",
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await connectToDatabase()
    const orders = await db.collection("orders").find({ userId: decoded.userId }).sort({ orderDate: -1 }).toArray()

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

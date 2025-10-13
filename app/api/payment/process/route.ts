import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentMethod, paymentDetails } = await request.json()

    const db = await connectToDatabase()

    // Simulate payment processing
    let paymentResult = { success: false, transactionId: null }

    if (paymentMethod === "card") {
      // Simulate card payment processing
      paymentResult = {
        success: true,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      }
    } else if (paymentMethod === "upi") {
      // Simulate UPI payment processing
      paymentResult = {
        success: true,
        transactionId: `UPI${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      }
    }

    if (paymentResult.success) {
      // Update order status
      await db.collection("orders").updateOne(
        { _id: orderId },
        {
          $set: {
            status: "confirmed",
            paymentStatus: "completed",
            transactionId: paymentResult.transactionId,
            paymentDate: new Date(),
          },
        },
      )

      return NextResponse.json({
        success: true,
        transactionId: paymentResult.transactionId,
        message: "Payment successful! Your order has been confirmed.",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Payment failed. Please try again.",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}

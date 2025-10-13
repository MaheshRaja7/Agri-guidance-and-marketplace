"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const trackingNumber = searchParams.get("tracking")
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    if (orderId) {
      // In a real app, fetch order details from API
      setOrderDetails({
        orderId,
        trackingNumber,
        status: "confirmed",
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      })
    }
  }, [orderId])

  return (
    <div className="order-confirmation">
      <div className="confirmation-container">
        <div className="success-icon">✅</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your order. We'll process it shortly.</p>

        {orderDetails && (
          <div className="order-info">
            <div className="info-item">
              <strong>Order ID:</strong> {orderDetails.orderId}
            </div>
            <div className="info-item">
              <strong>Tracking Number:</strong> {orderDetails.trackingNumber}
            </div>
            <div className="info-item">
              <strong>Status:</strong> {orderDetails.status}
            </div>
            <div className="info-item">
              <strong>Estimated Delivery:</strong> {orderDetails.estimatedDelivery}
            </div>
          </div>
        )}

        <div className="action-buttons">
          <Link href="/dashboard" className="btn-primary">
            View Orders
          </Link>
          <Link href="/marketplace" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

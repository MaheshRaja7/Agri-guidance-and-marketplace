"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  farmer: string
}

export default function CheckoutPage() {
  const { t } = useLanguage()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Load cart items from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCartItems(cart)

    // Check authentication
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Verify token and get user info
    fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        } else {
          router.push("/login")
        }
      })
  }, [router])

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handlePlaceOrder = async () => {
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      alert("Please fill in all shipping details")
      return
    }

    if (paymentMethod === "card" && (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv)) {
      alert("Please fill in all card details")
      return
    }

    if (paymentMethod === "upi" && !paymentDetails.upiId) {
      alert("Please enter UPI ID")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount,
          paymentMethod,
          shippingAddress,
          paymentDetails: paymentMethod !== "cod" ? paymentDetails : null,
        }),
      })

      const orderData = await orderResponse.json()

      if (orderData.success) {
        // Clear cart
        localStorage.removeItem("cart")

        // Redirect to order confirmation
        router.push(`/order-confirmation?orderId=${orderData.orderId}&tracking=${orderData.trackingNumber}`)
      } else {
        alert("Failed to place order. Please try again.")
      }
    } catch (error) {
      console.error("Order placement error:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="loading">{t('loading')}</div>
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>{t('checkout')}</h1>
        <p>{t('orderSummary')}</p>
      </div>

      <div className="checkout-content">
        <div className="checkout-left">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>{t('orderSummary')}</h2>
            {cartItems.map((item, index) => (
              <div key={index} className="order-item">
                <img src={item.image || "/placeholder.svg"} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>By {item.farmer}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            <div className="total-amount">
              <h3>{t('total')}: ₹{totalAmount.toFixed(2)}</h3>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="shipping-section">
            <h2>{t('shippingAddress')}</h2>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Full Name"
                value={shippingAddress.fullName}
                onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              />
              <textarea
                placeholder="Address"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              />
              <input
                type="text"
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="State"
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={shippingAddress.pincode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="checkout-right">
          {/* Payment Method */}
          <div className="payment-section">
            <h2>{t('paymentMethod')}</h2>

            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>{t('cashOnDelivery')}</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>{t('creditCard')}</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>{t('upiPayment')}</span>
              </label>
            </div>

            {/* Payment Details */}
            {paymentMethod === "card" && (
              <div className="payment-details">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                />
                <div className="card-row">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={paymentDetails.cvv}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                  />
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="payment-details">
                <input
                  type="text"
                  placeholder="UPI ID (e.g., user@paytm)"
                  value={paymentDetails.upiId}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                />
              </div>
            )}
          </div>

          <button className="place-order-btn" onClick={handlePlaceOrder} disabled={loading || cartItems.length === 0}>
            {loading ? t('loading') : `${t('placeOrder')} - ₹${totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

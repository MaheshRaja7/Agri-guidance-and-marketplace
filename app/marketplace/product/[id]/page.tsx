"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "../../../../components/Header"
import { useLanguage } from "@/contexts/LanguageContext"

interface Product {
  _id: string
  name: string
  description: string
  category: string
  price: number
  quantity: number
  unit: string
  location: string
  harvestDate: string
  createdAt: string
  farmer: {
    id: string
    name: string
    city: string
    area?: number
  }
}

export default function ProductDetailPage() {
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const [orderQuantity, setOrderQuantity] = useState(1)
  const params = useParams()

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()

      if (response.ok) {
        setProduct(data.product)
      } else {
        setError(data.error || "Product not found")
      }
    } catch (error) {
      setError("Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (productId: string, quantity: number) => {
    const newCart = { ...cart }
    newCart[productId] = (newCart[productId] || 0) + quantity
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      Vegetables: "🥕",
      Fruits: "🍎",
      Grains: "🌾",
      Pulses: "🫘",
      Spices: "🌶️",
      Herbs: "🌿",
      Dairy: "🥛",
      Organic: "🌱",
      Seeds: "🌰",
      Others: "📦",
    }
    return icons[category] || "🛒"
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <div className="spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div>
        <Header />
        <div className="container" style={{ paddingTop: "2rem" }}>
          <div className="card" style={{ textAlign: "center" }}>
            <h2>{t('error')}</h2>
            <p>{error || t('error')}</p>
            <a href="/marketplace" className="btn btn-primary">
              {t('back')}
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        user={user}
        onLogout={() => {
          setUser(null)
          localStorage.removeItem("user")
        }}
      />

      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div className="grid grid-2">
          {/* Product Image */}
          <div className="card">
            <div
              style={{
                height: "400px",
                background: `linear-gradient(135deg, #7cb342, #8bc34a)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8rem",
                color: "white",
                borderRadius: "10px",
              }}
            >
              {getCategoryIcon(product.category)}
            </div>
          </div>

          {/* Product Details */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <h1 style={{ color: "#2d5016", margin: 0 }}>{product.name}</h1>
              <span
                style={{
                  background: "#e8f5e8",
                  color: "#2d5016",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                }}
              >
                {product.category}
              </span>
            </div>

            <div className="product-price" style={{ marginBottom: "1rem" }}>
              ₹{product.price}/{product.unit}
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <p>
                <strong>{t('quantity')}:</strong> {product.quantity} {product.unit}
              </p>
              <p>
                <strong>{t('shippingAddress')}:</strong> 📍 {product.location}
              </p>
              <p>
                <strong>{t('estimatedDelivery')}:</strong> 🗓️ {new Date(product.harvestDate).toLocaleDateString()}
              </p>
              <p>
                <strong>{t('status')}:</strong> {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Order Section */}
            {user?.userType === "customer" && (
              <div
                style={{ border: "2px solid #7cb342", borderRadius: "10px", padding: "1.5rem", marginBottom: "2rem" }}
              >
                <h3 style={{ marginBottom: "1rem" }}>{t('placeOrder')}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <label>{t('quantity')}:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    style={{ width: "100px", padding: "0.5rem", border: "2px solid #ddd", borderRadius: "5px" }}
                  />
                  <span>{product.unit}</span>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>{t('total')}: ₹{(product.price * orderQuantity).toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    onClick={() => addToCart(product._id, orderQuantity)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    {t('addToCart')}
                  </button>
                  <button
                    onClick={() => alert("Order functionality will be implemented with payment integration")}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {t('buyNow')}
                  </button>
                </div>
              </div>
            )}

            {/* Farmer Information */}
            {product.farmer && (
              <div className="card" style={{ backgroundColor: "#f8f9fa" }}>
                <h3>{t('farmer') || 'Farmer'} Information</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "#7cb342",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1.5rem",
                    }}
                  >
                    👨‍🌾
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>{product.farmer.name}</h4>
                    <p style={{ margin: 0, color: "#666" }}>📍 {product.farmer.city}</p>
                    {product.farmer.area && (
                      <p style={{ margin: 0, color: "#666" }}>🚜 Farm Area: {product.farmer.area} cents</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Marketplace */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <a href="/marketplace" className="btn btn-secondary">
            ← {t('back')}
          </a>
        </div>
      </main>
    </div>
  )
}

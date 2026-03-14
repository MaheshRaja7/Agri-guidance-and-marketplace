"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "../../../../components/Header"
import { useLanguage } from "@/contexts/LanguageContext"
import { addToCart as addToCartHelper, getCartItems } from "@/lib/cart"

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
    rating?: number
    numReviews?: number
  }
}

export default function ProductDetailPage() {
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cart, setCart] = useState<Record<string, number>>({})
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const params = useParams()

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    setCart(
      getCartItems().reduce((acc, item) => {
        acc[item.productId] = item.quantity
        return acc
      }, {} as Record<string, number>)
    )

    if (params.id) {
      fetchProduct(params.id as string)
      fetchReviews(params.id as string)
    }
  }, [params.id])

  const fetchReviews = async (productId: string) => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error("Failed to load reviews:", error)
    }
  }

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
    if (!product) return;

    addToCartHelper(
      {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: "",
        farmerId: product.farmer,
      },
      quantity,
    );

    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity,
    }));
  }

  const submitReview = async () => {
    if (!reviewText.trim()) return alert("Review cannot be empty");
    
    setSubmittingReview(true);
    try {
      // Create a mock review API call (or point to real one once verified)
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: product?.farmer.id,
          productId: product?._id,
          rating,
          review: reviewText,
          userId: user?._id || user?.id
        })
      });
      
      if (response.ok) {
        alert("Review submitted successfully!");
        setReviewText("");
        // Optimistically update
        if (product && product.farmer) {
          const numReviews = (product.farmer.numReviews || 0) + 1;
          const currentRatingTotal = (product.farmer.rating || 0) * (product.farmer.numReviews || 0);
          const newRating = (currentRatingTotal + rating) / numReviews;
          setProduct({
            ...product,
            farmer: {
              ...product.farmer,
              rating: newRating,
              numReviews
            }
          });
        }
        // Fetch new reviews list
        fetchReviews(product!._id);
      } else {
        alert("Failed to submit review.");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting review.");
    } finally {
      setSubmittingReview(false);
    }
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
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
                  <div style={{ textAlign: "right", background: "white", padding: "0.5rem 1rem", borderRadius: "10px", border: "1px solid #ddd" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f59e0b" }}>
                      ⭐ {product.farmer.rating ? product.farmer.rating.toFixed(1) : "New"}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      {product.farmer.numReviews || 0} reviews
                    </div>
                  </div>
                </div>

                {/* Optional Review Section */}
                {user?.userType === "customer" && (
                  <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #ddd" }}>
                    <h4 style={{ marginBottom: "0.5rem" }}>Rate this Farmer</h4>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          style={{
                            background: "none",
                            border: "none",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            color: star <= rating ? "#f59e0b" : "#ccc"
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Share your experience..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "5px", border: "1px solid #ddd", minHeight: "60px", marginBottom: "0.5rem", resize: "vertical" }}
                    />
                    <button 
                      onClick={submitReview}
                      disabled={submittingReview}
                      className="btn btn-secondary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Display Reviews */}
            <div className="card" style={{ marginTop: "2rem" }}>
              <h3 style={{ marginBottom: "1rem", color: "#2d5016" }}>Customer Reviews</h3>
              {reviews.length === 0 ? (
                <p style={{ color: "#666", fontStyle: "italic" }}>No reviews yet. Be the first to leave a review!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {reviews.map((rev) => (
                    <div key={rev._id} style={{ padding: "1rem", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#fafafa" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <strong style={{ color: "#333" }}>{rev.reviewerId?.name || "Customer"}</strong>
                        <span style={{ color: "#f59e0b" }}>{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                      </div>
                      <p style={{ margin: 0, color: "#555", fontSize: "0.95rem" }}>{rev.comment}</p>
                      <small style={{ color: "#aaa", fontSize: "0.8rem", marginTop: "0.5rem", display: "block" }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>

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

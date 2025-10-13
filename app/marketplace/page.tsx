"use client"
import { useState, useEffect } from "react"
import type React from "react"
import Header from "../../components/Header"

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
  farmerId: string
}

export default function MarketplacePage() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [cart, setCart] = useState<{ [key: string]: number }>({})

  const categories = [
    "all",
    "Vegetables",
    "Fruits",
    "Grains",
    "Pulses",
    "Spices",
    "Herbs",
    "Dairy",
    "Organic",
    "Seeds",
    "Others",
  ]

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }

    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    fetchProducts()
  }, [selectedCategory, sortBy, sortOrder])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        sortBy,
        sortOrder,
      })

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
      } else {
        console.error("Failed to fetch products:", data.error)
      }
    } catch (error) {
      console.error("Products fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  const addToCart = (productId: string, quantity = 1) => {
    const newCart = { ...cart }
    newCart[productId] = (newCart[productId] || 0) + quantity
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const removeFromCart = (productId: string) => {
    const newCart = { ...cart }
    delete newCart[productId]
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0)
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

  return (
    <div>
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        user={user}
        onLogout={() => {
          setUser(null)
          localStorage.removeItem("user")
        }}
      />

      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        {/* Header Section */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h1 style={{ color: "#2d5016", marginBottom: "0.5rem" }}>Agricultural Marketplace</h1>
              <p>Fresh produce directly from farmers to your doorstep</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {user?.userType === "farmer" && (
                <a href="/farmer/add-product" className="btn btn-primary">
                  + Add Product
                </a>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => alert(`Cart: ${getCartItemCount()} items`)}
                style={{ position: "relative" }}
              >
                🛒 Cart
                {getCartItemCount() > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "#f44336",
                      color: "white",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, categories, or locations..."
                style={{
                  flex: 1,
                  minWidth: "250px",
                  padding: "0.75rem",
                  border: "2px solid #ddd",
                  borderRadius: "5px",
                }}
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </form>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <label style={{ marginRight: "0.5rem", fontWeight: "bold" }}>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: "0.5rem", border: "2px solid #ddd", borderRadius: "5px" }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : `${getCategoryIcon(category)} ${category}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ marginRight: "0.5rem", fontWeight: "bold" }}>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: "0.5rem", border: "2px solid #ddd", borderRadius: "5px" }}
              >
                <option value="createdAt">Latest</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ padding: "0.5rem", border: "2px solid #ddd", borderRadius: "5px", marginLeft: "0.5rem" }}
              >
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or check back later for new listings.</p>
            {user?.userType === "farmer" && (
              <a href="/farmer/add-product" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                Be the first to add a product!
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-3">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div
                  style={{
                    height: "200px",
                    background: `linear-gradient(135deg, #7cb342, #8bc34a)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "4rem",
                    color: "white",
                  }}
                >
                  {getCategoryIcon(product.category)}
                </div>
                <div className="product-info">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h3 style={{ margin: 0, color: "#2d5016" }}>{product.name}</h3>
                    <span
                      style={{
                        background: "#e8f5e8",
                        color: "#2d5016",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {product.category}
                    </span>
                  </div>
                  <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    {product.description.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description}
                  </p>
                  <div style={{ marginBottom: "1rem" }}>
                    <div className="product-price">
                      ₹{product.price}/{product.unit}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      Available: {product.quantity} {product.unit}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>📍 {product.location}</div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      🗓️ Harvested: {new Date(product.harvestDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => addToCart(product._id)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      disabled={!user || user.userType !== "customer"}
                    >
                      {cart[product._id] ? `In Cart (${cart[product._id]})` : "Add to Cart"}
                    </button>
                    <a
                      href={`/marketplace/product/${product._id}`}
                      className="btn btn-secondary"
                      style={{ textDecoration: "none" }}
                    >
                      View
                    </a>
                  </div>
                  {cart[product._id] && (
                    <button
                      onClick={() => removeFromCart(product._id)}
                      style={{
                        width: "100%",
                        marginTop: "0.5rem",
                        padding: "0.5rem",
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Remove from Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories Overview */}
        <div className="card" style={{ marginTop: "2rem" }}>
          <h3 style={{ textAlign: "center", marginBottom: "2rem" }}>Shop by Category</h3>
          <div className="grid grid-3">
            {categories.slice(1).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "1rem",
                  border: selectedCategory === category ? "2px solid #7cb342" : "2px solid #ddd",
                  borderRadius: "10px",
                  background: selectedCategory === category ? "#f0f8f0" : "white",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.3s",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{getCategoryIcon(category)}</div>
                <div style={{ fontWeight: "bold" }}>{category}</div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

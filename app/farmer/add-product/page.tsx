"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import Header from "../../../components/Header"

export default function AddProductPage() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    unit: "",
    location: "",
    harvestDate: "",
  })

  const categories = [
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

  const units = ["kg", "gram", "liter", "piece", "dozen", "bundle", "bag", "quintal", "ton"]

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)

      if (userData.userType !== "farmer") {
        router.push("/marketplace")
        return
      }

      // Pre-fill location from user data
      setFormData((prev) => ({
        ...prev,
        location: userData.city || "",
      }))
    } else {
      router.push("/login")
    }

    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please log in to add products")
        setLoading(false)
        return
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Product added successfully!")
        setFormData({
          name: "",
          description: "",
          category: "",
          price: "",
          quantity: "",
          unit: "",
          location: user?.city || "",
          harvestDate: "",
        })
        setTimeout(() => {
          router.push("/marketplace")
        }, 2000)
      } else {
        setError(data.error || "Failed to add product")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div>
        <Header currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
        <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
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
          router.push("/")
        }}
      />

      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#2d5016" }}>
            Add New Product to Marketplace
          </h1>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Fresh Tomatoes, Organic Rice"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product, quality, farming methods, etc."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="price">Price per Unit (₹) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 50.00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit *</label>
                <select id="unit" name="unit" value={formData.unit} onChange={handleInputChange} required>
                  <option value="">Select unit...</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="quantity">Available Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="e.g., 100"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="harvestDate">Harvest Date</label>
              <input
                type="date"
                id="harvestDate"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: "20px", height: "20px", marginRight: "0.5rem" }}></div>
                  Adding Product...
                </>
              ) : (
                "Add Product to Marketplace"
              )}
            </button>
          </form>

          <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f0f8f0", borderRadius: "5px" }}>
            <h4>Tips for Better Sales:</h4>
            <ul>
              <li>Use clear, descriptive product names</li>
              <li>Provide detailed descriptions including quality and farming methods</li>
              <li>Set competitive prices based on market rates</li>
              <li>Keep your inventory updated</li>
              <li>Mention if products are organic or pesticide-free</li>
              <li>Include harvest date for freshness indication</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

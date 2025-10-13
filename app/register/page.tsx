"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Header from "../../components/Header"

export default function RegisterPage() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userType: "customer",
    area: "",
    city: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          userType: formData.userType,
          area: formData.userType === "farmer" ? Number(formData.area) : undefined,
          city: formData.city,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Registration successful! Redirecting to dashboard...")
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />

      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#2d5016" }}>Register for AgriGuide</h1>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="userType">I am a *</label>
              <select id="userType" name="userType" value={formData.userType} onChange={handleInputChange} required>
                <option value="customer">Customer (Buyer)</option>
                <option value="farmer">Farmer (Seller)</option>
              </select>
            </div>

            {formData.userType === "farmer" && (
              <div className="form-group">
                <label htmlFor="area">Farm Area (in cents) *</label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                minLength={6}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? <div className="spinner"></div> : "Register"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <p>
              Already have an account?{" "}
              <a href="/login" style={{ color: "#7cb342", textDecoration: "none" }}>
                Login here
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

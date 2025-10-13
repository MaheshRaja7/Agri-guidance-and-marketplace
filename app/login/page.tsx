"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Header from "../../components/Header"

export default function LoginPage() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/dashboard")
      } else {
        setError(data.error || "Login failed")
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
        <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
          <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#2d5016" }}>Login to AgriGuide</h1>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
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
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? <div className="spinner"></div> : "Login"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <p>
              Don't have an account?{" "}
              <a href="/register" style={{ color: "#7cb342", textDecoration: "none" }}>
                Register here
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

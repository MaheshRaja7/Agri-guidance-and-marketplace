"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Header from "../../components/Header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
        // Store token in a cookie so Next.js middleware and protected routes can access it
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; sameSite=lax`

        setTimeout(() => {
          if (data.user.userType === "farmer") {
            router.push("/farmer/dashboard")
          } else {
            router.push("/marketplace")
          }
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
    <div className="min-h-screen bg-transparent">
      <Header />

      <main className="container mx-auto flex min-h-[calc(100vh-70px)] items-center justify-center py-12">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">Register for AgriGuide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="name">
                    Full Name
                  </label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
                    Email Address
                  </label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="phone">
                    Phone Number
                  </label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="city">
                    City
                  </label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="userType">
                  I am a
                </label>
                <Select value={formData.userType} onValueChange={(value) => setFormData((prev) => ({ ...prev, userType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer (Buyer)</SelectItem>
                    <SelectItem value="farmer">Farmer (Seller)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.userType === "farmer" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="area">
                    Farm Area (in cents)
                  </label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    value={formData.area}
                    onChange={handleInputChange}
                    min={1}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    minLength={6}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-green-700 hover:text-green-900">
                Login here
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

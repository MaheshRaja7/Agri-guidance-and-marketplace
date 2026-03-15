"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Header from "../../components/Header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
        // Store token in a cookie so Next.js middleware and protected routes can access it
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; sameSite=lax`

        if (data.user.userType === "farmer") {
          router.push("/farmer/dashboard")
        } else {
          // After a customer login, redirect directly to the cart page
          router.push("/cart")
        }
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
    <div className="min-h-screen bg-transparent">
      <Header />

      <main className="container mx-auto flex min-h-[calc(100vh-70px)] items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">Login to AgriGuide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

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
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <a href="/register" className="font-medium text-green-700 hover:text-green-900">
                Register here
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

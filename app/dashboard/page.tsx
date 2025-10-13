"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "../../components/Header"
import { useLanguage } from "@/contexts/LanguageContext"

interface User {
  id: string
  name: string
  email: string
  userType: "farmer" | "customer"
  city: string
  area?: number
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const savedUser = localStorage.getItem("user")

      if (!token || !savedUser) {
        router.push("/login")
        return
      }

      try {
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth verification failed:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
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

  if (!user) {
    return null
  }

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />

      <main className="container" style={{ paddingTop: "2rem" }}>
        <div className="card">
          <h1>{t('welcomeTitle')}, {user.name}!</h1>
          <p>
            <strong>{t('userType')}:</strong> {user.userType === "farmer" ? t('farmer') : t('customer')}
          </p>
          <p>
            <strong>{t('email')}:</strong> {user.email}
          </p>
          <p>
            <strong>City:</strong> {user.city}
          </p>
          {user.userType === "farmer" && user.area && (
            <p>
              <strong>Farm Area:</strong> {user.area} cents
            </p>
          )}
        </div>

        {user.userType === "farmer" ? (
          <div className="grid grid-2">
            <div className="card">
              <h3>My Products</h3>
              <p>{t('marketplaceDesc')}</p>
              <a href="/farmer/products" className="btn btn-primary">
                {t('edit')}
              </a>
            </div>
            <div className="card">
              <h3>Orders Received</h3>
              <p>{t('orderSummary')}</p>
              <a href="/farmer/orders" className="btn btn-primary">
                {t('viewOrders')}
              </a>
            </div>
            <div className="card">
              <h3>Add New Product</h3>
              <p>{t('marketplaceDesc')}</p>
              <a href="/farmer/add-product" className="btn btn-secondary">
                {t('submit')}
              </a>
            </div>
            <div className="card">
              <h3>Sales Analytics</h3>
              <p>Track your sales performance and earnings.</p>
              <a href="/farmer/analytics" className="btn btn-secondary">
                View Analytics
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-2">
            <div className="card">
              <h3>Browse Products</h3>
              <p>Explore fresh agricultural products from local farmers.</p>
              <a href="/marketplace" className="btn btn-primary">
                {t('marketplace')}
              </a>
            </div>
            <div className="card">
              <h3>My Orders</h3>
              <p>Track your orders and purchase history.</p>
              <a href="/customer/orders" className="btn btn-primary">
                {t('viewOrders')}
              </a>
            </div>
            <div className="card">
              <h3>Favorites</h3>
              <p>View your saved products and favorite farmers.</p>
              <a href="/customer/favorites" className="btn btn-secondary">
                View Favorites
              </a>
            </div>
            <div className="card">
              <h3>Profile Settings</h3>
              <p>Update your profile and delivery preferences.</p>
              <a href="/customer/profile" className="btn btn-secondary">
                {t('edit')}
              </a>
            </div>
          </div>
        )}

        <div className="grid grid-3">
          <div className="card">
            <h3>{t('weatherTitle')}</h3>
            <p>{t('weatherDesc')}</p>
            <a href="/weather" className="btn btn-primary">
              {t('weather')}
            </a>
          </div>
          <div className="card">
            <h3>Crop Guidance</h3>
            <p>Get personalized farming recommendations.</p>
            <a href="/guidance" className="btn btn-primary">
              Get Guidance
            </a>
          </div>
          <div className="card">
            <h3>{t('diseaseTitle')}</h3>
            <p>{t('diseaseDesc')}</p>
            <a href="/disease-detection" className="btn btn-primary">
              {t('diseaseDetection')}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"
import { useState, useEffect } from "react"
import Header from "../components/Header"
import Chatbot from "../components/Chatbot"
import { useLanguage } from "@/contexts/LanguageContext"

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  return (
    <div>
      <Header
        user={user}
        onLogout={() => {
          setUser(null)
          localStorage.removeItem("user")
        }}
      />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <h1>{t("welcomeTitle")}</h1>
            <p>{t("welcomeDescription")}</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/marketplace" className="btn btn-primary">
                {t("marketplace")}
              </a>
              <a href="/disease-detection" className="btn btn-secondary">
                {t("diseaseDetection")}
              </a>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container">
          <div className="grid grid-3">
            <div className="card">
              <h3>🌤️ {t("weatherTitle")}</h3>
              <p>{t("weatherDesc")}</p>
              <a href="/weather" className="btn btn-primary">
                {t("weather")}
              </a>
            </div>

            <div className="card">
              <h3>🛒 {t("marketplaceTitle")}</h3>
              <p>{t("marketplaceDesc")}</p>
              <a href="/marketplace" className="btn btn-primary">
                {t("marketplace")}
              </a>
            </div>

            <div className="card">
              <h3>🌱 Crop Guidance</h3>
              <p>Get personalized crop recommendations based on your soil type, location, and weather conditions.</p>
              <a href="/disease-detection" className="btn btn-primary">
                Get Guidance
              </a>
            </div>

            <div className="card">
              <h3>🔬 {t("diseaseTitle")}</h3>
              <p>{t("diseaseDesc")}</p>
              <a href="/disease-detection" className="btn btn-primary">
                {t("diseaseDetection")}
              </a>
            </div>

            <div className="card">
              <h3>🤖 {t("aiChatTitle")}</h3>
              <p>{t("aiChatDesc")}</p>
              <button className="btn btn-primary" onClick={() => setIsChatbotOpen(true)}>
                {t("chat")}
              </button>
            </div>

            <div className="card">
              <h3>📊 Analytics</h3>
              <p>Track your farming progress, analyze yields, and optimize your agricultural practices.</p>
              <a href="/dashboard" className="btn btn-primary">
                {t("dashboard")}
              </a>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="container">
          <div className="card" style={{ textAlign: "center" }}>
            <h2>Empowering Farmers Across India</h2>
            <div className="grid grid-3" style={{ marginTop: "2rem" }}>
              <div>
                <h3 style={{ color: "#7cb342", fontSize: "2.5rem" }}>10,000+</h3>
                <p>Registered Farmers</p>
              </div>
              <div>
                <h3 style={{ color: "#7cb342", fontSize: "2.5rem" }}>50,000+</h3>
                <p>Products Listed</p>
              </div>
              <div>
                <h3 style={{ color: "#7cb342", fontSize: "2.5rem" }}>1M+</h3>
                <p>Successful Transactions</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Chatbot Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsChatbotOpen(true)}
        style={{ display: isChatbotOpen ? "none" : "block" }}
      >
        💬
      </button>

      {/* Chatbot Component */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} user={user} />
    </div>
  )
}

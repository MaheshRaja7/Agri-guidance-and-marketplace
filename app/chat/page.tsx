"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "../../components/Header"
import Chatbot from "../../components/Chatbot"

export default function ChatPage() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

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
        <div className="card">
          <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#2d5016" }}>
            Chat with AgriBot - Your AI Agricultural Assistant
          </h1>

          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p>Get instant answers to your farming questions from our AI-powered agricultural expert.</p>
            <p>
              <strong>Ask about:</strong> Crop cultivation, Disease identification, Soil management, Irrigation, Pest
              control, Weather advice, and more!
            </p>
          </div>

          <div
            style={{
              position: "relative",
              height: "600px",
              border: "2px solid #7cb342",
              borderRadius: "15px",
              overflow: "hidden",
            }}
          >
            <Chatbot isOpen={true} onClose={() => {}} user={user} />
          </div>
        </div>

        <div className="grid grid-3" style={{ marginTop: "2rem" }}>
          <div className="card">
            <h3>🌱 Crop Guidance</h3>
            <p>Ask about specific crops, planting seasons, care instructions, and harvesting tips.</p>
            <small>
              <strong>Example:</strong> "How do I grow tomatoes in summer?"
            </small>
          </div>
          <div className="card">
            <h3>🦠 Disease Diagnosis</h3>
            <p>Describe symptoms and get advice on plant diseases and treatment options.</p>
            <small>
              <strong>Example:</strong> "My wheat plants have brown spots on leaves"
            </small>
          </div>
          <div className="card">
            <h3>🌍 Soil & Fertilizer</h3>
            <p>Get recommendations for soil improvement and fertilizer application.</p>
            <small>
              <strong>Example:</strong> "What fertilizer is best for rice cultivation?"
            </small>
          </div>
        </div>
      </main>
    </div>
  )
}

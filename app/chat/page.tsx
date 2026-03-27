"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "../../components/Header"
import AgriChatbot from "../../components/Chatbot"
import { Suspense } from "react"

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a1a0a", color: "#7cb342" }}>
      <div className="agri-chat-spinner" />
    </div>}>
      <ChatContent />
    </Suspense>
  )
}

function ChatContent() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header
        user={user}
        onLogout={() => {
          setUser(null)
          localStorage.removeItem("user")
          router.push("/")
        }}
      />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <AgriChatbot isOpen={true} onClose={() => router.push("/")} user={user} />
      </div>
    </div>
  )
}

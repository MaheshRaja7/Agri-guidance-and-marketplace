"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

interface ChatMessage {
  id: string
  message: string
  response: string
  timestamp: Date
  isUser: boolean
  category?: string
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
  user?: any
}

export default function Chatbot({ isOpen, onClose, user }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([
        {
          id: "welcome",
          message: "",
          response:
            "Hello! I'm AgriBot, your AI agricultural assistant. I can help you with crop cultivation, disease identification, soil management, irrigation, pest control, and farming techniques. What would you like to know?",
          timestamp: new Date(),
          isUser: false,
          category: "greeting",
        },
      ])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage("")
    setIsLoading(true)
    setIsTyping(true)

    // Add user message
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      message: userMessage,
      response: "",
      timestamp: new Date(),
      isUser: true,
    }

    setMessages((prev) => [...prev, newUserMessage])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.id || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Simulate typing delay
        setTimeout(() => {
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            message: "",
            response: data.response,
            timestamp: new Date(),
            isUser: false,
            category: data.category,
          }

          setMessages((prev) => [...prev, botMessage])
          setIsTyping(false)
        }, 1000)
      } else {
        throw new Error(data.error || "Failed to get response")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: "",
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date(),
        isUser: false,
        category: "error",
      }
      setMessages((prev) => [...prev, errorMessage])
      setIsTyping(false)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "crop_recommendation":
        return "🌱"
      case "disease":
        return "🦠"
      case "pest_control":
        return "🐛"
      case "soil_management":
        return "🌍"
      case "irrigation":
        return "💧"
      case "weather":
        return "🌤️"
      case "greeting":
        return "👋"
      default:
        return "🤖"
    }
  }

  if (!isOpen) return null

  return (
    <div className="chatbot-container" style={{ display: "block" }}>
      <div className="chatbot-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}>🤖</span>
          <div>
            <h4 style={{ margin: 0 }}>AgriBot</h4>
            <small style={{ opacity: 0.8 }}>Agricultural AI Assistant</small>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "0.25rem",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          height: "350px",
          overflowY: "auto",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: "1rem",
              display: "flex",
              justifyContent: msg.isUser ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "0.75rem",
                borderRadius: "10px",
                backgroundColor: msg.isUser ? "#7cb342" : "white",
                color: msg.isUser ? "white" : "#333",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              {!msg.isUser && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span>{getCategoryIcon(msg.category)}</span>
                  <small style={{ color: "#666", fontWeight: "bold" }}>AgriBot</small>
                </div>
              )}
              <div>{msg.isUser ? msg.message : msg.response}</div>
              <small style={{ opacity: 0.7, fontSize: "0.75rem" }}>{msg.timestamp.toLocaleTimeString()}</small>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
            <div
              style={{
                padding: "0.75rem",
                borderRadius: "10px",
                backgroundColor: "white",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>🤖</span>
                <small style={{ color: "#666", fontWeight: "bold" }}>AgriBot is typing</small>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ padding: "1rem", backgroundColor: "white" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about crops, diseases, farming techniques..."
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "2px solid #ddd",
              borderRadius: "25px",
              outline: "none",
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#7cb342",
              color: "white",
              border: "none",
              borderRadius: "25px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading || !inputMessage.trim() ? 0.6 : 1,
            }}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .typing-indicator {
          display: flex;
          gap: 2px;
        }
        .typing-indicator span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #7cb342;
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

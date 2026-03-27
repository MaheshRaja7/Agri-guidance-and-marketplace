"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import type React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ChatMessage {
  id: string
  role: "user" | "model"
  content: string
  imageUrl?: string
  timestamp: Date
}

interface ChatSession {
  sessionId: string
  title: string
  createdAt: string
  updatedAt: string
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
  user?: any
  initialLocation?: string
  initialSoilType?: string
}

export default function AgriChatbot({ isOpen, onClose, user }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMimeType, setImageMimeType] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [voiceLang, setVoiceLang] = useState("en-IN")

  const voiceLanguages = [
    { code: "en-IN", label: "English" },
    { code: "ta-IN", label: "தமிழ் (Tamil)" },
    { code: "hi-IN", label: "हिंदी (Hindi)" },
    { code: "te-IN", label: "తెలుగు (Telugu)" },
    { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)" },
    { code: "ml-IN", label: "മലയാളം (Malayalam)" },
    { code: "bn-IN", label: "বাংলা (Bengali)" },
    { code: "mr-IN", label: "मराठी (Marathi)" },
    { code: "gu-IN", label: "ગુજરાતી (Gujarati)" },
  ]

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const userId = user?.id || user?._id || "anonymous"

  useEffect(() => { loadSessions() }, [userId])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, isLoading])
  useEffect(() => { return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()) } }, [])

  const loadSessions = async () => {
    try {
      const res = await fetch(`/api/chat/sessions?userId=${userId}`)
      const data = await res.json()
      if (data.sessions) setSessions(data.sessions)
    } catch (e) { console.error("Failed to load sessions:", e) }
  }

  const loadSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages.map((m: any, i: number) => ({
          id: `${sessionId}_${i}`, role: m.role, content: m.content,
          imageUrl: m.imageUrl, timestamp: new Date(m.timestamp),
        })))
        setCurrentSessionId(sessionId)
      }
      if (window.innerWidth < 768) setSidebarOpen(false)
    } catch (e) { console.error("Failed to load session:", e) }
  }

  const startNewChat = () => {
    setMessages([]); setCurrentSessionId(null); clearAttachments()
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/chat/sessions/${sessionId}`, { method: "DELETE" })
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId))
      if (currentSessionId === sessionId) startNewChat()
    } catch (e) { console.error("Failed to delete session:", e) }
  }

  const clearAttachments = () => {
    setImagePreview(null); setImageBase64(null); setImageMimeType(null); setAttachedFile(null)
    if (cameraOpen) closeCameraStream()
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; processImageFile(file)
  }

  const processImageFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result); setImageBase64(result.split(",")[1]); setImageMimeType(file.type)
    }
    reader.readAsDataURL(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.type.startsWith("image/")) { processImageFile(file) } else {
      setAttachedFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        setInputMessage(prev => prev ? `${prev}\n\n[File: ${file.name}]\n${text.slice(0, 3000)}` : `[File: ${file.name}]\n${text.slice(0, 3000)}`)
      }
      reader.readAsText(file)
    }
  }

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      streamRef.current = stream; setCameraOpen(true)
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() } }, 100)
    } catch (err) { console.error("Camera error:", err); cameraInputRef.current?.click() }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current; const video = videoRef.current
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
    setImagePreview(dataUrl); setImageBase64(dataUrl.split(",")[1]); setImageMimeType("image/jpeg")
    closeCameraStream()
  }

  const closeCameraStream = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    setCameraOpen(false)
  }

  const toggleVoiceRecording = () => {
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Voice recognition is not supported in this browser. Please use Chrome."); return }
    const recognition = new SR()
    recognition.continuous = false; recognition.interimResults = true; recognition.lang = voiceLang
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("")
      setInputMessage(transcript)
    }
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = (event: any) => { console.error("Voice error:", event.error); setIsRecording(false) }
    recognitionRef.current = recognition; recognition.start(); setIsRecording(true)
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if ((!inputMessage.trim() && !imageBase64) || isLoading) return
    const userMsg = inputMessage.trim(); setInputMessage(""); setIsLoading(true)

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`, role: "user",
      content: userMsg || "📷 Image uploaded for analysis",
      imageUrl: imagePreview || undefined, timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    const sendImg = imageBase64; const sendMime = imageMimeType; clearAttachments()

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId: currentSessionId, imageBase64: sendImg, mimeType: sendMime, userId }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, { id: `bot_${Date.now()}`, role: "model", content: data.response, timestamp: new Date() }])
        if (!currentSessionId && data.sessionId) setCurrentSessionId(data.sessionId)
        loadSessions()
      } else { throw new Error(data.error || "Failed to get response") }
    } catch (error: any) {
      setMessages(prev => [...prev, { id: `error_${Date.now()}`, role: "model", content: `⚠️ ${error.message || "Something went wrong."}`, timestamp: new Date() }])
    } finally { setIsLoading(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }

  const autoResize = useCallback(() => {
    const ta = textareaRef.current
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px" }
  }, [])

  if (!isOpen) return null

  return (
    <div className="agri-chat-layout">
      {/* Sidebar */}
      <div className={`agri-chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>💬 Chats</h3>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <button className="new-chat-btn" onClick={startNewChat}><span>✨</span> New Chat</button>
        <div className="sessions-list">
          {sessions.length === 0 && <div className="no-sessions"><span>🌱</span><p>No conversations yet</p></div>}
          {sessions.map(s => (
            <div key={s.sessionId} className={`session-item ${currentSessionId === s.sessionId ? "active" : ""}`} onClick={() => loadSession(s.sessionId)}>
              <div className="session-info">
                <span className="session-title">{s.title}</span>
                <span className="session-date">{new Date(s.updatedAt || s.createdAt).toLocaleDateString()}</span>
              </div>
              <button className="delete-session-btn" onClick={(e) => deleteSession(s.sessionId, e)}>🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Chat */}
      <div className="agri-chat-main">
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div className="chat-header-info">
              <div className="bot-avatar">🤖</div>
              <div><h4>AgriBot AI</h4><span className="status-dot">● Online</span></div>
            </div>
          </div>
          <div className="chat-header-right">
            <button className="new-chat-btn-header" onClick={startNewChat}>✨ New</button>
          </div>
        </div>

        <div className="messages-area">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-icon">🌾</div>
              <h2>Welcome to AgriBot AI</h2>
              <p>Your intelligent agricultural assistant powered by Google Gemini</p>
              <div className="quick-actions">
                <button onClick={() => setInputMessage("What crops should I grow this season?")}>🌱 Crop Recommendations</button>
                <button onClick={() => setInputMessage("How to control pests naturally?")}>🐛 Pest Control</button>
                <button onClick={() => setInputMessage("What's the best irrigation method for rice?")}>💧 Irrigation Advice</button>
                <button onClick={() => setInputMessage("Tell me about organic farming techniques")}>🌿 Organic Farming</button>
                <button onClick={() => fileInputRef.current?.click()}>📷 Scan Plant Disease</button>
                <button onClick={() => setInputMessage("What is the current weather forecast for farming?")}>🌤️ Weather & Farming</button>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.role}`}>
              <div className="message-avatar">{msg.role === "user" ? "👤" : "🤖"}</div>
              <div className={`message-bubble ${msg.role}`}>
                {msg.imageUrl && <div className="message-image"><img src={msg.imageUrl} alt="Uploaded" /></div>}
                {msg.role === "model" ? (
                  <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
                ) : (<p>{msg.content}</p>)}
                <span className="message-time">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-row model">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble model typing">
                <div className="typing-dots"><span></span><span></span><span></span></div>
                <span className="typing-text">AgriBot is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {cameraOpen && (
          <div className="camera-modal">
            <div className="camera-container">
              <video ref={videoRef} autoPlay playsInline />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div className="camera-controls">
                <button className="capture-btn" onClick={capturePhoto}>📸 Capture</button>
                <button className="cancel-btn" onClick={closeCameraStream}>✕ Cancel</button>
              </div>
            </div>
          </div>
        )}

        {imagePreview && (
          <div className="image-preview-bar">
            <img src={imagePreview} alt="Preview" /><span>Image attached</span>
            <button onClick={clearAttachments}>✕</button>
          </div>
        )}

        {attachedFile && !imagePreview && (
          <div className="image-preview-bar">
            <span>📄</span><span>{attachedFile.name}</span>
            <button onClick={clearAttachments}>✕</button>
          </div>
        )}

        <div className="input-area">
          <div className="input-actions">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} style={{ display: "none" }} />
            <button className="action-btn" onClick={() => fileInputRef.current?.click()} title="Upload Image">🖼️</button>
            <button className="action-btn" onClick={openCamera} title="Camera">📷</button>
            <button className="action-btn" onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = ".txt,.csv,.json,.pdf,.doc,.docx"; i.onchange = (e: any) => handleFileSelect(e); i.click() }} title="Upload File">📎</button>
            <select className="voice-lang-select" value={voiceLang} onChange={e => setVoiceLang(e.target.value)} title="Voice Language">
              {voiceLanguages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <button className={`action-btn voice-btn ${isRecording ? "recording" : ""}`} onClick={toggleVoiceRecording} title={isRecording ? "Stop Recording" : `Voice (${voiceLanguages.find(l => l.code === voiceLang)?.label})`}>
              {isRecording ? "⏹️" : "🎤"}
            </button>
          </div>
          <div className="input-container">
            <textarea ref={textareaRef} value={inputMessage} onChange={e => { setInputMessage(e.target.value); autoResize() }} onKeyDown={handleKeyDown} placeholder={isRecording ? "🎤 Listening..." : "Ask about crops, diseases, farming..."} disabled={isLoading} rows={1} />
            <button className="send-btn" onClick={() => handleSendMessage()} disabled={isLoading || (!inputMessage.trim() && !imageBase64)} title="Send">
              {isLoading ? <div className="agri-chat-spinner small" /> : "➤"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

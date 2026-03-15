"use client"
import { useState, useEffect } from "react"
import Header from "../components/Header"
import Chatbot from "../components/Chatbot"
import { useLanguage } from "@/contexts/LanguageContext"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
    <div className="min-h-screen bg-transparent">
      <Header
        user={user}
        onLogout={() => {
          setUser(null)
          localStorage.removeItem("user")
        }}
      />

      <main className="container mx-auto space-y-10 py-12">
        <section className="rounded-2xl bg-white/80 p-10 shadow-lg backdrop-blur-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-800">{t("welcomeTitle")}</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              {t("welcomeDescription")}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row items-center justify-center">
            <Link href="/marketplace" className="w-full sm:w-auto">
              <Button className="w-full">{t("marketplace")}</Button>
            </Link>
            <Link href="/disease-detection" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">
                {t("diseaseDetection")}
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>🌤️ {t("weatherTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("weatherDesc")}</p>
              <Link href="/weather">
                <Button className="w-full">{t("weather")}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🛒 {t("marketplaceTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("marketplaceDesc")}</p>
              <Link href="/marketplace">
                <Button className="w-full">{t("marketplace")}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤖 {t("aiChatTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("aiChatDesc")}</p>
              <Button className="w-full" onClick={() => setIsChatbotOpen(true)}>
                {t("chat")}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl bg-white/80 p-10 shadow-lg">
          <h2 className="text-2xl font-semibold text-green-800">Empowering Farmers Across India</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-muted/20 p-6 text-center">
              <p className="text-4xl font-bold text-green-700">10,000+</p>
              <p className="text-sm text-muted-foreground">Registered Farmers</p>
            </div>
            <div className="rounded-xl border border-muted/20 p-6 text-center">
              <p className="text-4xl font-bold text-green-700">50,000+</p>
              <p className="text-sm text-muted-foreground">Products Listed</p>
            </div>
            <div className="rounded-xl border border-muted/20 p-6 text-center">
              <p className="text-4xl font-bold text-green-700">1M+</p>
              <p className="text-sm text-muted-foreground">Successful Transactions</p>
            </div>
          </div>
        </section>
      </main>

      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} user={user} />
    </div>
  )
}

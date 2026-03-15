import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import "@/styles/google-translate.css"
import { ClientLanguageProvider } from "@/components/ClientLanguageProvider"
import Background from "@/components/Background"

export const metadata: Metadata = {
  title: "AgriGuide - Agricultural Marketplace & Guidance Platform",
  description: "Complete agricultural solution with marketplace, weather updates, crop guidance, and disease detection",
  generator: "AgriGuide Platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Background />
        <ClientLanguageProvider>{children}</ClientLanguageProvider>
      </body>
    </html>
  )
}

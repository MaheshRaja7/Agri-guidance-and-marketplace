import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "../../../lib/database"
import { AgriculturalAI } from "../../../lib/ai-chatbot"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userId } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Check if the query is agriculture-related
    if (!AgriculturalAI.isAgriculturalQuery(message)) {
      return NextResponse.json({
        response:
          "I'm AgriBot, specialized in agricultural guidance. Please ask me questions related to farming, crops, plant diseases, soil management, irrigation, or other agricultural topics. How can I help you with your farming needs?",
        category: "general",
      })
    }

    // Categorize the query
    const category = AgriculturalAI.categorizeQuery(message)

    // Generate AI response
    const response = AgriculturalAI.generateResponse(message, category)

    // Save chat message to database if userId is provided
    if (userId) {
      await DatabaseService.saveChatMessage({
        userId,
        message: message.trim(),
        response,
        category: category as any,
      })
    }

    return NextResponse.json({
      response,
      category,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}

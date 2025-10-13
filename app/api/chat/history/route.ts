import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "../../../../lib/database"
import { AuthService } from "../../../../lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = AuthService.extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const chatHistory = await DatabaseService.getChatHistory(decoded.userId)

    return NextResponse.json({ chatHistory })
  } catch (error) {
    console.error("Chat history API error:", error)
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 })
  }
}

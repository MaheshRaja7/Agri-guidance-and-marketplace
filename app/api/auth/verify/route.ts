import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "../../../../lib/auth"
import { DatabaseService } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = AuthService.extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await DatabaseService.getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        city: user.city,
        area: user.area,
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

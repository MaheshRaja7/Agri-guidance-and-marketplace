import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "../../../../lib/database"
import { AuthService } from "../../../../lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, userType, area, city } = body

    // Validate required fields
    if (!name || !email || !password || !phone || !userType || !city) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password)

    // Create user
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      userType: userType as "farmer" | "customer",
      area: userType === "farmer" ? area : undefined,
      city,
    }

    const result = await DatabaseService.createUser(userData)

    // Generate token
    const user = { _id: result.insertedId, email, userType }
    const token = AuthService.generateToken(user)

    return NextResponse.json({
      message: "User registered successfully",
      token,
      user: {
        id: result.insertedId,
        name,
        email,
        userType,
        city,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

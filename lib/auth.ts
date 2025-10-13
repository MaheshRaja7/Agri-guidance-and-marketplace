import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { User } from "./mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  static generateToken(user: Partial<User>): string {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return null
    }
  }

  static extractTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7)
    }
    return null
  }
}

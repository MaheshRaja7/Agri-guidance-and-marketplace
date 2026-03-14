import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { User } from "./mongodb"

function getJwtSecret() {
  return process.env.JWT_SECRET || "your-secret-key"
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, getJwtSecret())
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
      getJwtSecret(),
      { expiresIn: "7d" },
    )
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, getJwtSecret())
    } catch (error) {
      return null
    }
  }

  static extractTokenFromRequest(request: any): string | null {
    // Prefer Authorization header (Bearer token)
    const authHeader = request.headers?.get?.("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7)
    }

    // Next.js server-side: token cookie (set by login/register)
    const cookieToken = request.cookies?.get?.("token")?.value
    if (cookieToken) {
      return cookieToken
    }

    // Fallback: parse token from cookie header string
    const cookieHeader = request.headers?.get?.("cookie")
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)
      if (match) {
        return match[1]
      }
    }

    return null
  }
}

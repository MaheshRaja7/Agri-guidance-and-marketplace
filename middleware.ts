import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AuthService } from "./lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/farmer", "/customer"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set("x-user-id", decoded.userId)
    response.headers.set("x-user-type", decoded.userType)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/farmer/:path*", "/customer/:path*"],
}

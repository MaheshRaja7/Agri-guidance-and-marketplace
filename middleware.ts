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

    // DEBUG: ensure token and decoding works (remove after fixing)
    // console.log('middleware token:', !!token, 'auth header:', !!request.headers.get('authorization'))

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // NOTE: Edge middleware cannot reliably access private env variables (like JWT_SECRET), so we only enforce that a token exists.
    // The token will be fully validated by API routes (which run on the Node.js runtime and can access the secret).
    const response = NextResponse.next()
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/farmer/:path*", "/customer/:path*"],
}

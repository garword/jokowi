import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get authentication status from cookie
  const isAuthenticated = request.cookies.get("isAuthenticated")?.value === "true";
  
  // Allow access to login page even if authenticated (will redirect in component)
  // Allow access to static assets and API routes
  if (pathname.startsWith("/login") || 
      pathname.startsWith("/api") || 
      pathname.startsWith("/_next") ||
      pathname.includes(".")) {
    return NextResponse.next();
  }
  
  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/dashboard/config"];
  
  // If trying to access protected route without authentication, redirect to login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing root path and not authenticated, redirect to login
  if (pathname === "/" && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: "No token found"
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Check if token is still valid based on remember me
      let isValid = true;
      if (decoded.rememberMe) {
        // For remember me tokens, check if less than 1 day old
        const tokenAge = Date.now() / 1000 - decoded.iat; // age in seconds
        if (tokenAge > 24 * 60 * 60) { // more than 1 day
          isValid = false;
        }
      } else {
        // For session tokens, check if less than 1 hour old
        const tokenAge = Date.now() / 1000 - decoded.iat; // age in seconds
        if (tokenAge > 60 * 60) { // more than 1 hour
          isValid = false;
        }
      }

      return NextResponse.json({
        success: true,
        valid: isValid,
        user: isValid ? {
          id: decoded.userId,
          username: decoded.username,
          rememberMe: decoded.rememberMe
        } : null,
        message: isValid ? "Session is valid" : "Session expired"
      });

    } catch (error) {
      console.error("Session check error:", error);
      return NextResponse.json({
        success: false,
        valid: false,
        error: "Invalid token"
      });
    }
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({
      success: false,
      valid: false,
      error: "Server error"
    });
  }
}
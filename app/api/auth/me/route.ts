// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/auth/me
 * 
 * Returns the current user's role (read from a cookie named "userRole"),
 * or 401 if no such cookie is present.
 */
export async function GET(request: NextRequest) {
  // Try to read the cookie the client set on login
  const cookie = request.cookies.get("userRole")
  const role = cookie?.value

  if (!role) {
    // Not authenticated
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    )
  }

  // Return the role back to the client
  return NextResponse.json({ role })
}

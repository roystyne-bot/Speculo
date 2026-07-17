import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Redirects an authenticated user away from the landing page.
// getSessionCookie only checks for the presence of a valid-looking cookie
// (no DB call), so this is cheap to run on every request to "/".
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (sessionCookie) {
    return NextResponse.redirect(new URL("/interview/setup", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
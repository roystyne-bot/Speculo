import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// getSessionCookie only checks for the presence of a valid-looking cookie
// (no DB call), so this is cheap to run on every matched request. It is a
// UX-layer check, not the security boundary — mutations must still verify
// identity server-side via ctx.auth.getUserIdentity().
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Signed-in users shouldn't land back on the marketing/landing page.
  if (pathname === "/" && sessionCookie) {
    return NextResponse.redirect(new URL("/interview/setup", request.url));
  }

  // Authenticated-only areas — send signed-out users to sign-in.
  const isProtected = pathname.startsWith("/interview") || pathname.startsWith("/dashboard");
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/interview/:path*", "/dashboard/:path*"],
};
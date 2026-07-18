import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// getSessionCookie only checks for the presence of a valid-looking cookie
// (no DB call), so this is cheap to run on every matched request. It is a
// UX-layer check, not the security boundary — mutations must still verify
// identity server-side via ctx.auth.getUserIdentity(), since a cookie's
// mere presence here doesn't prove the session is still valid.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // TEMPORARY — remove once this is confirmed working.
  console.log("[proxy]", pathname, "cookie found:", !!sessionCookie);

  // Signed-in users shouldn't land back on the marketing/landing page.
  if (pathname === "/" && sessionCookie) {
    return NextResponse.redirect(new URL("/interview/setup", request.url));
  }

  // Authenticated-only areas — send signed-out users to sign-in instead of
  // letting them view/interact with pages that assume a logged-in user.
  const isProtected = pathname.startsWith("/interview") || pathname.startsWith("/dashboard");
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/interview/:path*", "/dashboard/:path*"],
};
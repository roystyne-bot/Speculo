// src/app/ConvexClientProvider.tsx
"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { ReactNode, useCallback } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function useAuthFromBetterAuth() {
  const { data: session, isPending } = authClient.useSession();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (session) {
        // Better Auth stores the token in the cookie — return the session token
        return session.session.token ?? null;
      }
      return null;
    },
    [session]
  );

  return {
    isLoading: isPending,
    isAuthenticated: !!session,
    fetchAccessToken,
  };
}

export function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromBetterAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
} 
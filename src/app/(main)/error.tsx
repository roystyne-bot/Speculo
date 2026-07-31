"use client";

import { useEffect } from "react";
import { Quicksand } from "next/font/google";
import Link from "next/link";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["600", "700"] });

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="text-center max-w-sm">
        <p className="text-xs uppercase tracking-wide text-spring">Something went wrong</p>
        <h1 className={`${quicksand.className} mt-3 text-3xl font-semibold text-foreground`}>
          That didn't work
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          An unexpected error occurred. You can try again, or head back to the dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 text-sm font-semibold rounded-full bg-spring text-spring-deep hover:opacity-90 transition-opacity duration-150"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-sm rounded-full border border-border text-foreground/80 hover:text-foreground transition-colors duration-150"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import { Quicksand } from "next/font/google";
import Link from "next/link";


const quicksand = Quicksand({ subsets: ["latin"], weight: ["600", "700"] });

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="text-center max-w-sm">
        <p className="text-8xl uppercase tracking-wide text-green-400">404</p>
        <h1 className={`${quicksand.className} mt-3 text-3xl font-semibold text-foreground`}>
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-5 py-2.5 text-sm font-semibold rounded-full bg-spring text-spring-deep hover:opacity-90 transition-opacity duration-150"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
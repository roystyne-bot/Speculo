"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client"; // adjust to your actual client path

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await (authClient as any).forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-white px-6 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#2FDD79] text-sm font-space-grotesk mb-10 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="font-quicksand text-3xl mb-2">Forgot Password</h1>
        <p className="text-white/60 text-sm mb-8 font-space-grotesk">
          Enter your email and we'll send you a reset link.
        </p>

        {status === "sent" ? (
          <p className="text-[#2FDD79]">Check your inbox for a reset link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[#2FDD79]"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-[#2FDD79] text-[#0F1115] font-semibold rounded-lg py-3"
            >
              {status === "sending" ? "Sending..." : "Send Reset Link"}
            </button>
            {status === "error" && (
              <p className="text-red-400 text-sm">Something went wrong. Try again.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
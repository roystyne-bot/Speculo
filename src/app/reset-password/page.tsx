"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setStatus("sending");
    try {
      await (authClient as any).resetPassword({ newPassword: password, token });
      router.push("/login");
    } catch {
      setStatus("error");
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0F1115] text-white px-6 py-16 text-center">
        <p className="text-white/60">Invalid or missing reset link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-white px-6 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="font-quicksand text-3xl mb-8">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[#2FDD79]"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-[#2FDD79] text-[#0F1115] font-semibold rounded-lg py-3"
          >
            {status === "sending" ? "Resetting..." : "Reset Password"}
          </button>
          {status === "error" && (
            <p className="text-red-400 text-sm">Reset link expired or invalid. Try again.</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F1115]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
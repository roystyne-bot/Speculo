"use client";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function ContactPage() {
  const submitForm = useAction(api.contact.submitContactForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      await submitForm({
        name: form.get("name") as string,
        email: form.get("email") as string,
        subject: form.get("subject") as string,
        message: form.get("message") as string,
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-white px-6 py-16 flex justify-center">
      <div className="w-full max-w-lg">
        <h1 className="font-quicksand text-3xl mb-2">Contact Support</h1>
        <p className="text-white/60 mb-8 font-space-grotesk text-sm">
          Questions, bugs, feedback — we read everything.
        </p>
        {status === "sent" ? (
          <p className="text-[#2FDD79]">Message sent. We'll get back to you soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" required placeholder="Name" className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[#2FDD79]" />
            <input name="email" type="email" required placeholder="Email" className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[#2FDD79]" />
            <input name="subject" required placeholder="Subject" className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[#2FDD79]" />
            <textarea name="message" required rows={5} placeholder="Message" className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-[#2FDD79]" />
            <button type="submit" disabled={status === "sending"} className="w-full bg-[#2FDD79] text-[#0F1115] font-semibold rounded-lg py-3">
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
            {status === "error" && <p className="text-red-400 text-sm">Something went wrong. Try again.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
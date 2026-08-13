

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Speculo",
  description:
    "Speculo is free during beta. Practice unlimited mock interviews with AI feedback, company-tagged questions, and performance analytics coming soon.",
  alternates: {
    canonical: "https://speculo-two.vercel.app/pricing",
  },
  openGraph: {
    title: "Speculo Pricing",
    description:
      "Free during beta. See what's coming with Pro and Team plans for AI-powered mock interview prep.",
    url: "https://speculo-two.vercel.app/pricing",
    siteName: "Speculo",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Speculo Pricing",
    description:
      "Free during beta. Unlimited mock interviews with AI feedback — Pro and Team plans coming soon.",
    images: ["/og-image.png"],
  },
};


const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    tag: "Current — Free during beta",
    description: "Get comfortable with mock interviews, no strings attached.",
    features: [
      "3 mock interviews / month",
      "Core question bank",
      "AI feedback on answers",
      "Text-to-speech playback",
    ],
    limitations: ["No company-tagged questions", "No performance analytics"],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    tag: "Coming soon",
    description: "For active job seekers who want unlimited reps.",
    features: [
      "Unlimited mock interviews",
      "Company-tagged questions (e.g. \"asked at Google\")",
      "Detailed performance analytics",
      "Resume-informed question generation",
      "Priority support",
    ],
    limitations: ["Single user only"],
    cta: "Notify Me",
    highlighted: true,
  },
  {
    name: "Team",
    price: "Custom",
    period: "",
    tag: "Coming soon",
    description: "For bootcamps, universities, and career teams prepping cohorts.",
    features: [
      "Everything in Pro",
      "Bulk seats & admin dashboard",
      "Cohort-level analytics",
      "Custom onboarding",
    ],
    limitations: ["Not self-serve — requires setup call"],
    cta: "Contact Us",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#2FDD79] text-sm font-space-grotesk mb-10 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="text-center mb-4">
          <h1 className="font-quicksand text-4xl mb-3">Pricing</h1>
          <p className="text-white/60 font-space-grotesk max-w-md mx-auto">
            Speculo is currently free during beta. Pricing below reflects
            what's coming once we launch.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 flex flex-col ${
                tier.highlighted
                  ? "bg-[#2FDD79]/10 ring-1 ring-[#2FDD79]"
                  : "bg-white/5"
              }`}
            >
              <span className="text-xs font-space-grotesk text-[#2FDD79] mb-2">
                {tier.tag}
              </span>
              <h2 className="font-quicksand text-2xl mb-1">{tier.name}</h2>
              <div className="mb-4">
                <span className="text-3xl font-jetbrains-mono">{tier.price}</span>
                <span className="text-white/50 text-sm ml-1">{tier.period}</span>
              </div>
              <p className="text-white/60 text-sm mb-2 font-space-grotesk">
                {tier.description}
              </p>
              {tier.name === "Pro" && (
                <p className="text-xs text-[#2FDD79]/80 mb-4 font-space-grotesk">
                  Job Search Pass — $49 for 3 months
                </p>
              )}

              <ul className="space-y-2 mb-4 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="text-sm flex gap-2">
                    <span className="text-[#2FDD79]">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
                {tier.limitations.map((l) => (
                  <li key={l} className="text-sm flex gap-2 text-white/40">
                    <span>✕</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled
                className={`w-full rounded-lg py-3 font-semibold mt-auto ${
                  tier.highlighted
                    ? "bg-[#2FDD79] text-[#0F1115]"
                    : "bg-white/10 text-white"
                } opacity-80 cursor-default`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
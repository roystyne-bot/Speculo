import type { Metadata } from "next";
import SpeculoFAQ from "@/components/web/FAQ";
import { FAQS } from "../faqData";

export const metadata: Metadata = {
  title: "FAQ — Speculo",
  description:
    "Answers on how Speculo generates interview questions, scores your answers, and keeps your session data private.",
  alternates: { canonical: "https://speculo-two.vercel.app/faq" },
  openGraph: {
    title: "Speculo FAQ",
    description: "Everything people ask before their first AI mock interview.",
    url: "https://speculo-two.vercel.app/faq",
    siteName: "Speculo",
    images: ["/og-image.png"],
    type: "website",
  },
};

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SpeculoFAQ />
    </>
  );
}
"use client"


import React from "react";
import { useState } from "react";
import { Quicksand } from "next/font/google";


const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const FAQS = [
  {
    q: "How does Speculo generate interview questions?",
    a: "Every session is built live from your target role and resume — Speculo pulls relevant technical and behavioral questions through Groq's LLM, so no two sessions repeat the same script.",
  },
  {
    q: "Can it actually tell if my answer was good?",
    a: "Each response is scored against a rubric checking correctness, structure, and depth, then paired with a debrief that names exactly what to fix before your next attempt.",
  },
  {
    q: "What kind of interviews can I practice?",
    a: "Technical rounds, system design, and behavioral screens are all supported, with difficulty that adapts as your streak and readiness score climb.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Speculo runs fully in the browser — sign in, pick a track, and you're in a session in under a minute.",
  },
  {
    q: "Is my session data private?",
    a: "Every session, transcript, and score is scoped to your account only. Nothing is shared across users, and nothing trains a model on your answers.",
  },
  {
    q: "Are Speculo interviews available in English?",
    a: "Yes. All Speculo interviews are conducted in English, including the interview questions and AI-generated responses. But future updates will be made",
  },
];

export default function SpeculoFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      className={`relative overflow-hidden bg-background px-6 md:px-10 ${quicksand.className}`}
      style={{
        minHeight: "100vh",
        padding: "72px 20px",
        fontFamily: quicksand.style.fontFamily,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p
          className="text-foreground/80 font-semibold tracking-widest uppercase"
          style={{
            color: "#2FDD79",
            fontSize: 13,
            letterSpacing: 3,
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          FAQ
        </p>
        <h2
          className="text-foreground font-semibold tracking-tight"
          style={{
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.05,
            marginBottom: 12,
            letterSpacing: -1,
          }}
        >
          Questions, answered.
        </h2>
        <p
          className="text-foreground/80"
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            marginBottom: 48,
            maxWidth: 480,
          }}
        >
          Everything people ask before their first mock interview, so your first
          session can just be about the practice.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-gray-100 dark:bg-[#16181D] border border-gray-200 dark:border-transparent"
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  transition: "background 0.25s ease",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 20,
                    padding: "26px 24px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    className={`${quicksand.className} text-foreground`}
                    style={{
                      display: "flex",
                      gap: 20,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: 600,
                        color: "#2FDD79",
                        opacity: isOpen ? 1 : 0.28,
                        transition: "opacity 0.25s ease",
                        minWidth: 44,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-gray-900 dark:text-[#F5F6F7]"
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        lineHeight: 1.35,
                      }}
                    >
                      {item.q}
                    </span>
                  </div>

                  <span
                    className={
                      isOpen ? "" : "text-gray-400 dark:text-[#8A8F98]"
                    }
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isOpen ? "#2FDD79" : undefined,
                      fontSize: 20,
                      marginTop: 2,
                      transition: "transform 0.25s ease, color 0.25s ease",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    +
                  </span>
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.3s ease",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <p
                      className="text-gray-500 dark:text-[#8A8F98]"
                      style={{
                        fontSize: 15,
                        lineHeight: 1.65,
                        padding: "0 24px 26px 88px",
                        margin: 0,
                      }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

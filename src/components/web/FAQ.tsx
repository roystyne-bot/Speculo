import React from "react";
import { useState } from "react";
import { Quicksand } from "next/font/google";


const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"] });



const FAQS = [
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
];

export default function SpeculoFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      style={{
        background: "#0F1115",
        minHeight: "100vh",
        padding: "72px 20px",
        fontFamily: quicksand.style.fontFamily,
      }}
    >
      

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p
          style={{
            color: "#2FDD79",
            fontSize: 13,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          FAQ
        </p>
        <h2
          style={{
            color: "#F5F6F7",
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
          style={{
            color: "#8A8F98",
            fontSize: 16,
            lineHeight: 1.6,
            marginBottom: 48,
            maxWidth: 480,
          }}
        >
          Everything people ask before their first mock interview, so your
          first session can just be about the practice.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  background: "#16181D",
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
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
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
                      style={{
                        color: "#F5F6F7",
                        fontSize: 20,
                        fontWeight: 600,
                        lineHeight: 1.35,
                      }}
                    >
                      {item.q}
                    </span>
                  </div>

                  <span
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isOpen ? "#2FDD79" : "#8A8F98",
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
                      style={{
                        color: "#8A8F98",
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
"use client";

import { Quicksand } from "next/font/google";
import { SiGithub } from "react-icons/si";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["600", "700"] });

const PRODUCT_LINKS = [
  { label: "Home", href: "/" },
  { label: "Sign up", href: "/auth/sign-up" },
  { label: "Log in", href: "/auth/sign-in" },
];

const RESOURCE_LINKS = [
  { label: "Practice by role", href: "#roles" },
  { label: "GitHub", href: "https://github.com/roystyne-bot" },
];

export default function Footer() {
  return (
    <footer className="px-6 pt-20 pb-10 md:px-10" style={{ backgroundColor: "#0F1115", borderTop: "1px solid #1D2026" }}>
      <div className="mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#2FDD79" }} />
              <span className={`${quicksand.className} text-3xl font-bold`} style={{ color: "#F5F7FA" }}>
                Speculo
              </span>
            </div>
            <p className="mt-5 text-base italic leading-relaxed max-w-sm" style={{ color: "#9AA0AC" }}>
              "Every question deserves a real answer — and every answer deserves honest
              feedback. That's the whole point of practicing before it counts."
            </p>
            <a
              href="https://github.com/roystyne-bot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-9 h-9 rounded-lg items-center justify-center"
              style={{ backgroundColor: "#15181D", border: "1px solid #2A2D33", color: "#D6D9DE" }}
              aria-label="GitHub"
            >
              <SiGithub size={16} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 md:justify-items-end">
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: "#5A5F68" }}>
                Product
              </p>
              <ul className="mt-4 space-y-2.5">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-150 hover:text-white"
                      style={{ color: "#9AA0AC" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: "#5A5F68" }}>
                Resources
              </p>
              <ul className="mt-4 space-y-2.5">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-150 hover:text-white"
                      style={{ color: "#9AA0AC" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 flex justify-between items-center" style={{ borderTop: "1px solid #1D2026" }}>
          <p className="text-xs" style={{ color: "#5A5F68" }}>
            Speculo © {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
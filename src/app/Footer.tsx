"use client";

import { useLanguage } from "@/components/web/LanguageProvider";
import { Quicksand } from "next/font/google";
import { SiGithub } from "react-icons/si";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["600", "700"] });

const PRODUCT_META = [
  { key: "home", href: "/" },
  { key: "signUp", href: "/auth/sign-up" },
  { key: "logIn", href: "/auth/sign-in" },
];

// GitHub is a proper noun — not translated, same label in both languages.
const RESOURCE_META = [
  { key: "practiceByRole", href: "#roles" },
  { key: "github", href: "https://github.com/roystyne-bot", literal: "GitHub" },
];

export default function Footer() {
  const { t } = useLanguage();
  const PRODUCT_LINKS = PRODUCT_META.map((l) => ({ label: t(`Footer.${l.key}`), href: l.href }));
  const RESOURCE_LINKS = RESOURCE_META.map((l) => ({
    label: l.literal ?? t(`Footer.${l.key}`),
    href: l.href,
  }));

  return (
    <footer className="px-6 pt-20 pb-10 md:px-10 bg-background border-t border-border">
      <div className="mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-spring" />
              <span className={`${quicksand.className} text-3xl font-bold text-foreground`}>Speculo</span>
            </div>
            <p className="mt-5 text-base italic leading-relaxed max-w-sm text-muted-foreground">
              "{t("Footer.quote")}"
            </p>
            <a
              href="https://github.com/roystyne-bot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-9 h-9 rounded-lg items-center justify-center bg-card border border-border text-foreground/80"
              aria-label="GitHub"
            >
              <SiGithub size={16} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 md:justify-items-end">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("Footer.product")}
              </p>
              <ul className="mt-4 space-y-2.5">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("Footer.resources")}
              </p>
              <ul className="mt-4 space-y-2.5">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 flex justify-between items-center border-t border-border">
          <p className="text-xs text-muted-foreground">
            Speculo © {new Date().getFullYear()}. {t("Footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
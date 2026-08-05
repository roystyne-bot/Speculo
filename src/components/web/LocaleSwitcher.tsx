"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { ChevronDown } from "lucide-react";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;

export function LocaleSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center bg-green-700 gap-1 px-3 py-1.5 text-sm rounded-lg text-foreground/80"
      >
        {current.label}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50 border border-border bg-card">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm transition-colors duration-150 hover:bg-secondary"
              style={{ color: l.code === locale ? "#2FDD79" : undefined }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
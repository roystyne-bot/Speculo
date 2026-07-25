"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";




type Locale = "en" | "fr";
const dictionaries: Record<Locale, Record<string, unknown>> = { en, fr };

type LanguageContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Restore whatever the user picked last time, on mount only.
  useEffect(() => {
    const stored = localStorage.getItem("speculo-locale");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "en" || stored === "fr") setLocaleState(stored);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("speculo-locale", l);
  };

  // Dot-path lookup against the JSON structure, e.g. t("Navbar.roles")
  // walks dictionaries[locale].Navbar.roles. Falls back to the key itself
  // if a translation is missing, so a typo shows up as visible broken text
  // rather than a blank space or a crash.
  const t = (key: string): string => {
    const parts = key.split(".");
    let result: unknown = dictionaries[locale];
    for (const part of parts) {
      result = (result as Record<string, unknown> | undefined)?.[part];
    }
    return typeof result === "string" ? result : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // next-themes needs a mount check — the server can't know the user's
  // stored preference, so rendering the wrong icon for a split second on
  // first paint (then flipping) looks like a bug. Render nothing until
  // mounted instead.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-8 h-8" />; // reserves the space, avoids layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
      style={{ color: "#D6D9DE" }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
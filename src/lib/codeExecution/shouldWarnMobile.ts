// src/lib/codeExecution/shouldWarnMobile.ts

export function shouldWarnBeforePythonLoad(): boolean {
  if (typeof window === "undefined") return false;

  const isSmallScreen = window.innerWidth < 768;

  // navigator.connection is Chrome/Android-only; Safari iOS doesn't expose it,
  // so we fall back to screen size alone when it's unavailable
  const conn = (navigator as any).connection;
  const isSlowOrMetered =
    conn?.saveData === true ||
    conn?.effectiveType === "2g" ||
    conn?.effectiveType === "slow-2g" ||
    conn?.effectiveType === "3g";

  return isSmallScreen || isSlowOrMetered;
}
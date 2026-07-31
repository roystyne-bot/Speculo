"use client";

import { useEffect, useRef, useState } from "react";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["600", "700"] });

interface FeatureRowProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  reverse?: boolean;
}

export default function FeatureRow({ title, description, icon, reverse }: FeatureRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(prefersReduced);

    // Users with this preference get the final revealed state immediately,
    // with no animation and no observer — motion isn't just an aesthetic
    // choice for them, it can cause real discomfort.
    if (prefersReduced) {
      setInView(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    // No disconnect() here, and no isIntersecting guard — this is what
    // makes it re-trigger every time the section enters or leaves the
    // viewport, rather than firing once and staying revealed forever.
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transition = reducedMotion ? "none" : undefined;

  return (
    <div
      ref={ref}
      className={`flex flex-col bg-card border border-border ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-10 rounded-3xl p-8 md:p-12 transition-shadow duration-700`}
      style={{
        boxShadow: inView ? "0 0 30px -10px rgba(47,221,121,0.35)" : "none",
        transition,
      }}
    >
      <div
        className="flex-1 transition-all duration-700 ease-out"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateX(0)" : `translateX(${reverse ? "32px" : "-32px"})`,
          transition,
        }}
      >
        <h3 className={`${quicksand.className} text-2xl md:text-3xl font-semibold mb-4 text-foreground`}>
          {title}
        </h3>
        <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
      </div>

      <div
        className="flex-1 flex justify-center transition-all duration-700 ease-out delay-150"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "scale(1)" : "scale(0.75)",
          transition,
        }}
      >
        {/* Icon tile stays brand spring green in both themes on purpose —
            same reasoning as buttons/logo elsewhere: brand accents don't
            flip with the theme, only surfaces and text do. */}
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-3xl flex items-center justify-center bg-spring">
          {icon}
        </div>
      </div>
    </div>
  );
}
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
  // Default visible: no-JS clients and crawlers see full content immediately.
  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(prefersReduced);

    if (prefersReduced) {
      setInView(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    // Only start to the reveal animation if the element isn't already
    // visible on load, otherwise leave it in its default visible state.
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!alreadyVisible) {
      setInView(false);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // fire once, then stop — matches your comment's original intent
        }
      },
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
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-3xl flex items-center justify-center bg-spring">
          {icon}
        </div>
      </div>
    </div>
  );
}
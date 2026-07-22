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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-10 rounded-3xl p-8 md:p-12 transition-shadow duration-700`}
      style={{
        border: "1px solid #2A2D33",
        backgroundColor: "#15181D",
        boxShadow: inView ? "0 0 30px -10px rgba(47,221,121,0.35)" : "none",
      }}
    >
      <div
        className="flex-1 transition-all duration-700 ease-out"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateX(0)" : `translateX(${reverse ? "32px" : "-32px"})`,
        }}
      >
        <h3
          className={`${quicksand.className} text-2xl md:text-3xl font-semibold mb-4`}
          style={{ color: "#F5F7FA" }}
        >
          {title}
        </h3>
        <p className="text-base leading-relaxed" style={{ color: "#9AA0AC" }}>
          {description}
        </p>
      </div>

      <div
        className="flex-1 flex justify-center transition-all duration-700 ease-out delay-150"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "scale(1)" : "scale(0.75)",
        }}
      >
        <div
          className="w-48 h-48 md:w-56 md:h-56 rounded-3xl flex items-center justify-center"
          style={{ backgroundColor: "#2FDD79" }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useLanguage } from "@/components/web/LanguageProvider";
import { SiNextdotjs, SiTailwindcss, SiConvex } from "react-icons/si";
import { Groq } from "@lobehub/icons";

// Convex and Better Auth aren't AI-model brands, so they're outside
// @lobehub/icons' scope, and I couldn't verify either exists in any
// other icon package. Using a plain styled wordmark for these two rather
// than guessing at an inaccurate logo shape. If you get the official SVGs
// from their GitHub/docs and drop them in public/logos/, I can wire those
// in as local image imports instead.
const STACK = [
  { name: "Next.js", render: () => <SiNextdotjs size={26} color="#E8EDF8" /> },
  { name: "Tailwind CSS", render: () => <SiTailwindcss size={26} color="#38BDF8" /> },
  { name: "Groq", render: () => <Groq size={26} className="text-spring"/> },
  { name: "Convex", render: () => <SiConvex size={26} className="text-violet-600"/> },
  { name: "Better Auth", render: null },
];

function StackItem({ name, render }: { name: string; render: (() => React.ReactNode) | null }) {
  return (
    <div className="flex items-center gap-3 shrink-0 mx-2.5 px-6 py-4 rounded-xl bg-card border border-border">
      {render ? (
        render()
      ) : (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-secondary text-foreground/80">
          {name[0]}
        </div>
      )}
      <span className="text-base font-medium whitespace-nowrap text-foreground">{name}</span>
    </div>
  );
}

export default function TechStackRow() {
  const { t } = useLanguage();
  return (
    <section className="py-14 bg-background">
      <p className="text-center text-xs uppercase tracking-wide mb-6 text-muted-foreground">
        {t("TechStackRow.builtWith")}
      </p>

      {/* Bounded, centered container — the marquee scrolls within this box
          rather than spanning the full viewport edge to edge. */}
      <div
        className="relative mx-auto max-w-3xl overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      >
        <div className="flex w-max" style={{ animation: "marquee 22s linear infinite" }}>
          <div className="flex">
            {STACK.map((item) => (
              <StackItem key={item.name} {...item} />
            ))}
          </div>
          <div className="flex" aria-hidden="true">
            {STACK.map((item) => (
              <StackItem key={`${item.name}-dup`} {...item} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
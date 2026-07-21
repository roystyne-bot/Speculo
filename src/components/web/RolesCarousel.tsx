"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Quicksand } from "next/font/google";
import {
  ChevronLeft,
  ChevronRight,
  Layout,
  Server,
  Layers,
  GitBranch,
  Smartphone,
  Database,
  Cpu,
  Cloud,
} from "lucide-react";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"] });

// Small curated palette, cycled per card — not one color for everything,
// but not full rainbow chaos either. All still sit comfortably in the dark
// onyx palette.
const ROLES = [
  { icon: Layout, title: "Frontend", body: "React, state management, accessibility, performance.", color: "#2FDD79" },
  { icon: Server, title: "Backend", body: "APIs, databases, auth, and system reliability.", color: "#5B7FFF" },
  { icon: Layers, title: "Full-Stack", body: "End-to-end ownership, from schema to UI.", color: "#F5A623" },
  { icon: GitBranch, title: "DevOps", body: "CI/CD, infrastructure, and deployment strategy.", color: "#FF6B6B" },
  { icon: Smartphone, title: "Mobile", body: "Native and cross-platform app development.", color: "#A78BFA" },
  { icon: Database, title: "Data", body: "Pipelines, modeling, and data-driven decisions.", color: "#2FDD79" },
  { icon: Cpu, title: "Systems", body: "Low-level design, performance, and architecture.", color: "#5B7FFF" },
  { icon: Cloud, title: "Cloud", body: "Scalable infrastructure and cloud-native design.", color: "#F5A623" },
];

const MAX_CARD_WIDTH = 450; // px cap so it doesn't balloon on large monitors
const CARD_WIDTH_PCT = 62; // of track width, below the cap
const CARD_GAP = 20;
const AUTOPLAY_MS = 4000;
const TRANSITION_MS = 400;

// Clone the last card at the start and the first card at the end — this
// is what makes wrap-around possible without ever visually reversing.
const EXTENDED = [ROLES[ROLES.length - 1], ...ROLES, ROLES[0]];

export default function RolesCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [realIndex, setRealIndex] = useState(0); // 0..ROLES.length-1
  const [isPaused, setIsPaused] = useState(false);
  const isJumping = useRef(false);

  const scrollToExtendedIndex = useCallback((extIndex: number, smooth = true) => {
    const track = trackRef.current;
    const card = cardRefs.current[extIndex];
    if (!track || !card) return;
    const offset = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left: offset, behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Position at the first real card (extended index 1) on mount, no animation.
  useEffect(() => {
    scrollToExtendedIndex(1, false);
  }, [scrollToExtendedIndex]);

  const goTo = useCallback(
    (nextReal: number) => {
      const wrapped = (nextReal + ROLES.length) % ROLES.length;
      setRealIndex(wrapped);
      scrollToExtendedIndex(wrapped + 1, true);
    },
    [scrollToExtendedIndex],
  );

  const next = useCallback(() => {
    const track = trackRef.current;
    if (!track || isJumping.current) return;

    if (realIndex === ROLES.length - 1) {
      // Scroll onto the cloned first card, then silently jump back to the
      // real first card once the animation finishes — the clone makes the
      // motion continuous instead of snapping backward across the whole list.
      isJumping.current = true;
      scrollToExtendedIndex(EXTENDED.length - 1, true);
      setTimeout(() => {
        scrollToExtendedIndex(1, false);
        setRealIndex(0);
        isJumping.current = false;
      }, TRANSITION_MS + 50);
    } else {
      goTo(realIndex + 1);
    }
  }, [realIndex, goTo, scrollToExtendedIndex]);

  const prev = useCallback(() => {
    if (isJumping.current) return;

    if (realIndex === 0) {
      isJumping.current = true;
      scrollToExtendedIndex(0, true);
      setTimeout(() => {
        scrollToExtendedIndex(ROLES.length, false);
        setRealIndex(ROLES.length - 1);
        isJumping.current = false;
      }, TRANSITION_MS + 50);
    } else {
      goTo(realIndex - 1);
    }
  }, [realIndex, goTo, scrollToExtendedIndex]);

  // Autoplay, paused on hover.
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isPaused, next]);

  // Live scale/opacity falloff based on distance from track center.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    const update = () => {
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      cardRefs.current.forEach((card) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const distance = Math.abs(trackCenter - cardCenter);
        const normalized = Math.min(distance / card.clientWidth, 1);
        card.style.transform = `scale(${1 - normalized * 0.15})`;
        card.style.opacity = `${1 - normalized * 0.55}`; 
      });
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    track.addEventListener("scroll", handleScroll);
    return () => track.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="px-6 py-20 md:px-10"
      style={{ backgroundColor: "#0F1115" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-wide" style={{ color: "#2FDD79" }}>
          Practice by role
        </p>
        <h2 className={`${quicksand.className} mt-2 text-3xl font-semibold`} style={{ color: "#F5F7FA" }}>
          Built for the role you're interviewing for.
        </h2>

        <div className="relative mt-10">
          <div
            ref={trackRef}
            className="flex overflow-x-auto scroll-smooth pb-4"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", gap: CARD_GAP, perspective: 1300, transformStyle: "preserve-3d" }}
          >
            {EXTENDED.map((role, i) => (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="shrink-0 rounded-3xl p-8 bg-onyx-light"
                style={{
                  width: `${CARD_WIDTH_PCT}%`,
                  maxWidth: MAX_CARD_WIDTH,
                  scrollSnapAlign: "center",
                  /*backgroundColor: "#15181D",*/
                  border: "1px solid #2A2D33",
                  boxShadow: `0 20px 45px ${role.color}22`,
                  transition: `transform ${TRANSITION_MS}ms ease, opacity ${TRANSITION_MS}ms ease, transformStyle: preserve-3d`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${role.color}1A` }}
                >
                  <role.icon size={26} style={{ color: role.color }} />
                </div>
                <h3 className={`${quicksand.className} mt-6 text-2xl font-semibold`} style={{ color: "#F5F7FA" }}>
                  {role.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed" style={{ color: "#9AA0AC" }}>
                  {role.body}
                </p>
                <a
                  href="/auth/sign-up"
                  className="mt-6 inline-block px-3 py-2.5 text-sm font-semibold rounded-sm text-onyx-light"
                  style={{ backgroundColor: role.color, boxShadow: `0 6px 20px ${role.color}55` }}
                >
                  Start practicing
                </a>
              </div>
            ))}
          </div>

          <button
            onClick={prev}
            aria-label="Previous"
            className="flex absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-10"
            style={{ backgroundColor: "#0F1115", border: "1px solid #34383F", color: "#D6D9DE" }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="flex absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-10"
            style={{ backgroundColor: "#0F1115", border: "1px solid #34383F", color: "#D6D9DE" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-2 flex justify-center gap-1.5">
          {ROLES.map((role, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to card ${i + 1}`}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === realIndex ? 16 : 6,
                height: 6,
                backgroundColor: i === realIndex ? role.color : "#34383F",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
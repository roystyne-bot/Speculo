"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLanguage } from "./LanguageProvider";
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

// Keys map into the RolesCarousel namespace in messages/en.json and fr.json.
const ROLE_META = [
  { key: "frontend", icon: Layout, color: "#2FDD79" },
  { key: "backend", icon: Server, color: "#5B7FFF" },
  { key: "fullstack", icon: Layers, color: "#F5A623" },
  { key: "devops", icon: GitBranch, color: "#FF6B6B" },
  { key: "mobile", icon: Smartphone, color: "#A78BFA" },
  { key: "data", icon: Database, color: "#2FDD79" },
  { key: "systems", icon: Cpu, color: "#5B7FFF" },
  { key: "cloud", icon: Cloud, color: "#F5A623" },
];

const MAX_CARD_WIDTH = 480; // px cap so it doesn't balloon on large monitors
const CARD_WIDTH_PCT = 92; // of track width, below the cap
const CARD_GAP = 20;
const AUTOPLAY_MS = 4000;
const TRANSITION_MS = 400;

export default function RolesCarousel() {
  const { t } = useLanguage();
  const ROLES = ROLE_META.map((r) => ({
    ...r,
    title: t(`RolesCarousel.${r.key}Title`),
    body: t(`RolesCarousel.${r.key}Body`),
  }));
  const EXTENDED = [ROLES[ROLES.length - 1], ...ROLES, ROLES[0]];

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

  // Live scale/opacity/rotateY falloff based on distance from track center.
  // The rotateY is what gives this genuine 3D depth (cards tilt away from
  // the viewer as they move off-center) rather than just shrinking flat —
  // needs `perspective` on the track container to actually render as a
  // tilt instead of a flat rotation.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    const update = () => {
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      cardRefs.current.forEach((card) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const signedDistance = cardCenter - trackCenter; // + = card is right of center
        const distance = Math.abs(signedDistance);
        const normalized = Math.min(distance / card.clientWidth, 1);
        const scale = 1 - normalized * 0.15;
        const opacity = 1 - normalized * 0.55;
        // Cards right of center tilt one way, left of center tilt the
        // other — this is what creates the "fanning" coverflow look.
        const rotateY = -Math.sign(signedDistance) * normalized * 35;
        card.style.transform = `rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = `${opacity}`;
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
      id="roles"
      className="px-6 py-20 md:px-10 bg-background"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-wide text-spring">{t("RolesCarousel.eyebrow")}</p>
        <h2 className={`${quicksand.className} mt-2 text-3xl font-semibold text-foreground`}>
          {t("RolesCarousel.headline")}
        </h2>

        <div className="relative mt-10" style={{ perspective: "1200px" }}>
          <div
            ref={trackRef}
            className="flex overflow-x-auto scroll-smooth pb-4"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", gap: CARD_GAP }}
          >
            {EXTENDED.map((role, i) => (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="shrink-0 rounded-3xl p-8 bg-card border border-border"
                style={{
                  width: `${CARD_WIDTH_PCT}%`,
                  maxWidth: MAX_CARD_WIDTH,
                  scrollSnapAlign: "center",
                  boxShadow: `0 20px 45px ${role.color}22`,
                  transition: `transform ${TRANSITION_MS}ms ease, opacity ${TRANSITION_MS}ms ease`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${role.color}1A` }}
                >
                  <role.icon size={26} style={{ color: role.color }} />
                </div>
                <h3 className={`${quicksand.className} mt-6 text-2xl font-semibold text-foreground`}>
                  {role.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {role.body}
                </p>
                <a
                  href="/auth/sign-up"
                  className="mt-6 inline-block px-5 py-2.5 text-sm font-semibold rounded-full"
                  style={{ backgroundColor: role.color, color: "#0B0C0E", boxShadow: `0 6px 20px ${role.color}55` }}
                >
                  {t("RolesCarousel.startPracticing")}
                </a>
              </div>
            ))}
          </div>

          <button
            onClick={prev}
            aria-label="Previous"
            className="flex absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-10 bg-background border border-border text-foreground/80"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="flex absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-10 bg-background border border-border text-foreground/80"
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
                backgroundColor: i === realIndex ? role.color : "var(--border)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
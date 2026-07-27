"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/web/LanguageProvider";
import { Quicksand } from "next/font/google";
import { CursorStar } from "./Cursorstar";
import Navbar from "../components/web/navbar";
import RolesCarousel from "../components/web/RolesCarousel";
import TechStackRow from "./Techstackrow";
import { DottedSurface } from "./Dottedsurface";
import { Mic, MessagesSquare, Target, TrendingUp } from "lucide-react";
import FeatureRow from "../components/web/FeatureRow";
import TakeAction from "../components/web/TakeAction";
import Footer from "./Footer";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"] });

export default function LandingPage() {
  
  return (
    <div style={{ backgroundColor: "#0F1115" }} className="min-h-screen">
      <CursorStar />
      <Navbar />
      <Hero />
      <RolesCarousel />
      <TechStackRows />
      <WhySpeculo />
      <TakeActions />
      <Footer />
      {/* CtaBanner, Footer come back once this section is confirmed */}
    </div>
  );
}

// Small recurring accent mark — same star as the cursor, placed statically
// near the headline so the motif recurs rather than only existing as
// something that follows your mouse.
function StarAccent({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" className={className}>
      <path d="M7 0 L8.4 5.6 L14 7 L8.4 8.4 L7 14 L5.6 8.4 L0 7 L5.6 5.6 Z" fill="#2FDD79" />
    </svg>
  );
}

function Hero() {
  const { t } = useLanguage();
  return (
    <>
    <section
      className="relative px-6 pt-32 pb-24 md:px-10 md:pt-40 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 900px 500px at 30% 0%, rgba(47,221,121,0.16), transparent 60%), radial-gradient(ellipse 700px 500px at 85% 15%, rgba(91,127,255,0.12), transparent 60%), #0F1115",
      }}
    >
      {/* Animated dotted surface — replaces the flat grid overlay */}
      <DottedSurface />

      <div className="relative mx-auto max-w-5xl grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <StarAccent className="absolute -top-6 left-1 opacity-80" />
          <p className="text-xs uppercase tracking-wide" style={{ color: "#2FDD79" }}>
            {t("Hero.eyebrow")}
          </p>
          <h1
            className={`${quicksand.className} mt-3 text-4xl md:text-5xl font-semibold leading-tight`}
            style={{ color: "#F5F7FA" }}
          >
            {t("Hero.headline")}
          </h1>
          <StarAccent className="absolute top-2 right-8 opacity-50" />
          <p className="mt-4 text-base leading-relaxed" style={{ color: "#9AA0AC" }}>
            {t("Hero.description")}
          </p>
          <div className="mt-8 flex gap-3">
            
              <a href="/auth/sign-up"
              className="px-5 py-2.5 text-sm font-semibold rounded-full transition-opacity duration-150 hover:opacity-90"
              style={{ backgroundColor: "#2FDD79", color: "#0A2E17" }}
              >
              {t("Hero.startPracticing")}
            </a>
            
              <a href="/auth/sign-in"
              className="px-5 py-2.5 text-sm rounded-full transition-colors duration-150"
              style={{ border: "1px solid #34383F", color: "#D6D9DE" }}
              >
              {t("Hero.logIn")}
            </a>
          </div>
        </div>

        <HeroDemo />
      </div>
    </section>
    </>
  );
}

function HeroDemo() {

  const { t } = useLanguage();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setStage((s) => (s + 1) % 3), 2600);
    return () => clearInterval(interval);
  }, []);
   
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ border: "1px solid #2A2D33", backgroundColor: "#15181D" }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ backgroundColor: "#0F1115", borderBottom: "1px solid #2A2D33" }}
      >
        <div className="w-2 h-2 rounded-full bg-red-500"  />
        <div className="w-2 h-2 rounded-full bg-yellow-500"  />
        <div className="w-2 h-2 rounded-full bg-green-500"  />
        <p className="ml-2 text-[11px] font-mono" style={{ color: "#6B7078" }}>
          speculo.app/interview/session
        </p>
      </div>

      <div className="h-64 p-6 relative">
        <div className="absolute inset-6 transition-opacity duration-500" style={{ opacity: stage === 0 ? 1 : 0 }}>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: "#2FDD79" }}>
            {t("Hero.demoQuestionTag")}
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "#F5F7FA" }}>
            {t("Hero.demoQuestion")}
          </p>
        </div>

        <div className="absolute inset-6 transition-opacity duration-500" style={{ opacity: stage === 1 ? 1 : 0 }}>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: "#2FDD79" }}>
            {t("Hero.demoQuestionLabel")}
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "#B8BCC4" }}>
             {t("Hero.demoAnswer")}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: "#5B7FFF" }}>
            <Mic size={13} /> {t("Hero.recording")}
          </div>
        </div>

        <div className="absolute inset-6 transition-opacity duration-500" style={{ opacity: stage === 2 ? 1 : 0 }}>
          <div className="flex gap-6">
            <ScoreItem label={t("Hero.relevance")} value={8} />
            <ScoreItem label={t("Hero.clarity")} value={7} />
            <ScoreItem label={t("Hero.depth")} value={7} />
          </div>
          <p className="mt-4 text-xs leading-relaxed" style={{ color: "#9AA0AC" }}>
            {t("Hero.demoFeedback")}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px]" style={{ color: "#6B7078" }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: "#F5F7FA" }}>{value}/10</p>
    </div>
  );
}


function TechStackRows() {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col gap-5 px-6 md:px-10 py-24" style={{ backgroundColor: "#0F1115" }}>
      <div className="bg-spring-pale max-w-max py-0.5 px-3 rounded-full text-xs font-semibold text-green-600">
        {t("RolesCarousel.eyebrow")}
      </div>
      <TechStackRow />
    </section>
  );
}


function WhySpeculo() {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col gap-10 px-6 md:px-10 py-24" style={{ backgroundColor: "#0F1115" }}>
      <div className="bg-spring-pale max-w-max py-0.5 px-3 rounded-full text-xs font-semibold text-green-600">
        {t("Common.ourStrengths")}
      </div>
      <div className="mx-auto max-w-5xl">
        <h2
          className={`${quicksand.className} text-3xl md:text-4xl font-semibold mb-12`}
          style={{ color: "#F5F7FA" }}
        >
          {t("WhySpeculo.heading")}
        </h2>

        <div className="flex flex-col gap-8">
          <FeatureRow
            title={t("WhySpeculo.feature1Title")}
            description={t("WhySpeculo.feature1Description")}
            icon={<MessagesSquare size={80} color="#0A2E17" />}
          />
          <FeatureRow
            title={t("WhySpeculo.feature2Title")}
            description={t("WhySpeculo.feature2Description")}
            icon={<Target size={80} color="#0A2E17" />}
            reverse
          />
          <FeatureRow
            title={t("WhySpeculo.feature3Title")}
            description={t("WhySpeculo.feature3Description")}
            icon={<TrendingUp size={80} color="#0A2E17" />}
          />
        </div>
      </div>
    </section>
  );
}

function TakeActions(){
  const { t } = useLanguage();
  return (
    <section className="flex flex-col px-6 gap-10 md:px-10 py-24" style={{ backgroundColor: "#0F1115" }}>
      <div className="bg-spring-pale max-w-max py-0.5 px-3 rounded-full text-xs font-semibold text-green-600">
        {t("TakeAction.eyebrow")}
      </div>
      <div className="mx-auto max-w-5xl">
        <TakeAction />
      </div>
    </section>
  );
}
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
import SpeculoFAQ from "@/components/web/FAQ";
import Footer from "./Footer";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"] });

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <CursorStar />
      <Navbar />
      <Hero />
      <RolesCarouselSection />
      <TechStackRows />
      <WhySpeculo />
      <TakeActions />
      <SpeculoFAQSection />
      <Footer />
    </div>
  );
}

// Brand mark — spring green stays constant across both themes on purpose.
function StarAccent({ className = "" }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 14 14" className={className}>
      <path d="M7 0 L8.4 5.6 L14 7 L8.4 8.4 L7 14 L5.6 8.4 L0 7 L5.6 5.6 Z" fill="#2FDD79" />
    </svg>
  );
}
function Hero() {
  const { t } = useLanguage();

  return (
    <>
      <section className="relative px-6 pt-32 pb-24 md:px-10 md:pt-40 overflow-hidden bg-background">
       
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 900px 500px at 30% 0%, rgba(47,221,121,0.16), transparent 60%), radial-gradient(ellipse 700px 500px at 85% 15%, rgba(91,127,255,0.12), transparent 60%)",
          }}
        />
        <DottedSurface />

        <div className="relative mx-auto max-w-5xl grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <StarAccent className="absolute -top-6 left-1 opacity-80" />
            <p className="text-xs uppercase tracking-wide text-spring">{t("Hero.eyebrow")}</p>
            <h1
              className={`${quicksand.className} mt-3 text-4xl md:text-5xl font-semibold leading-tight text-foreground`}
            >
              {t("Hero.headline")}
            </h1>
            <StarAccent className="absolute top-2 right-8 opacity-50" />
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t("Hero.description")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row  gap-3">
              <a
                href="/auth/sign-up"
                className="px-5 py-2.5 text-sm text-center font-semibold rounded-sm sm:rounded-full bg-spring text-spring-deep transition-opacity duration-150 hover:opacity-90"
              >
                {t("Hero.startPracticing")}
              </a>
              <a
                href="/auth/login"
                className="px-5 py-2.5 text-sm text-center rounded-sm sm:rounded-full  border border-border text-foreground/80 hover:text-foreground transition-colors duration-150"
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
    <div className="rounded-3xl overflow-hidden border border-border bg-card">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-background border-b border-border">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="w-2 h-2 rounded-full bg-yellow-500" />
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <p className="ml-2 text-[11px] font-mono text-muted-foreground">
          speculo.app/interview/session
        </p>
      </div>

      <div className="h-64 p-6 relative">
        <div className="absolute inset-6 transition-opacity duration-500" style={{ opacity: stage === 0 ? 1 : 0 }}>
          <p className="text-[10px] uppercase tracking-wide text-spring">{t("Hero.demoQuestionTag")}</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{t("Hero.demoQuestion")}</p>
        </div>

        <div className="absolute inset-6 transition-opacity duration-500" style={{ opacity: stage === 1 ? 1 : 0 }}>
          <p className="text-[10px] uppercase tracking-wide text-spring">{t("Hero.demoAnswerLabel")}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("Hero.demoAnswer")}</p>
         
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
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("Hero.demoFeedback")}</p>
        </div>
      </div>
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}/10</p>
    </div>
  );
}

function RolesCarouselSection() {
  return(
    <div id="roles">
    <RolesCarousel />
    </div>
  )
}

function SpeculoFAQSection() {
  return(
    <div id="faq">
    <SpeculoFAQ />
    </div>
  )
}

function TechStackRows() {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col gap-5 px-6 md:px-10 py-24 bg-background">
      <div className="bg-spring-pale max-w-max py-0.5 px-3 rounded-full text-xs font-semibold text-spring-deep">
        {t("Common.ourStrengths")}
      </div>
      <TechStackRow />
    </section>
  );
}

function WhySpeculo() {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col gap-10 px-6 md:px-10 py-24 bg-background">
      <div className="bg-spring-pale max-w-max py-0.5 px-3 rounded-full text-xs font-semibold text-spring-deep">
        {t("Common.ourStrengths")}
      </div>
      <div className="mx-auto max-w-5xl">
        <h2 className={`${quicksand.className} text-3xl md:text-4xl font-semibold mb-12 text-foreground`}>
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

function TakeActions() {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col px-6 gap-10 md:px-10 py-24 bg-background">
      <div className="bg-spring-pale max-w-max py-0.5 px-3 rounded-full text-xs font-semibold text-spring-deep">
        {t("TakeAction.eyebrow")}
      </div>
      <div className="mx-auto max-w-5xl">
        <TakeAction />
      </div>
    </section>
  );
}
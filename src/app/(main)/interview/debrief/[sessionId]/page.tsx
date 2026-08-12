"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function DebriefPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as Id<"sessions">;

  const debrief = useQuery(api.debriefs.getDebrief, { sessionId });
  const generateDebrief = useAction(api.debriefs.generateDebrief);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = debrief === undefined;
  const needsGeneration = !isLoading && debrief === null;

  // Debrief is generated once, on first visit to this page. If it already
  // exists (e.g. the user navigated back here later), we just display it.
  useEffect(() => {
    if (needsGeneration && !isGenerating) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsGenerating(true);
      generateDebrief({ sessionId })
        .catch((err) => setError(err.message ?? "Failed to generate debrief"))
        .finally(() => setIsGenerating(false));
    }
  }, [needsGeneration, isGenerating, generateDebrief, sessionId]);

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-background pt-20 px-6 py-12 md:px-10">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-6 w-40 bg-gray-800 rounded animate-pulse" />
          <div className="h-24 rounded-xl border border-gray-700 bg-onyx-light animate-pulse" />
          <div className="h-32 rounded-xl border border-gray-700 bg-onyx-light animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background px-6 py-12 md:px-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-gray-400">Something went wrong generating your debrief.</p>
          <p className="mt-1 text-xs text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!debrief) return null; // generation in flight, nothing to show yet

  return (
    <div className="min-h-screen pt-20 bg-background px-6 py-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold text-foreground">Debrief</h1>

        <div className="mt-6 rounded-xl border border-gray-700 bg-onyx-light p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Overall score</p>
            <p className="mt-1 text-3xl font-semibold text-white">{Math.round(debrief.overallScore)}%</p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-spring/15 text-spring">
            {debrief.grade}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <MetricCard label="Relevance" value={debrief.relevanceAvg} />
          <MetricCard label="Clarity" value={debrief.clarityAvg} />
          <MetricCard label="Depth" value={debrief.depthAvg} />
        </div>

        <FeedbackSection title="Strengths" items={debrief.strengths} greeny={true} />
        <FeedbackSection title="Areas to improve" items={debrief.improvements} greeny={false} />
        <FeedbackSection title="Study topics" items={debrief.studyTopics} greeny={false} />

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 px-5 py-2 bg-spring text-spring-deep text-sm font-semibold rounded-lg hover:bg-spring-pale transition-colors duration-150"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-onyx-light p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}/10</p>
    </div>
  );
}

function FeedbackSection({ title, items, greeny }: { title: string; items: string[]; greeny: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6">
      <h2 className={`font-serif text-sm font-medium
      ${greeny ? "text-spring" : "text-red-400"}`}>
        {title}
      </h2>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className={`text-sm text-foreground pl-3 border-l-2 border-gray-700`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
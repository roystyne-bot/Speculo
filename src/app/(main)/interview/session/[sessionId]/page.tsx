"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const TOTAL_QUESTIONS = 7;

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as Id<"sessions">;

  const session = useQuery(api.sessions.getSession, { sessionId });
  const messages = useQuery(api.messages.getMessages, { sessionId });
  const generateNextQuestion = useAction(api.messages.generateNextQuestion);
  const submitAnswer = useAction(api.messages.submitAnswer);

  const [answerText, setAnswerText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{
    relevance: number;
    clarity: number;
    depth: number;
    feedback: string;
  } | null>(null);

  const isLoading = session === undefined || messages === undefined;
  const currentMessage = messages?.[messages.length - 1];
  const needsFirstQuestion = !isLoading && messages.length === 0;
  const waitingForAnswer = currentMessage && currentMessage.answer === undefined;

  // Kick off the first question once the session/messages have loaded and
  // there isn't one yet. Guarded by isGenerating so a fast re-render can't
  // fire this twice and generate two question-1 rows.
  useEffect(() => {
    if (needsFirstQuestion && !isGenerating) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsGenerating(true);
      generateNextQuestion({ sessionId }).finally(() => setIsGenerating(false));
    }
  }, [needsFirstQuestion, isGenerating, generateNextQuestion, sessionId]);

  const handleSubmit = async () => {
    if (!currentMessage || answerText.trim().length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const score = await submitAnswer({
        sessionId,
        messageId: currentMessage._id,
        answer: answerText,
      });
      setLastFeedback(score);
      setAnswerText("");
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setLastFeedback(null);
    if (currentMessage!.questionNumber >= TOTAL_QUESTIONS) {
      router.push(`/interview/debrief/${sessionId}`);
      return;
    }
    setIsGenerating(true);
    try {
      await generateNextQuestion({ sessionId });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-12 md:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
          <div className="mt-6 h-40 rounded-xl border border-gray-700 bg-onyx-light animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-gray-500">
          {currentMessage ? `Question ${currentMessage.questionNumber} of ${TOTAL_QUESTIONS}` : "Starting..."}
        </p>

        {(isGenerating && !currentMessage) || !currentMessage ? (
          <QuestionSkeleton />
        ) : (
          <div className="mt-3 rounded-xl border border-gray-700 bg-onyx-light p-6">
            <p className="text-xs text-spring uppercase tracking-wide">{currentMessage.questionTag}</p>
            <p className="mt-2 font-serif text-lg text-white">{currentMessage.question}</p>
          </div>
        )}

        {waitingForAnswer && !lastFeedback && (
          <div className="mt-6">
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={6}
              placeholder="Type your answer..."
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-background text-sm text-onyx placeholder:text-gray-600 focus:outline-none focus:border-spring resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={answerText.trim().length === 0 || isSubmitting}
                className="px-5 py-2 bg-spring text-spring-deep text-sm font-semibold rounded-lg hover:bg-spring-pale transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none"
              >
                {isSubmitting ? "Scoring..." : "Submit answer"}
              </button>
            </div>
          </div>
        )}

        {lastFeedback && (
          <div className="mt-6 rounded-xl border border-gray-700 bg-onyx-light p-6">
            <div className="flex gap-4 text-sm">
              <ScorePill label="Relevance" value={lastFeedback.relevance} />
              <ScorePill label="Clarity" value={lastFeedback.clarity} />
              <ScorePill label="Depth" value={lastFeedback.depth} />
            </div>
            <p className="mt-4 text-sm text-gray-400">{lastFeedback.feedback}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNext}
                disabled={isGenerating}
                className="px-5 py-2 bg-spring text-spring-deep text-sm font-semibold rounded-lg hover:bg-spring-pale transition-colors duration-150 disabled:opacity-60"
              >
                {currentMessage!.questionNumber >= TOTAL_QUESTIONS
                  ? "See debrief"
                  : isGenerating
                  ? "Loading next question..."
                  : "Next question"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-white font-semibold">{value}/10</p>
    </div>
  );
}

function QuestionSkeleton() {
  return (
    <div className="mt-3 rounded-xl border border-gray-700 bg-onyx-light p-6 space-y-3">
      <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
      <div className="h-5 w-full bg-gray-800 rounded animate-pulse" />
      <div className="h-5 w-2/3 bg-gray-800 rounded animate-pulse" />
    </div>
  );
}
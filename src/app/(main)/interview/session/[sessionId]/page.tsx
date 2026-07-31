"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Mic, Square } from "lucide-react";

const TOTAL_QUESTIONS = 7;

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as Id<"sessions">;

  const session = useQuery(api.sessions.getSession, { sessionId });
  const messages = useQuery(api.messages.getMessages, { sessionId });
  const generateNextQuestion = useAction(api.messages.generateNextQuestion);
  const submitAnswer = useAction(api.messages.submitAnswer);
  const transcribe = useAction(api.audio.transcribe);

  const [answerText, setAnswerText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{
    relevance: number;
    clarity: number;
    depth: number;
    feedback: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isLoading = session === undefined || messages === undefined;
  const currentMessage = messages?.[messages.length - 1];
  const needsFirstQuestion = !isLoading && messages.length === 0;
  const waitingForAnswer = currentMessage && currentMessage.answer === undefined;

  useEffect(() => {
    if (needsFirstQuestion && !isGenerating) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsGenerating(true);
      generateNextQuestion({ sessionId }).finally(() => setIsGenerating(false));
    }
  }, [needsFirstQuestion, isGenerating, generateNextQuestion, sessionId]);

  const startRecording = async () => {
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setIsTranscribing(true);
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const result = await transcribe({ sessionId, audio: arrayBuffer, mimeType });
          setAnswerText((prev) => (prev ? `${prev} ${result.text}` : result.text));
        } catch (err) {
          console.error("Transcription failed:", err);
          setRecordingError("Could not transcribe that — try again, or just type your answer.");
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access failed:", err);
      setRecordingError("Microphone access denied or unavailable — you can still type your answer.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

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
      <div className="min-h-screen pt-20 bg-background px-6 py-12 md:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
          <div className="mt-6 h-40 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-background px-6 py-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-muted-foreground">
          {currentMessage ? `Question ${currentMessage.questionNumber} of ${TOTAL_QUESTIONS}` : "Starting..."}
        </p>

        {(isGenerating && !currentMessage) || !currentMessage ? (
          <QuestionSkeleton />
        ) : (
          <div className="mt-3 rounded-xl border border-border bg-card p-6">
            <p className="text-xs text-spring uppercase tracking-wide">{currentMessage.questionTag}</p>
            <p className="mt-2 text-lg text-foreground">{currentMessage.question}</p>
          </div>
        )}

        {waitingForAnswer && !lastFeedback && (
          <div className="mt-6">
            <div className="relative">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={6}
                placeholder="Type your answer, or use the mic..."
                className="w-full px-3 py-2 pr-12 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-spring resize-none"
              />
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                title={isRecording ? "Stop recording" : "Record your answer"}
                className={
                  "absolute top-2 right-2 p-2 rounded-lg transition-colors duration-150 " +
                  (isRecording
                    ? "bg-red-500/15 text-red-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary")
                }
              >
                {isRecording ? <Square size={16} className="text-red-400"/> : <Mic size={16} className="text-spring" />}
              </button>
            </div>

            {isTranscribing && <p className="mt-2 text-xs text-muted-foreground">Transcribing...</p>}
            {recordingError && <p className="mt-2 text-xs text-muted-foreground">{recordingError}</p>}

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
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <div className="flex gap-4 text-sm">
              <ScorePill label="Relevance" value={lastFeedback.relevance} />
              <ScorePill label="Clarity" value={lastFeedback.clarity} />
              <ScorePill label="Depth" value={lastFeedback.depth} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{lastFeedback.feedback}</p>
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
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground font-semibold">{value}/10</p>
    </div>
  );
}

function QuestionSkeleton() {
  return (
    <div className="mt-3 rounded-xl border border-border bg-card p-6 space-y-3">
      <div className="h-3 w-24 bg-secondary rounded animate-pulse" />
      <div className="h-5 w-full bg-secondary rounded animate-pulse" />
      <div className="h-5 w-2/3 bg-secondary rounded animate-pulse" />
    </div>
  );
}
"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
  text: string;
  className?: string;
}

export function SpeakButton({ text, className }: SpeakButtonProps) {
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();

  if (!isSupported) return null; // hide gracefully on unsupported browsers

  return (
    <button
      type="button"
      onClick={() => (isSpeaking ? stop() : speak(text))}
      aria-label={isSpeaking ? "Stop reading question aloud" : "Read question aloud"}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-2 transition-colors",
        "hover:bg-white/5",
        isSpeaking ? "text-[#2FDD79]" : "text-[#9AA3A0]",
        className,
      )}
    >
      {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}
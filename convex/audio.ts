// convex/audio.ts
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { transcribeAudio } from "./lib/groqAudio";

export const transcribe = action({
  args: {
    sessionId: v.id("sessions"),
    audio: v.bytes(),
    mimeType: v.string(),
  },
  handler: async (ctx, args): Promise<{ text: string }> => {
    // Doesn't write anything to the session, but still checked — without
    // this, an unauthenticated caller could hit this action directly and
    // burn through your Groq quota on transcriptions tied to nothing.
    await ctx.runQuery(internal.sessions._getOwnedSessionForAction, {
      sessionId: args.sessionId,
    });

    const text = await transcribeAudio(args.audio, args.mimeType);
    return { text };
  },
});
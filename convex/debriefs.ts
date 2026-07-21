import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { getOwnedSession } from "./sessions";
import { callGroqJSON } from "./lib/groq";
import { buildDebriefPrompt } from "./prompts/debriefPrompt";

// Computed in code, not asked of Groq — see debriefPrompt.ts for why.
function gradeFromScore(score: number): "Excellent" | "Good" | "Fair" | "Needs Work" {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs Work";
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((sum, n) => sum + n, 0) / nums.length) * 10) / 10;
}

// ---- Public query — ownership-checked ----

export const getDebrief = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await getOwnedSession(ctx, args.sessionId); // throws if not the owner

    return await ctx.db
      .query("debriefs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
  },
});

// ---- Internal write — only reachable via the action below ----

export const _insertDebrief = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    overallScore: v.number(),
    relevanceAvg: v.number(),
    clarityAvg: v.number(),
    depthAvg: v.number(),
    strengths: v.array(v.string()),
    improvements: v.array(v.string()),
    studyTopics: v.array(v.string()),
    grade: v.union(
      v.literal("Excellent"),
      v.literal("Good"),
      v.literal("Fair"),
      v.literal("Needs Work"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("debriefs", { ...args, createdAt: Date.now() });
  },
});

// ---- Public action — the client calls this once, after question 7 ----

export const generateDebrief = action({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args): Promise<{ debriefId: string; overallScore: number; grade: string }> => {
    const session = await ctx.runQuery(internal.sessions._getOwnedSessionForAction, {
      sessionId: args.sessionId,
    });

    const messages = await ctx.runQuery(internal.messages._listMessagesInternal, {
      sessionId: args.sessionId,
    });

    const scored = messages.filter((m) => !m.skipped && m.relevance !== undefined);

    const overallScore = average(
      scored.map((m) => ((m.relevance! + m.clarity! + m.depth!) / 30) * 100),
    );
    const relevanceAvg = average(scored.map((m) => m.relevance!));
    const clarityAvg = average(scored.map((m) => m.clarity!));
    const depthAvg = average(scored.map((m) => m.depth!));

    const { system, user } = buildDebriefPrompt({
      role: session.role,
      level: session.level,
      mode: session.mode,
      overallScore,
      qa: messages.map((m) => ({
        question: m.question,
        answer: m.answer,
        skipped: m.skipped,
        relevance: m.relevance,
        clarity: m.clarity,
        depth: m.depth,
      })),
    });

    const result = await callGroqJSON<{
      strengths: string[];
      improvements: string[];
      studyTopics: string[];
    }>(system, user);

    const grade = gradeFromScore(overallScore);

    const debriefId = await ctx.runMutation(internal.debriefs._insertDebrief, {
      sessionId: args.sessionId,
      userId: session.userId,
      overallScore,
      relevanceAvg,
      clarityAvg,
      depthAvg,
      strengths: result.strengths,
      improvements: result.improvements,
      studyTopics: result.studyTopics,
      grade,
    });

    // Reuses the existing, already-ownership-checked mutation rather than
    // duplicating that check here.
    await ctx.runMutation(api.sessions.completeSession, {
      sessionId: args.sessionId,
      totalScore: overallScore,
    });

    return { debriefId, overallScore, grade };
  },
});
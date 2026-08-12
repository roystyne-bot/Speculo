

// Notes on schema mapping used here:
// - sessions.totalScore (optional number) is the per-session score.
// - messages has no userId — ownership is via sessions.userId, so we
//   fetch the user's session ids first, then query messages per session
//   via the by_sessionId index.
// - Per-answer score = average(relevance, clarity, depth), each 0–10,
//   scaled to a 0–100 percentage. Only counted once all three are set
//   (i.e. the answer has actually been scored by Groq).
// - "Topic" = the part of questionTag before " · ", e.g. "Behavioral"
//   from "Behavioral · Teamwork". Falls back to the full tag if there's
//   no separator.

import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

function parseTopic(questionTag: string): string {
  const [topic] = questionTag.split("·");
  return topic?.trim() || questionTag.trim() || "Other";
}

function messageScorePct(m: Doc<"messages">): number | null {
  if (m.relevance == null || m.clarity == null || m.depth == null) return null;
  const avgOutOf10 = (m.relevance + m.clarity + m.depth) / 3;
  return Math.round(avgOutOf10 * 10); // scale 0–10 avg to 0–100
}

// ------------------------------------------------------------------
// 1. Score trend — last N completed sessions, chronological
// ------------------------------------------------------------------
export const getScoreTrend = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();
    if (!user) return [];

    const limit = args.limit ?? 7;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", user._id).eq("status", "completed")
      )
      .order("desc")
      .take(limit);

    return sessions
      .reverse()
      .map((s, i) => ({ label: `S${i + 1}`, value: s.totalScore ?? 0 }));
  },
});

// ------------------------------------------------------------------
// Shared helper: all messages belonging to the current user, across
// all their sessions. Used by topic breakdown + weakest topic.
// ------------------------------------------------------------------
async function getUserMessages(ctx: any, userDocId: Id<"users">) {
  const sessions = await ctx.db
    .query("sessions")
    .withIndex("by_userId", (q: any) => q.eq("userId", userDocId))
    .collect();

  const messageLists = await Promise.all(
    sessions.map((s: Doc<"sessions">) =>
      ctx.db
        .query("messages")
        .withIndex("by_sessionId", (q: any) => q.eq("sessionId", s._id))
        .collect()
    )
  );

  return messageLists.flat() as Doc<"messages">[];
}

// ------------------------------------------------------------------
// 2. Topic breakdown — percentage of questions practiced per topic
// ------------------------------------------------------------------
export const getTopicBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();
    if (!user) return [];

    const messages = await getUserMessages(ctx, user._id);

    const counts: Record<string, number> = {};
    for (const m of messages) {
      const topic = parseTopic(m.questionTag);
      counts[topic] = (counts[topic] ?? 0) + 1;
    }

    const total = messages.length || 1;

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  },
});

// ------------------------------------------------------------------
// 3. Weakest topic — biggest score drop this week vs. previous week
// ------------------------------------------------------------------
export const getWeakestTopic = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();
    if (!user) return null;

    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const thisWeekStart = now - weekMs;
    const lastWeekStart = now - 2 * weekMs;

    const messages = await getUserMessages(ctx, user._id);

    const thisWeek: Record<string, number[]> = {};
    const lastWeek: Record<string, number[]> = {};

    for (const m of messages) {
      const scorePct = messageScorePct(m);
      if (scorePct === null) continue; // not scored yet / skipped

      const timestamp = m.answeredAt ?? m.createdAt;
      if (timestamp < lastWeekStart) continue;

      const topic = parseTopic(m.questionTag);
      const bucket = timestamp >= thisWeekStart ? thisWeek : lastWeek;
      (bucket[topic] ??= []).push(scorePct);
    }

    let weakest: { name: string; dropPct: number } | null = null;
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    for (const topic of Object.keys(thisWeek)) {
      if (!lastWeek[topic]) continue;
      const dropPct = Math.round(avg(lastWeek[topic]) - avg(thisWeek[topic]));
      if (dropPct > 0 && (!weakest || dropPct > weakest.dropPct)) {
        weakest = { name: topic, dropPct };
      }
    }

    return weakest;
  },
});

// ------------------------------------------------------------------
// 4. Weekly area data — average session score per day, last 7 days
// ------------------------------------------------------------------
export const getWeeklyScoreArea = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();
    if (!user) return [];

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", user._id).eq("status", "completed")
      )
      .filter((q) => q.gte(q.field("completedAt"), sevenDaysAgo))
      .collect();

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets: Record<string, number[]> = {};

    for (const s of sessions) {
      const ts = s.completedAt ?? s.createdAt;
      const day = dayLabels[new Date(ts).getDay()];
      (buckets[day] ??= []).push(s.totalScore ?? 0);
    }

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const label = dayLabels[d.getDay()];
      const scores = buckets[label] ?? [];
      const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      result.push({ day: label, score: avg });
    }

    return result;
  },
});
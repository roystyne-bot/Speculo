import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function formatDuration(ms: number | undefined) {
  if (!ms || ms <= 0) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export const createSession = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("fullstack"),
      v.literal("frontend"),
      v.literal("backend"),
      v.literal("devops"),
      v.literal("mobile"),
      v.literal("data"),
      v.literal("systems"),
      v.literal("cloud"),
    ),
    level: v.union(
      v.literal("junior"),
      v.literal("mid"),
      v.literal("senior"),
    ),
    mode: v.union(
      v.literal("behavioral"),
      v.literal("technical"),
      v.literal("mixed"),
    ),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      role: args.role,
      level: args.level,
      mode: args.mode,
      status: "setup",        // always starts as setup
      createdAt: Date.now(),  
      totalScore: undefined,   
      startedAt: undefined,    
      completedAt: undefined,  
    });
    return sessionId;
  },
});

export const getSession = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").order("desc").collect();

    return sessions.slice(0, 10).map((session) => ({
      _id: session._id,
      role: session.role,
      score: session.totalScore ?? 0,
      duration: formatDuration(
        session.startedAt && session.completedAt
          ? session.completedAt - session.startedAt
          : undefined,
      ),
      status: session.status === "completed" ? "completed" : "in_progress",
      createdAt: session.createdAt,
    }));
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").collect();
    const completed = sessions.filter((session) => session.status === "completed");
    const scores = completed
      .map((session) => session.totalScore ?? 0)
      .filter((score) => score > 0);

    const total = completed.length;
    const average = total > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / total) : 0;
    const best = scores.length > 0 ? Math.max(...scores) : 0;

    return {
      total,
      average,
      best,
      streak: completed.length,
    };
  },
});

export const listSessionsByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const updateSessionStatus = mutation({
  args: {
    sessionId: v.id("sessions"),
    status: v.union(
      v.literal("setup"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: args.status,
    });
  },
});

export const completeSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    totalScore: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "completed",
      totalScore: args.totalScore,
      completedAt: Date.now(),
    });
  },
});
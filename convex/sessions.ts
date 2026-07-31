import { v } from "convex/values";
import { mutation, query, internalQuery, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { authComponent } from "./auth";

function formatDuration(ms: number | undefined) {
  if (!ms || ms <= 0) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

// Used by read-only queries. Does NOT create a row — Convex queries can't
// write, so if this returns null for a genuinely signed-in user, it means
// their users row doesn't exist yet (they've never called a mutation that
// self-heals it — see getOrCreateCurrentUser below).
async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
    .unique();
}

// Used by mutations only. If this is the user's first authenticated write
// and no users row exists (no sign-up hook currently creates one — see
// convex/auth.ts), this creates it on the spot from the better-auth
// component's own user record, then proceeds. Self-healing here means we
// don't depend on getting the exact hook wiring right in auth.ts.
async function getOrCreateCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const existing = await ctx.db
    .query("users")
    .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
    .unique();
  if (existing) return existing;

  const authUser = await authComponent.getAuthUser(ctx);
  if (!authUser) return null;

  const userId = await ctx.db.insert("users", {
    authId: identity.subject,
    name: authUser.name ?? "",
    email: authUser.email ?? "",
    image: authUser.image ?? undefined,
    createdAt: Date.now(),
  });

  return await ctx.db.get(userId);
}

// Fetches a session and throws unless it belongs to the current user.
// Used by every function below that reads or writes a specific session,
// so a client can never act on a sessionId it doesn't own just by
// guessing or otherwise obtaining the id. Exported so messages.ts can
// reuse it via the internal query below (actions can't call ctx.db
// directly, so this is the bridge for action-side ownership checks).
export async function getOwnedSession(ctx: QueryCtx | MutationCtx, sessionId: Id<"sessions">) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");

  const session = await ctx.db.get(sessionId);
  if (!session || session.userId !== user._id) {
    throw new Error("Session not found");
  }

  return session;
}

// Internal-only — actions call this via ctx.runQuery to verify ownership
// before doing any Groq calls or writes, since actions have no ctx.db.
export const _getOwnedSessionForAction = internalQuery({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => getOwnedSession(ctx, args.sessionId),
});

export const createSession = mutation({
  args: {
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
    level: v.union(v.literal("junior"), v.literal("mid"), v.literal("senior")),
    mode: v.union(v.literal("behavioral"), v.literal("technical"), v.literal("mixed")),
    focusAreas: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const sessionId = await ctx.db.insert("sessions", {
      userId: user._id,
      role: args.role,
      level: args.level,
      mode: args.mode,
      status: "setup",
      focusAreas: args.focusAreas && args.focusAreas.length > 0 ? args.focusAreas : undefined,
      createdAt: Date.now(),
    });

    return sessionId;
  },
});

export const getSession = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    return await getOwnedSession(ctx, args.sessionId);
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return []; // signed out — no data, not an error

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(10);

    return sessions.map((session) => ({
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


// Consecutive calendar days (UTC) with at least one completed session,
// counting backward from today. If today doesn't have one yet, counting
// starts from yesterday instead — otherwise a genuine ongoing streak would
// incorrectly show 0 just because today's practice hasn't happened yet.
function computeStreak(completedAtTimestamps: number[]): number {
  if (completedAtTimestamps.length === 0) return 0;

  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const dayKeys = new Set(completedAtTimestamps.map((ts) => toKey(new Date(ts))));

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const cursor = new Date(today);
  if (!dayKeys.has(toKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (dayKeys.has(toKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { total: 0, average: 0, best: 0, streak: 0 };

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const scored = sessions.filter((s) => s.totalScore !== undefined);
    const total = sessions.length;
    const average =
      scored.length > 0
        ? Math.round(scored.reduce((sum, s) => sum + (s.totalScore ?? 0), 0) / scored.length)
        : 0;
    const best = scored.length > 0 ? Math.max(...scored.map((s) => s.totalScore ?? 0)) : 0;

    const completedTimestamps = sessions
      .filter((s) => s.status === "completed" && s.completedAt !== undefined)
      .map((s) => s.completedAt!);
    const streak = computeStreak(completedTimestamps);

    return { total, average, best, streak };
  },
});

// Renamed intent: this used to take userId as a client-supplied argument,
// which let any caller pass any user's id and read their full session
// history. It now always returns the caller's own sessions, no argument
// needed — remove any client call sites that were passing a userId in.
export const listMySessions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
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
    await getOwnedSession(ctx, args.sessionId); // throws if not the owner
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
    await getOwnedSession(ctx, args.sessionId); // throws if not the owner
    await ctx.db.patch(args.sessionId, {
      status: "completed",
      totalScore: args.totalScore,
      completedAt: Date.now(),
    });
  },
});
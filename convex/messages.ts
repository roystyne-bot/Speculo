import { v } from "convex/values";
import { action, mutation, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getOwnedSession } from "./sessions";
import { callGroqJSON } from "./lib/groq";
import { buildQuestionPrompt } from "./prompts/Questionprompt";
import { buildScoringPrompt } from "./prompts/Scoringprompt";

const TOTAL_QUESTIONS = 7;

// ---- Internal writes — only reachable from the actions below, never ----
// ---- directly from the client. This is what stops someone from calling
// ---- e.g. _updateMessageScore themselves to fake a perfect score.

export const _addMessage = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    questionNumber: v.number(),
    question: v.string(),
    questionTag: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      questionNumber: args.questionNumber,
      question: args.question,
      questionTag: args.questionTag,
      createdAt: Date.now(),
    });

    if (args.questionNumber === 1) {
      await ctx.db.patch(args.sessionId, { status: "active", startedAt: Date.now() });
    }

    return messageId;
  },
});

export const _saveAnswer = internalMutation({
  args: {
    messageId: v.id("messages"),
    answer: v.string(),
    wordCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      answer: args.answer,
      wordCount: args.wordCount,
      answeredAt: Date.now(),
    });
  },
});

export const _updateMessageScore = internalMutation({
  args: {
    messageId: v.id("messages"),
    relevance: v.number(),
    clarity: v.number(),
    depth: v.number(),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      relevance: args.relevance,
      clarity: args.clarity,
      depth: args.depth,
      feedback: args.feedback,
    });
  },
});

export const _listMessagesInternal = internalQuery({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

// ---- Public queries — ownership-checked before returning anything ----

export const getMessages = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await getOwnedSession(ctx, args.sessionId); // throws if not the owner

    return await ctx.db
      .query("messages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

export const getMessage = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return null;

    await getOwnedSession(ctx, message.sessionId); // throws if not the owner
    return message;
  },
});

// ---- Public mutation — no Groq call needed, so unlike question generation
// ---- and scoring, this can check ownership directly and write in one step.

export const skipQuestion = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Question not found");

    await getOwnedSession(ctx, message.sessionId); // throws if not the owner

    await ctx.db.patch(args.messageId, {
      skipped: true,
      answeredAt: Date.now(),
    });
  },
});

// ---- Public actions — these are what the client actually calls. Each ----
// ---- verifies ownership first, then calls Groq, then writes through an
// ---- internal mutation. The client never has a path to write scores
// ---- or questions directly.

export const generateNextQuestion = action({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args): Promise<{ questionNumber: number; question: string; questionTag: string }> => {
    const session = await ctx.runQuery(internal.sessions._getOwnedSessionForAction, {
      sessionId: args.sessionId,
    });

    const existing = await ctx.runQuery(internal.messages._listMessagesInternal, {
      sessionId: args.sessionId,
    });

    const nextQuestionNumber = existing.length + 1;
    if (nextQuestionNumber > TOTAL_QUESTIONS) {
      throw new Error("All questions have already been generated for this session");
    }

    const history = existing
      .filter((m) => m.answer !== undefined)
      .map((m) => ({ question: m.question, answer: m.answer! }));

    const { system, user } = buildQuestionPrompt({
      role: session.role,
      level: session.level,
      mode: session.mode,
      focusAreas: session.focusAreas,
      questionNumber: nextQuestionNumber,
      totalQuestions: TOTAL_QUESTIONS,
      history,
    });

    const result = await callGroqJSON<{ question: string; tag: string }>(system, user);

    await ctx.runMutation(internal.messages._addMessage, {
      sessionId: args.sessionId,
      questionNumber: nextQuestionNumber,
      question: result.question,
      questionTag: result.tag,
    });

    return { questionNumber: nextQuestionNumber, question: result.question, questionTag: result.tag };
  },
});

export const submitAnswer = action({
  args: {
    sessionId: v.id("sessions"),
    messageId: v.id("messages"),
    answer: v.string(),
  },
  handler: async (ctx, args): Promise<{ relevance: number; clarity: number; depth: number; feedback: string }> => {
    const session = await ctx.runQuery(internal.sessions._getOwnedSessionForAction, {
      sessionId: args.sessionId,
    });

    const existing = await ctx.runQuery(internal.messages._listMessagesInternal, {
      sessionId: args.sessionId,
    });
    const message = existing.find((m) => m._id === args.messageId);
    if (!message) {
      throw new Error("Question not found for this session");
    }

    const wordCount = args.answer.trim().split(/\s+/).filter(Boolean).length;
    await ctx.runMutation(internal.messages._saveAnswer, {
      messageId: args.messageId,
      answer: args.answer,
      wordCount,
    });

    const { system, user } = buildScoringPrompt({
      role: session.role,
      level: session.level,
      question: message.question,
      answer: args.answer,
    });

    const score = await callGroqJSON<{
      relevance: number;
      clarity: number;
      depth: number;
      feedback: string;
    }>(system, user);

    await ctx.runMutation(internal.messages._updateMessageScore, {
      messageId: args.messageId,
      relevance: score.relevance,
      clarity: score.clarity,
      depth: score.depth,
      feedback: score.feedback,
    });

    return score;
  },
});
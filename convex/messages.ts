import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Called when Groq generates a question — inserts the Q, no answer yet
export const addMessage = mutation({
  args: {
    sessionId:      v.id("sessions"),
    questionNumber: v.number(),
    question:       v.string(),
    questionTag:    v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      sessionId:      args.sessionId,
      questionNumber: args.questionNumber,
      question:       args.question,
      questionTag:    args.questionTag,
      createdAt:      Date.now(),
    });
    return messageId;
  },
});

// Called when user submits their answer
export const submitAnswer = mutation({
  args: {
    messageId: v.id("messages"),
    answer:    v.string(),
    wordCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      answer:     args.answer,
      wordCount:  args.wordCount,
      answeredAt: Date.now(),
    });
  },
});

// Called when user skips a question
export const skipMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      skipped: true,
      answeredAt: Date.now(),
    });
  },
});

// Called after Groq scores the answer
export const updateMessageScore = mutation({
  args: {
    messageId: v.id("messages"),
    relevance: v.number(),
    clarity:   v.number(),
    depth:     v.number(),
    feedback:  v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      relevance: args.relevance,
      clarity:   args.clarity,
      depth:     args.depth,
      feedback:  args.feedback,
    });
  },
});

// Get all messages for a session in order
export const getMessages = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

// Get a single message
export const getMessage = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});
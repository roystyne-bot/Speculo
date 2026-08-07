import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("update"),
      v.literal("ranking"),
      v.literal("announcement")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("posts", { ...args, publishedAt: Date.now() });
  },
});
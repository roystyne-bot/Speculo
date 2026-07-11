import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { MutationCtx, QueryCtx } from "./_generated/server"
import { createAuth } from "./auth"

// Helper to get the logged-in user (reused across files)
async function getCurrentUserHelper(ctx: MutationCtx | QueryCtx) {
  const auth = createAuth(ctx)
  const session = await auth.api.getSession({ headers: new Headers() })
  if (!session?.user?.email) throw new Error("Not authenticated")

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", session.user.email))
    .unique()

  if (!user) throw new Error("User not found")
  return user
}

// Creates user on first sign up — call this right after registration
export const createOrGetUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique()

    if (user) return user._id

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      image: args.image,
      status: "Available",
    })
  },
})

// Get the currently logged-in user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await getCurrentUserHelper(ctx)
    } catch {
      return null
    }
  },
})

// Find a user by exact email (used when adding a contact)
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique()
  },
})

// Search users by name (used in search bar)
export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withSearchIndex("search_users", (q) =>
        q.search("name", args.query)
      )
      .take(10)
  },
})

// Get any user by their Convex _id (used in chat header, message bubbles)
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Update profile (name, status, image)
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    status: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await getCurrentUserHelper(ctx)
    await ctx.db.patch(me._id, {
      ...(args.name && { name: args.name }),
      ...(args.status && { status: args.status }),
      ...(args.image && { image: args.image }),
    })
  },
})
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    status: v.optional(v.string()),
  }).index("by_email", ["email"]),

  contacts: defineTable({
    userId: v.id("users"),
    contactId: v.id("users"),
  })
  .index("by_userId", ["userId"])
  .index("by_pair", ["userId", "contactId"]),

  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    body: v.string(),
    seen: v.boolean(),
    sentAt: v.number(),
  })
  .index("by_pair", ["senderId", "receiverId"])
  .index("by_receiver", ["receiverId"]),
})
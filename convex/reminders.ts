import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";

async function getSignedInUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) throw new Error("You must be signed in.");

  const user = await ctx.db
    .query("users")
    .withIndex("by_authId", (q: any) => q.eq("authId", identity.subject))
    .unique();

  if (!user) throw new Error("Speculo user profile not found.");
  return user;
}

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await getSignedInUser(ctx);
    if (!user) return null; //It tells that the is nothing to return, so the user is not signed in or the user is not found in the database

    return await ctx.db
      .query("reminders")
      .withIndex("by_userId", (q:any) => q.eq("userId", user._id))
      .unique();
  },
});

export const saveSubscription = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getSignedInUser(ctx);

    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q:any) => q.eq("endpoint", args.endpoint))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId: user._id,
        p256dh: args.p256dh,
        auth: args.auth,
      });
      return existing._id;
    }

    return await ctx.db.insert("pushSubscriptions", {
      userId: user._id,
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const setReminder = mutation({
  args: {
    enabled: v.boolean(),
    hour: v.number(),
    minute: v.number(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.hour < 0 || args.hour > 23 || args.minute < 0 || args.minute > 59) {
      throw new Error("Invalid reminder time.");
    }

    const user = await getSignedInUser(ctx);

    const existing = await ctx.db
      .query("reminders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const values = { ...args, updatedAt: Date.now() };

    if (existing) {
      await ctx.db.patch(existing._id, values);
      return existing._id;
    }

    return await ctx.db.insert("reminders", {
      userId: user._id,
      ...values,
      createdAt: Date.now(),
    });
  },
});

export const listEnabled = internalQuery({
  args: {},
  handler: async (ctx) =>
    await ctx.db
      .query("reminders")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .collect(),
});

export const getSubscriptions = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect(),
});

export const claimReminder = internalMutation({
  args: {
    reminderId: v.id("reminders"),
    localDate: v.string(),
  },
  handler: async (ctx, args) => {
    const reminder = await ctx.db.get(args.reminderId);

    if (!reminder || reminder.lastSentDate === args.localDate) return false;

    await ctx.db.patch(args.reminderId, {
      lastSentDate: args.localDate,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const processDueReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const reminders = await ctx.runQuery(internal.reminders.listEnabled);

    for (const reminder of reminders) {
      const values = new Intl.DateTimeFormat("en-GB", {
        timeZone: reminder.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(new Date())
        .reduce<Record<string, string>>((result, part) => {
          result[part.type] = part.value;
          return result;
        }, {});

      const localDate = `${values.year}-${values.month}-${values.day}`;
      const isDue =
        Number(values.hour) === reminder.hour &&
        Number(values.minute) === reminder.minute;

      if (!isDue) continue;

      const claimed = await ctx.runMutation(internal.reminders.claimReminder, {
        reminderId: reminder._id,
        localDate,
      });

      if (!claimed) continue;

      const subscriptions = await ctx.runQuery(
        internal.reminders.getSubscriptions,
        { userId: reminder.userId },
      );

      await Promise.all(
        subscriptions.map((subscription: any) =>
          fetch(process.env.PUSH_SEND_URL!, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-push-secret": process.env.PUSH_INTERNAL_SECRET!,
            },
            body: JSON.stringify({
              subscription,
              title: "Time to practice",
              body: "Your next Speculo interview session is waiting.",
              url: "/interview/setup",
            }),
          }),
        ),
      );
    }
  },
});
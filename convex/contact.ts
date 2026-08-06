import { action } from "./_generated/server";
import { v } from "convex/values";
import { sendSupportEmail } from "./lib/email";

export const submitContactForm = action({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await sendSupportEmail(args);
    return { success: true };
  },
});
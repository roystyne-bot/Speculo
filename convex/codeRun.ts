import { v } from "convex/values";
import { action } from "./_generated/server";
import { runCode } from "./lib/piston";

export const executeCode = action({
  args: {
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    return await runCode(args.language, args.code);
  },
});
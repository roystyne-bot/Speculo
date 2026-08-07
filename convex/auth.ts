import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";
import { internal } from "./_generated/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Speculo Support <onboarding@resend.dev>",
            to: user.email,
            subject: "Reset your Speculo password",
            text: `Click the link to reset your password: ${url}`,
          }),
        });

        if (!res.ok) {
          console.error("sendResetPassword failed:", await res.text());
        }
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [convex({ authConfig })],
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            if (!("runMutation" in ctx)) {
              // Hook fired outside an action context — shouldn't happen for
              // Better Auth's HTTP-driven user creation, but guard anyway
              // rather than crashing sign-up if it ever does.
              console.error(
                "ensureUserFromAuth: ctx has no runMutation, skipping",
              );
              return;
            }

            await ctx.runMutation(internal.users.ensureUserFromAuth, {
              authId: user.id,
              name: user.name ?? "",
              email: user.email ?? "",
              image: user.image ?? undefined,
            });
          },
        },
      },
    },
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});

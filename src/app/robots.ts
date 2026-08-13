import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "ClaudeBot",
          "Claude-User",
          "Google-Extended",
          "PerplexityBot",
        ],
        allow: "/",
        disallow: ["/dashboard", "/api"],
      },
    ],
    sitemap: "https://speculo-two.vercel.app/sitemap.xml",
  };
}
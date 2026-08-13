import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const categoryLabel: Record<string, string> = {
  update: "Update",
  ranking: "Rankings",
  announcement: "Announcement",
};

export const metadata: Metadata = {
  title: "Blog — Speculo",
  description:
    "Product updates, rankings, and what's coming next for Speculo's AI mock interview platform.",
  alternates: { canonical: "https://speculo-two.vercel.app/blog" },
  openGraph: {
    title: "Speculo Blog",
    description: "Product updates, rankings, and what's coming next.",
    url: "https://speculo-two.vercel.app/blog",
    siteName: "Speculo",
    images: ["/og-image.png"],
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await convex.query(api.blog.listPosts);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Speculo Blog",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `https://speculo-two.vercel.app/blog/${post.slug}`,
      datePublished: new Date(post.publishedAt).toISOString(),
    })),
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#2FDD79] text-sm font-space-grotesk mb-10 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="font-quicksand text-4xl mb-2">Announcements</h1>
        <p className="text-white/60 font-space-grotesk mb-12">
          Product updates, rankings, and what's coming next.
        </p>

        {posts.length === 0 && (
          <p className="text-white/40 text-sm">No posts yet.</p>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="block bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <span className="text-xs text-[#2FDD79] font-space-grotesk">
                {categoryLabel[post.category]}
              </span>
              <h2 className="font-quicksand text-xl mt-1 mb-2">{post.title}</h2>
              <p className="text-white/60 text-sm font-space-grotesk">
                {post.excerpt}
              </p>
              <p className="text-white/30 text-xs mt-3 font-jetbrains-mono">
                {new Date(post.publishedAt).toLocaleDateString()}
              </p>

              <Button
                asChild
                variant="link"
                className="mt-4 text-[#2FDD79] hover:text-[#2FDD79]/80 font-space-grotesk"
              >
                <span>Read More</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
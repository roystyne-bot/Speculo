"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";

const categoryLabel: Record<string, string> = {
  update: "Update",
  ranking: "Rankings",
  announcement: "Announcement",
};

export default function BlogPage() {
  const posts = useQuery(api.blog.listPosts);

  return (
    <div className="min-h-screen bg-[#0F1115] text-white px-6 py-16">
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

        {posts === undefined && (
          <p className="text-white/40 text-sm">Loading...</p>
        )}
        {posts?.length === 0 && (
          <p className="text-white/40 text-sm">No posts yet.</p>
        )}

        <div className="space-y-6">
          {posts?.map((post) => (
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
                <a href={`/blog/${post.slug}`}>Read More</a>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
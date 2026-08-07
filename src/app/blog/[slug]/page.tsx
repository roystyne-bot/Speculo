"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ReactMarkdown from "react-markdown";

const categoryLabel: Record<string, string> = {
  update: "Update",
  ranking: "Rankings",
  announcement: "Announcement",
};

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const post = useQuery(api.blog.getPostBySlug, { slug: params.slug });

  return (
    <div className="min-h-screen bg-[#0F1115] text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#2FDD79] text-sm font-space-grotesk mb-10 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Announcements
        </Link>

        {post === undefined && (
          <p className="text-white/40 text-sm">Loading...</p>
        )}

        {post === null && (
          <p className="text-white/40 text-sm">Post not found.</p>
        )}

        {post && (
          <article>
            <span className="text-xs text-[#2FDD79] font-space-grotesk">
              {categoryLabel[post.category]}
            </span>
            <h1 className="font-quicksand text-3xl mt-2 mb-3">{post.title}</h1>
            <p className="text-white/30 text-xs font-jetbrains-mono mb-10">
              {new Date(post.publishedAt).toLocaleDateString()}
            </p>

            <div className="prose prose-invert max-w-none font-space-grotesk prose-headings:font-quicksand prose-a:text-[#2FDD79]">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
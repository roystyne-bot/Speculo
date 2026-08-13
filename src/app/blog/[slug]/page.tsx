import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const categoryLabel: Record<string, string> = {
  update: "Update",
  ranking: "Rankings",
  announcement: "Announcement",
};

// cache() dedupes this so generateMetadata and the page component
// share one fetch per request instead of hitting Convex twice
const getPost = cache(async (slug: string) => {
  return await convex.query(api.blog.getPostBySlug, { slug });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found — Speculo" };

  const description = post.excerpt;

  return {
    title: `${post.title} — Speculo Blog`,
    description,
    alternates: { canonical: `https://speculo-two.vercel.app/blog/${slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `https://speculo-two.vercel.app/blog/${slug}`,
      siteName: "Speculo",
      type: "article",
      publishedTime: new Date(post.publishedAt).toISOString(),
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: new Date(post.publishedAt).toISOString(),
    author: { "@type": "Organization", name: "Speculo" },
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-2xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#2FDD79] text-sm font-space-grotesk mb-10 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Announcements
        </Link>

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
      </div>
    </div>
  );
}
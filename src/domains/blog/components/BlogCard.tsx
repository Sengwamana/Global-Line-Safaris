import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/content/types";
import { formatDate } from "@/lib/utils";

function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function BlogCard({ post }: { post: BlogPost }) {
  const author = post.author ?? "Global Line Safaris";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="journal-card"
      aria-label={post.title}
    >
      <div className="journal-card-media">
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
            loading="lazy"
            decoding="async"
          />
        )}
        {post.category && (
          <span className="journal-badge">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
            {post.category}
          </span>
        )}
      </div>
      <div className="journal-card-body">
        <span className="journal-eyebrow">
          {post.createdAt ? formatDate(post.createdAt) : "Journal"}
        </span>
        <h3 className="journal-title">{post.title}</h3>
        {post.excerpt && <p className="journal-excerpt">{post.excerpt}</p>}
        <div className="journal-meta">
          <span className="journal-meta-author">
            <span
              aria-hidden="true"
              className="journal-avatar"
            >
              {authorInitials(author)}
            </span>
            <span>{author}</span>
          </span>
          <span className="journal-read">
            {post.readTime ? (
              <>
                <Clock width={13} height={13} />
                {post.readTime} min
              </>
            ) : (
              "Read"
            )}
            <ArrowUpRight width={14} height={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
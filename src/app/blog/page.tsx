import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/shared/PageHero";
import { CTASection } from "@/domains/home/components/CTASection";
import { BlogCard } from "@/domains/blog/components/BlogCard";
import { Pagination } from "@/components/shared/Pagination";
import { buildPageMetadata, getBlogPosts } from "@/lib/content/service.server";
import { buildQueryString, clampPage, cn, formatDate, paginate } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, Search } from "lucide-react";
import type { BlogPost } from "@/lib/content/types";

export const dynamic = "force-dynamic";

interface BlogListPageProps {
  searchParams?: Promise<{ category?: string; q?: string; page?: string }>;
}

const BLOG_PAGE_SIZE = 6;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('blog', {
    title: 'Travel Blog & Safari Stories',
    description: 'Practical travel guides, gorilla trekking tips, safari stories and destination inspiration from the Global Line Safaris team.',
    path: '/blog',
  });
}

function FeaturedArticle({ post }: { post: BlogPost }) {
  const author = post.author ?? "Global Line Safaris";
  return (
    <Link href={`/blog/${post.slug}`} className="journal-feature" aria-label={post.title}>
      <div className="journal-feature-media">
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 1000px) 100vw, 60vw"
          />
        )}
      </div>
      <div className="journal-feature-body">
        <span className="journal-feature-tag">Featured story</span>
        <span className="journal-eyebrow">
          {post.category ? post.category : "Journal"}
        </span>
        <h2 className="journal-feature-title">{post.title}</h2>
        {post.excerpt && <p className="journal-feature-excerpt">{post.excerpt}</p>}
        <div className="journal-feature-meta">
          <span className="inline-flex items-center gap-2">
            <CalendarDays width={13} height={13} />
            {post.createdAt ? formatDate(post.createdAt) : "Journal"}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock width={13} height={13} />
            {post.readTime ? `${post.readTime} min read` : "Read"}
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-brand">
            {author}
            <ArrowUpRight width={14} height={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
  const params = await searchParams;
  const raw = (params?.category ?? "").trim();
  const searchTerm = (params?.q ?? "").trim();
  const query = searchTerm.toLowerCase();
  const posts = await getBlogPosts();

  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean) as string[])).sort();
  const activeCategory = categories.includes(raw) ? raw : "";
  let visible = activeCategory ? posts.filter((p) => p.category === activeCategory) : posts;

  if (query) {
    visible = visible.filter((p) =>
      [p.title, p.excerpt, p.category, p.author]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(query))
    );
  }
  const showingAll = !activeCategory && !query;
  const featured = showingAll && visible.length > 0 ? visible[0] : null;
  const gridSource = featured ? visible.slice(1) : visible;

  const gridTotalPages = Math.max(1, Math.ceil(gridSource.length / BLOG_PAGE_SIZE));
  const page = clampPage(params?.page, gridTotalPages);
  const { items: gridPosts, totalPages } = paginate(gridSource, page, BLOG_PAGE_SIZE);

  const baseHref = (overrides: Record<string, string | undefined>) =>
    buildQueryString({
      category: activeCategory || undefined,
      q: searchTerm || undefined,
      ...overrides,
    });

  return (
    <div className="overflow-x-hidden">
      <PageHero
        eyebrow="Travel Journal"
        title="Safari Stories & Travel Guides"
        description="Guides, tips and inspiration from the Global Line Safaris team — gorilla trekking, wildlife safaris, cultural journeys and Rwanda travel essentials."
        image="/images/rwanda-hills.jpg"
        breadcrumb={[{ label: "Blog", href: "/blog" }]}
      />

      <section className="safari-section">
        <div className="safari-container">
          <div className="editorial-heading">
            <div>
              <div className="safari-eyebrow">
                <span className="safari-eyebrow-line" />
                <span>Latest from the journal</span>
              </div>
              <h2>Stories to plan your journey</h2>
            </div>
            <p>
              Read what to expect on the trails, when to travel, how to pack and how to plan an
              itinerary that fits the way you like to travel.
            </p>
          </div>

          {featured && page === 1 && <FeaturedArticle post={featured} />}

          <div className="journal-toolbar">
            <form action="/blog" method="get" className="journal-search">
              {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
              <input
                type="search"
                name="q"
                defaultValue={searchTerm}
                placeholder="Search stories..."
                aria-label="Search blog posts"
              />
              <button type="submit" aria-label="Submit search">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {categories.length > 0 && (
              <div className="journal-chips">
                <Link
                  href={searchTerm ? `/blog?q=${encodeURIComponent(searchTerm)}` : "/blog"}
                  className={cn("journal-chip", !activeCategory && "active")}
                >
                  All
                  <span className="journal-chip-count">{posts.length}</span>
                </Link>
                {categories.map((category) => {
                  const count = posts.filter((p) => p.category === category).length;
                  const active = activeCategory === category;
                  const qs = searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : "";
                  return (
                    <Link
                      key={category}
                      href={`/blog?category=${encodeURIComponent(category)}${qs}`}
                      className={cn("journal-chip", active && "active")}
                    >
                      {category}
                      <span className="journal-chip-count">{count}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {!showingAll && (
            <div className="journal-result-note">
              <span>
                {visible.length} {visible.length === 1 ? "story" : "stories"}
                {searchTerm ? ` matching "${searchTerm}"` : ""}
              </span>
              <Link href="/blog" className="journal-chip active">
                Clear filters
              </Link>
            </div>
          )}

          {gridPosts.length > 0 ? (
            <div className="journal-grid">
              {gridPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              {query
                ? `No stories match "${searchTerm}". Try a different search term or browse all posts.`
                : "Stories in this category are being prepared. Check back soon for travel guides and safari inspiration."}
            </p>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            makeHref={(p) => baseHref({ page: p > 1 ? String(p) : undefined })}
            pageLabel="Journal pages"
          />
        </div>
      </section>

      <CTASection />
    </div>
  );
}
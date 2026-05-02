import meta from './blog-meta.json';
import content from './blog-content.json';

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  image: string | null;
  excerpt: string;
};

const blogContent = content as Record<string, string>;

export const allPosts: BlogPost[] = meta as BlogPost[];

export function getPost(slug: string): { meta: BlogPost; html: string } | undefined {
  const m = allPosts.find((p) => p.slug === slug);
  if (!m) return undefined;
  const html = blogContent[slug] ?? '';
  return { meta: m, html };
}

export function getYears(): string[] {
  const years = new Set(allPosts.map((p) => p.date.slice(0, 4)));
  return Array.from(years).sort().reverse();
}

export function postsByYear(year: string): BlogPost[] {
  return allPosts.filter((p) => p.date.startsWith(year));
}

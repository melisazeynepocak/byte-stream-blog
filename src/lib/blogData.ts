import heroImg from "@/assets/hero-tech-1.jpg";
import phoneImg from "@/assets/post-phone.jpg";
import laptopImg from "@/assets/post-laptop.jpg";
import softwareImg from "@/assets/post-software.jpg";

export type CategorySlug = "telefonlar" | "bilgisayarlar" | "yazilim-uygulamalar" | "teknoloji-haberleri";

export interface Post {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  category: { slug: CategorySlug; name: string };
  tags: string[];
  cover: string;
  content: string;
  createdAt: string; // ISO
  views: number;
  featured?: boolean;
}

export interface CommentItem {
  id: string;
  postId: string;
  name: string;
  message: string;
  createdAt: string;
}

export const CATEGORIES: { slug: CategorySlug; name: string }[] = [
  { slug: "telefonlar", name: "Telefonlar" },
  { slug: "bilgisayarlar", name: "Bilgisayarlar" },
  { slug: "yazilim-uygulamalar", name: "Yazılım & Uygulamalar" },
  { slug: "teknoloji-haberleri", name: "Teknoloji Haberleri" },
];

const STORAGE_KEYS = {
  posts: "tb.posts.v1",
  comments: "tb.comments.v1",
} as const;

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

function seedPosts(): Post[] {
  const now = new Date();
  const base: Post[] = [
    {
      id: crypto.randomUUID(),
      title: "En İyi Amiral Gemisi Telefonlar (2025)",
      subtitle: "Fiyat/performans, kamera ve batarya karşılaştırması",
      slug: slugify("En İyi Amiral Gemisi Telefonlar 2025"),
      category: CATEGORIES[0],
      tags: ["telefon", "inceleme", "kamera"],
      cover: phoneImg,
      content:
        "2025'in öne çıkan amiral gemisi telefonlarını hız, kamera ve pil performansı açısından karşılaştırdık. Bu yazıda güçlü işlemciler, ekran kalitesi ve yazılım deneyimine odaklanıyoruz.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      views: 324,
      featured: true,
    },
    {
      id: crypto.randomUUID(),
      title: "Geliştiriciler İçin En İyi Laptop Seçimi",
      subtitle: "M1/M2, Ryzen ve Intel seçenekleri karşılaştırması",
      slug: slugify("Geliştiriciler İçin En İyi Laptop Seçimi"),
      category: CATEGORIES[1],
      tags: ["laptop", "geliştirici", "donanım"],
      cover: laptopImg,
      content:
        "Güncel işlemci ve RAM seçenekleriyle geliştirme ortamları için en uygun dizüstü bilgisayarları inceledik. Uzun pil ömrü ve taşınabilirlik de cabası.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      views: 512,
      featured: true,
    },
    {
      id: crypto.randomUUID(),
      title: "2025'te Vazgeçilmez 10 Üretkenlik Uygulaması",
      subtitle: "Not alma, proje yönetimi ve otomasyon araçları",
      slug: slugify("2025'te Vazgeçilmez 10 Üretkenlik Uygulaması"),
      category: CATEGORIES[2],
      tags: ["uygulama", "verimlilik", "rehber"],
      cover: softwareImg,
      content:
        "Günlük işlerinizi hızlandıracak en iyi üretkenlik uygulamalarını avantajlarıyla birlikte derledik. Ekip çalışmaları için öneriler de var.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
      views: 189,
      featured: false,
    },
    {
      id: crypto.randomUUID(),
      title: "Haftanın Teknoloji Haberleri: Yapay Zeka ve Daha Fazlası",
      subtitle: "Kısa kısa: sektörde neler oldu?",
      slug: slugify("Haftanın Teknoloji Haberleri Yapay Zeka ve Daha Fazlası"),
      category: CATEGORIES[3],
      tags: ["haber", "yapay zeka", "trend"],
      cover: heroImg,
      content:
        "Bu hafta teknoloji dünyasında dikkat çeken gelişmeleri bir araya getirdik. Yeni çip mimarileri, yapay zeka regülasyonları ve daha fazlası.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
      views: 742,
      featured: true,
    },
  ];
  return base;
}

let POSTS = load<Post[]>(STORAGE_KEYS.posts, seedPosts());
let COMMENTS = load<CommentItem[]>(STORAGE_KEYS.comments, []);

export function getPosts() {
  return [...POSTS].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getFeaturedPosts() {
  return getPosts().filter((p) => p.featured);
}

export function getMostRead(limit = 5) {
  return [...POSTS].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function getByCategory(categorySlug: CategorySlug) {
  return getPosts().filter((p) => p.category.slug === categorySlug);
}

export function searchPosts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return getPosts();
  return getPosts().filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.tags.join(" ").toLowerCase().includes(q)
  );
}

export function getPostBySlugs(categorySlug: string, postSlug: string) {
  return POSTS.find((p) => p.category.slug === categorySlug && p.slug === postSlug) || null;
}

export function addPost(input: Omit<Post, "id" | "createdAt" | "views" | "slug" | "category"> & { categorySlug: CategorySlug }) {
  const category = CATEGORIES.find((c) => c.slug === input.categorySlug)!;
  const newPost: Post = {
    id: crypto.randomUUID(),
    title: input.title,
    subtitle: input.subtitle,
    slug: slugify(input.title),
    category,
    tags: input.tags,
    cover: input.cover,
    content: input.content,
    createdAt: new Date().toISOString(),
    views: 0,
    featured: input.featured,
  };
  POSTS = [newPost, ...POSTS];
  save(STORAGE_KEYS.posts, POSTS);
  return newPost;
}

export function incrementViews(postId: string) {
  POSTS = POSTS.map((p) => (p.id === postId ? { ...p, views: p.views + 1 } : p));
  save(STORAGE_KEYS.posts, POSTS);
}

export function getAllTags(): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  POSTS.forEach((p) => p.tags.forEach((t) => map.set(t, (map.get(t) || 0) + 1)));
  return [...map.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

export function getComments(postId: string) {
  return COMMENTS.filter((c) => c.postId === postId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function addComment(postId: string, name: string, message: string) {
  const item: CommentItem = {
    id: crypto.randomUUID(),
    postId,
    name,
    message,
    createdAt: new Date().toISOString(),
  };
  COMMENTS = [item, ...COMMENTS];
  save(STORAGE_KEYS.comments, COMMENTS);
  return item;
}

export function categoryName(slug: CategorySlug) {
  return CATEGORIES.find((c) => c.slug === slug)?.name || slug;
}

export function getSiteUrl() {
  return window.location.origin;
}

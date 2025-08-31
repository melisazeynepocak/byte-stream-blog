import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import AdSlot from "@/components/AdSlot";
import { addComment, getComments } from "@/lib/blogData";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateOgImageDataUrl } from "@/lib/og";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { PostMeta } from "@/components/blog/PostMeta";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { SimilarPosts } from "@/components/blog/SimilarPosts";
// types.ts içeriğine göre import (gerekirse yolu "@/types" yap)
import type { Post as DbPost, Category } from "@/types";
import { formatRelativeDateTR } from "@/lib/utils";

/** Ekranda kullanacağımız normalize tip (DB tiplerinden türetilmiş) */
type ViewPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover: string | null;
  createdAt: string;
  tags: string[]; // yoksa boş dizi
  category: { name: string; slug: string };
  views: number;
};

const slugifyTr = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Yardımcı: İçeriği biçimlendir
function renderFormattedContent(content: string) {
  if (!content) return null;
  // Satırları ayır
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== "");
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // 1., 2., 3. gibi başlık satırı mı?
    const match = line.match(/^(\d+)\.(.*)$/);
    if (match) {
      // Başlık
      elements.push(
        <div key={i} style={{lineHeight:1.6, marginBottom:12}}>
          <strong style={{fontWeight:700}}>{match[0]}</strong>
        </div>
      );
      // Sonraki satır açıklama ise ekle
      if (lines[i+1] && !lines[i+1].match(/^(\d+)\./)) {
        elements.push(
          <p key={i+"-desc"} style={{lineHeight:1.6, marginBottom:12}}>{lines[i+1]}</p>
        );
        i++;
      }
    } else {
      // Normal paragraf veya açıklama
      elements.push(
        <p key={i} style={{lineHeight:1.6, marginBottom:12}}>{line}</p>
      );
    }
    i++;
  }
  return elements;
}

const PostPage = () => {
  const { categorySlug, postSlug } = useParams();
  const [post, setPost] = useState<ViewPost | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      if (!postSlug) return;

      // Yazıyı slug ile getir + kategori join
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id, title, slug, content, cover_image, created_at, views, tags,
          categories:categories!posts_category_id_fkey ( id, name, slug )
        `
        )
        .eq("slug", postSlug)
        .single();

      if (error || !data || ignore) {
        setPost(null);
        return;
      }

      const d = data as DbPost & {
        categories?: Pick<Category, "id" | "name" | "slug"> | null;
        views?: number;
        tags?: string[] | null;
        cover_image?: string | null;
        slug: string;
      };

      const categoryName = d.categories?.name ?? "";
      const catSlug =
        d.categories?.slug ??
        (categoryName ? slugifyTr(categoryName) : (categorySlug as string));

      const normalized: ViewPost = {
        id: d.id,
        title: d.title,
        slug: d.slug,
        content: d.content ?? "",
        cover: d.cover_image ?? null,
        createdAt: (d as any).published_at ?? d.created_at,
        tags: Array.isArray(d.tags) ? d.tags : [],
        category: { name: categoryName || catSlug, slug: catSlug },
        views: d.views ?? 0,
      };

      setPost(normalized);
      setComments(getComments(String(d.id)));

      // Görüntülenme sayısı +1 (hata olursa sessiz geç)
      try {
        await supabase.from("posts").update({ views: normalized.views + 1 }).eq("id", d.id);
      } catch {}

      // Benzer yazılar: aynı kategori slug'ına sahip ilk 6 kayıt (kendisi hariç)
      const { data: rel } = await supabase
        .from("posts")
        .select(
          `
          id, title, slug, cover_image,
          categories:categories!posts_category_id_fkey ( slug, name )
        `
        )
        .neq("id", d.id)
        .limit(6);

      const relNorm =
        (rel ?? []).map((r: any) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          cover: r.cover_image ?? null,
          category: {
            slug: r.categories?.slug ?? (r.categories?.name ? slugifyTr(r.categories.name) : ""),
            name: r.categories?.name ?? "",
          },
        })) ?? [];

      setRelated(
        relNorm.filter(
          (p: any) =>
            !normalized.category.slug ||
            !p.category?.slug ||
            p.category.slug === normalized.category.slug
        )
      );
    })();

    return () => {
      ignore = true;
    };
  }, [categorySlug, postSlug]);

  if (!post) {
    return (
      <main className="container py-16">
        <h1 className="text-2xl font-bold">Yazı bulunamadı</h1>
        <p className="mt-2 text-muted-foreground">
          İçerik kaldırılmış veya bağlantı hatalı olabilir.
        </p>
        <Link to="/" className="inline-block mt-4 text-primary hover:underline">
          Anasayfaya dön
        </Link>
      </main>
    );
  }

  const url = `${window.location.origin}/${post.category.slug}/${post.slug}`;
  const ogImage = post.cover || generateOgImageDataUrl(post.title, "TeknoBlog");
  const readingTime = Math.ceil((post.content?.split(" ").length ?? 0) / 200);

  return (
    <>
      <ReadingProgress />
      <Seo
        title={`${post.title} – TeknoBlog`}
        description={post.content.slice(0, 160)}
        type="article"
        image={ogImage}
        publishedTime={post.createdAt}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Anasayfa", item: window.location.origin },
              {
                "@type": "ListItem",
                position: 2,
                name: post.category.name,
                item: `${window.location.origin}/kategori/${post.category.slug}`,
              },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: post.title,
            description: post.content.slice(0, 160),
            datePublished: post.createdAt,
            image: ogImage,
            author: { "@type": "Organization", name: "TeknoBlog" },
            mainEntityOfPage: url,
          },
        ]}
      />

      <main className="container py-6 md:py-10 relative">
        <AdSlot slot="top" className="mb-6" visible={false} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <article className="lg:col-span-8 max-w-3xl">
            <nav aria-label="breadcrumb" className="mb-3 text-xs text-muted-foreground">
              <Link to="/" className="hover:underline">Anasayfa</Link> /{" "}
              <Link to={`/kategori/${post.category.slug}`} className="hover:underline">
                {post.category.name}
              </Link>{" "}
              / <span>{post.title}</span>
            </nav>

            <header className="mb-6">
              <Link to={`/kategori/${post.category.slug}`} className="text-sm text-primary">
                {post.category.name}
              </Link>
              <span className="block text-xs text-muted-foreground mt-1 mb-1">
                {formatRelativeDateTR(post.createdAt)}
              </span>
              <span className="block text-xs text-muted-foreground mb-1">
                {(post.views ?? 0).toLocaleString()} görüntülenme
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-2">{post.title}</h1>
              {/* alt başlık zorunlu değil; istersen content'ten kısa bir özet kullan */}
              <p className="mt-2 text-lg text-muted-foreground">{post.content.slice(0, 140)}...</p>

              <PostMeta author="TeknoBlog Editörü" publishedAt={post.createdAt} readingTime={readingTime} />

              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Badge key={t} variant="secondary">#{t}</Badge>
                ))}
              </div>
            </header>

            <img
              src={ogImage}
              alt="Kapak görseli"
              className="w-full rounded-lg mb-6"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />

            <section className="prose prose-neutral max-w-none dark:prose-invert">
              {renderFormattedContent(post.content)}

              <AdSlot slot="inArticle" className="my-8" visible={false} />



              <AdSlot slot="inArticle" className="my-8" visible={false} />


            </section>

            <SimilarPosts posts={related as any} currentPostId={String(post.id)} />

            <section id="comments" className="mt-12 border-t pt-8">
              <h3 className="font-semibold text-lg mb-3">Yorumlar</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!name.trim() || !message.trim()) return;
                  addComment(String(post.id), name.trim(), message.trim());
                  setComments(getComments(String(post.id)));
                  setName("");
                  setMessage("");
                }}
                className="space-y-3"
              >
                <Input placeholder="Adınız" value={name} onChange={(e) => setName(e.target.value)} />
                <Textarea placeholder="Yorumunuz" value={message} onChange={(e) => setMessage(e.target.value)} />
                <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground">
                  Gönder
                </button>
              </form>

              <ul className="mt-6 space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="border rounded p-3">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString("tr-TR")}
                    </div>
                    <p className="mt-2 text-sm">{c.message}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <h3 className="font-semibold mb-2">Kaynakça</h3>
              <p className="text-sm text-muted-foreground">—</p>
            </section>
          </article>

          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              <ShareButtons url={url} title={post.title} className="hidden lg:block mb-6" />
            </div>
          </aside>
        </div>

        <div className="lg:hidden fixed bottom-4 left-4 z-40">
          <ShareButtons url={url} title={post.title} />
        </div>
      </main>
    </>
  );
};

export default PostPage;

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
import { Sidebar } from "@/components/blog/Sidebar";
// types.ts içeriğine göre import (gerekirse yolu "@/types" yap)
import type { Post as DbPost, Category } from "@/types";
import { formatRelativeDateTR } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cleanSlugFromUrl, compareSlugs } from '@/lib/slug';
import { UrlRedirect } from '@/components/UrlRedirect';

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
  images: PostImage[];
  excerpt?: string | null;
};

type PostImage = {
  id: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  position: number;
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

// Yardımcı: İçeriği markdown olarak render et
function renderFormattedContent(content: string, images: PostImage[] = []) {
  if (!content) return null;
  
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Resimler için özel component
          img: ({ src, alt, ...props }) => {
            // Eğer resim images array'inde varsa, onu kullan
            const imageData = images.find(img => img.image_url === src);
            if (imageData) {
              return (
                <figure className="my-6">
                  <img 
                    src={src} 
                    alt={imageData.alt_text || alt || ""} 
                    className="rounded-lg shadow-lg w-full"
                    {...props} 
                  />
                  {imageData.caption && (
                    <figcaption className="text-center text-sm text-muted-foreground mt-2">
                      {imageData.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }
            return <img src={src} alt={alt || ""} className="rounded-lg shadow-lg w-full" {...props} />;
          },
          // Başlıklar için özel styling
          h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2 text-foreground">{children}</h3>,
          h4: ({ children }) => <h4 className="text-lg font-bold mt-3 mb-2 text-foreground">{children}</h4>,
          // Paragraflar için
          p: ({ children }) => <p className="mb-4 leading-relaxed text-foreground">{children}</p>,
          // Listeler için
          ul: ({ children }) => <ul className="mb-4 pl-6 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 pl-6 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="text-foreground">{children}</li>,
          // Kod blokları için
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>;
            }
            return (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                <code className="text-sm font-mono">{children}</code>
              </pre>
            );
          },
          // Blockquote için
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          // Tablolar için
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      </div>
    );
}

const PostPage = () => {
  const { categorySlug, postSlug } = useParams();
  const [post, setPost] = useState<ViewPost | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [categoryMostRead, setCategoryMostRead] = useState<any[]>([]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      if (!postSlug) return;

      // URL'den gelen slug'ları temizle
      const cleanPostSlug = cleanSlugFromUrl(postSlug);
      const cleanCategorySlug = cleanSlugFromUrl(categorySlug || '');
      
      // Debug log'ları kaldırıldı
      
      // Önce kategoriyi bul (esnek arama)
      let categoryId = null;
      if (cleanCategorySlug) {
        const { data: catData } = await supabase
          .from("categories")
          .select("id, slug, name")
          .or(`slug.eq.${cleanCategorySlug},name.ilike.%${cleanCategorySlug}%`)
          .maybeSingle();
        
        if (catData) {
          categoryId = catData.id;
        }
      }
      
      // Yazıyı getir
      let data: any = null;
      let error: any = null;
      
      // Eğer kategori ID'si varsa, o kategoriye ait postları ara
      if (categoryId) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("posts")
          .select(
            `
            id, title, slug, content, excerpt, cover_image, created_at, views, tags,
            categories:categories!posts_category_id_fkey ( id, name, slug )
          `
          )
          .eq("slug", cleanPostSlug)
          .eq("status", "published")
          .eq("category_id", categoryId)
          .single();
          
        if (categoryData) {
          data = categoryData;
          error = categoryError;
        }
      }
      
      // Eğer hala bulunamadıysa, sadece post slug ile ara
      if (!data) {
        const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(
          `
          id, title, slug, content, excerpt, cover_image, created_at, views, tags,
          categories:categories!posts_category_id_fkey ( id, name, slug )
        `
        )
          .eq("slug", cleanPostSlug)
        .eq("status", "published")
        .single();
          
        data = postData;
        error = postError;
      }
      
      // Debug log'ları kaldırıldı

      if (error || !data || ignore) {
        setPost(null);
        return;
      }

      // const d = data as any;
      const d = data as any;

      // Post images'ları getir
      const { data: imagesData, error: imagesError } = await supabase
        .from('post_images')
        .select('*')
        .eq('post_id', d.id)
        .order('position');

      if (imagesError && !ignore) {
        console.error('Post images fetch error:', imagesError);
      }

      const categoryName = d.categories?.name ?? "";
      const catSlug =
        d.categories?.slug ??
        (categoryName ? slugifyTr(categoryName) : (categorySlug as string));

      // excerpt'i normalize et
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
        images: imagesData || [],
        excerpt: d.excerpt ?? "",
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
        .eq("status", "published")
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

      // Kategoriye göre en çok okunanlar (benzer yazılar için)
      const { data: mostRead } = await supabase
        .from("posts")
        .select(
          `id, title, slug, cover_image, views, categories:categories!posts_category_id_fkey (slug, name)`
        )
        .eq("status", "published")
        .eq("categories.slug", normalized.category.slug)
        .neq("id", d.id)
        .order("views", { ascending: false })
        .limit(3);
      setCategoryMostRead(mostRead || []);
    })();

    // Sayfa yüklendiğinde en üste scroll et
    window.scrollTo(0, 0);

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
      <UrlRedirect />
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
              <p className="mt-2 text-lg text-muted-foreground">
                {post.excerpt && post.excerpt.trim().length > 0
                  ? post.excerpt
                  : post.content.slice(0, 140) + "..."}
              </p>

              <PostMeta author="Melisa Zeynep Ocak" publishedAt={post.createdAt} readingTime={readingTime} />

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
              {renderFormattedContent(post.content, post.images)}

              <AdSlot slot="inArticle" className="my-8" visible={false} />



              <AdSlot slot="inArticle" className="my-8" visible={false} />


            </section>

            {/* Benzer Yazılar alanı */}
            {categoryMostRead.length > 0 && (
              <section className="mt-12 border-t pt-8">
                <h2 className="text-xl font-bold mb-6">Benzer Yazılar</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {categoryMostRead.map((p) => (
                    <article key={p.id} className="group">
                      <Link to={`/${p.categories?.slug || 'genel'}/${p.slug}`} className="block">
                        <img
                          src={p.cover_image || "/placeholder.svg"}
                          alt={p.title + " görseli"}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-32 object-cover rounded-lg group-hover:scale-[1.02] transition-transform"
                        />
                        <div className="mt-3">
                          <span className="text-xs text-primary">{p.categories?.name}</span>
                          <h3 className="mt-1 font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {p.title}
                          </h3>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Yorumlar alanı */}
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

          </article>

          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              <Sidebar />
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

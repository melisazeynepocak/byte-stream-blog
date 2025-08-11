import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import AdSlot from "@/components/AdSlot";
import { addComment, getComments, getPostBySlugs, incrementViews, getPosts } from "@/lib/blogData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateOgImageDataUrl } from "@/lib/og";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { PostMeta } from "@/components/blog/PostMeta";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { SimilarPosts } from "@/components/blog/SimilarPosts";

const PostPage = () => {
  const { categorySlug, postSlug } = useParams();
  const post = useMemo(() => getPostBySlugs(categorySlug!, postSlug!), [categorySlug, postSlug]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState(() => (post ? getComments(post.id) : []));

  useEffect(() => {
    if (post) {
      incrementViews(post.id);
      setComments(getComments(post.id));
    }
  }, [postSlug]);

  if (!post) {
    return (
      <main className="container py-16">
        <h1 className="text-2xl font-bold">Yazı bulunamadı</h1>
        <p className="mt-2 text-muted-foreground">İçerik kaldırılmış veya bağlantı hatalı olabilir.</p>
        <Link to="/" className="inline-block mt-4 text-primary hover:underline">Anasayfaya dön</Link>
      </main>
    );
  }

  const url = `${window.location.origin}/${post.category.slug}/${post.slug}`;
  const related = useMemo(() =>
    getPosts().filter((p) => p.id !== post.id && p.tags.some((t) => post.tags.includes(t)))
  , [post.id]);

  const ogImage = post.cover || generateOgImageDataUrl(post.title, "TeknoBlog");
  
  // Calculate reading time (rough estimate: 200 words per minute)
  const readingTime = Math.ceil(post.content.split(' ').length / 200);

  return (
    <>
      <ReadingProgress />
      <Seo
        title={`${post.title} – TeknoBlog`}
        description={post.subtitle}
        type="article"
        image={ogImage}
        publishedTime={post.createdAt}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Anasayfa", item: window.location.origin },
              { "@type": "ListItem", position: 2, name: post.category.name, item: `${window.location.origin}/kategori/${post.category.slug}` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: post.title,
            description: post.subtitle,
            datePublished: post.createdAt,
            image: ogImage,
            author: { "@type": "Organization", name: "TeknoBlog" },
            mainEntityOfPage: url,
          },
        ]}
      />

      <main className="container py-6 md:py-10 relative">
        <AdSlot slot="top" className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <article className="lg:col-span-8 max-w-3xl">
            <nav aria-label="breadcrumb" className="mb-3 text-xs text-muted-foreground">
              <Link to="/" className="hover:underline">Anasayfa</Link> / {" "}
              <Link to={`/kategori/${post.category.slug}`} className="hover:underline">{post.category.name}</Link> / {" "}
              <span>{post.title}</span>
            </nav>

            <header className="mb-6">
              <Link to={`/kategori/${post.category.slug}`} className="text-sm text-primary">
                {post.category.name}
              </Link>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-2">{post.title}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{post.subtitle}</p>
              
              <PostMeta 
                author="TeknoBlog Editörü" 
                publishedAt={post.createdAt}
                readingTime={readingTime}
              />
              
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Badge key={t} variant="secondary">#{t}</Badge>
                ))}
              </div>
            </header>

            <img src={ogImage} alt="Kapak görseli" className="w-full rounded-lg mb-6" loading="eager" fetchPriority="high" decoding="async" />

            <TableOfContents content={post.content} />

            <section className="prose prose-neutral max-w-none dark:prose-invert">
              <div id="giris">
                <h2>Giriş</h2>
                <p>{post.content}</p>
              </div>
              
              <AdSlot slot="inArticle" className="my-8" />
              
              <div id="ozellikler">
                <h2>Temel Özellikler</h2>
                <p>Bu bölümde ürünün temel özelliklerini inceleyeceğiz...</p>
                
                <h3 id="performans">Performans Analizi</h3>
                <p>Performans testlerinde dikkat çeken sonuçlar...</p>
                
                <h3 id="kamera">Kamera Kalitesi</h3>
                <p>Kamera performansı ve görüntü kalitesi...</p>
              </div>
              
              <AdSlot slot="inArticle" className="my-8" />
              
              <div id="sonuc">
                <h2>Sonuç ve Değerlendirme</h2>
                <p>Genel değerlendirme ve öneriler...</p>
              </div>
            </section>

            <SimilarPosts posts={related} currentPostId={post.id} />

            <section id="comments" className="mt-12 border-t pt-8">
              <h3 className="font-semibold text-lg mb-3">Yorumlar</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!name.trim() || !message.trim()) return;
                  addComment(post.id, name.trim(), message.trim());
                  setComments(getComments(post.id));
                  setName("");
                  setMessage("");
                }}
                className="space-y-3"
              >
                <Input placeholder="Adınız" value={name} onChange={(e) => setName(e.target.value)} />
                <Textarea placeholder="Yorumunuz" value={message} onChange={(e) => setMessage(e.target.value)} />
                <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground">Gönder</button>
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

          {/* Sidebar with Share Buttons */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              <ShareButtons 
                url={url} 
                title={post.title} 
                className="hidden lg:block mb-6" 
              />
            </div>
          </aside>
        </div>

        {/* Mobile Share Buttons */}
        <div className="lg:hidden fixed bottom-4 left-4 z-40">
          <ShareButtons url={url} title={post.title} />
        </div>
      </main>
    </>
  );
};

export default PostPage;
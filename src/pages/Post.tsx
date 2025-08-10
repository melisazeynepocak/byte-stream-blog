import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import AdSlot from "@/components/AdSlot";
import { addComment, getComments, getPostBySlugs, incrementViews, getPosts } from "@/lib/blogData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateOgImageDataUrl } from "@/lib/og";

const Share = ({ url, title }: { url: string; title: string }) => {
  const text = encodeURIComponent(title);
  const u = encodeURIComponent(url);
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <a className="px-3 py-1 rounded bg-accent hover:bg-accent/80" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noreferrer">Facebook</a>
      <a className="px-3 py-1 rounded bg-accent hover:bg-accent/80" href={`https://twitter.com/intent/tweet?url=${u}&text=${text}`} target="_blank" rel="noreferrer">Twitter/X</a>
      <a className="px-3 py-1 rounded bg-accent hover:bg-accent/80" href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noreferrer">LinkedIn</a>
      <a className="px-3 py-1 rounded bg-accent hover:bg-accent/80" href={`https://api.whatsapp.com/send?text=${text}%20${u}`} target="_blank" rel="noreferrer">WhatsApp</a>
    </div>
  );
};

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
    getPosts().filter((p) => p.id !== post.id && p.tags.some((t) => post.tags.includes(t))).slice(0, 4)
  , [post.id]);

  const ogImage = post.cover || generateOgImageDataUrl(post.title, "TeknoBlog");

  return (
    <>
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

      <main className="container py-6 md:py-10">
        <AdSlot slot="top" className="mb-6" />

        <article className="max-w-3xl">
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
            <p className="mt-2 text-muted-foreground">{post.subtitle}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t} variant="secondary">#{t}</Badge>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Yayınlanma: {new Date(post.createdAt).toLocaleDateString("tr-TR")} · Güncellendi: {new Date(post.createdAt).toLocaleDateString("tr-TR")}
            </div>
          </header>

          <img src={ogImage} alt="Kapak görseli" className="w-full rounded-lg" loading="lazy" decoding="async" />

          <AdSlot slot="inArticle" className="my-6" />

          <section className="prose prose-neutral max-w-none dark:prose-invert">
            <p>{post.content}</p>
          </section>

          <AdSlot slot="inArticle" className="my-6" />

          <aside className="mt-8 p-4 rounded-lg border bg-card">
            <h4 className="font-semibold">İçindekiler</h4>
            <p className="text-sm text-muted-foreground mt-1">Bu yazıdaki başlıkların hızlı özeti (otomatik).</p>
          </aside>

          <div className="mt-8">
            <h3 className="font-semibold mb-2">Paylaş</h3>
            <Share url={url} title={post.title} />
          </div>

          <section className="mt-10">
            <h3 className="font-semibold text-lg mb-3">İlgili Yazılar</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((p) => (
                <Link key={p.id} to={`/${p.category.slug}/${p.slug}`} className="group">
                  <img src={p.cover} alt="" className="w-full h-28 object-cover rounded" loading="lazy" decoding="async" />
                  <div className="mt-2 text-sm font-medium group-hover:underline leading-snug">{p.title}</div>
                </Link>
              ))}
            </div>
          </section>

          <AdSlot slot="inArticle" className="my-6" />

          <section className="mt-10">
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
      </main>
    </>
  );
};

export default PostPage;

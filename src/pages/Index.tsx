import { useEffect, useMemo, useState } from "react";
import { HeroPostCard } from "@/components/blog/HeroPostCard";
import { PostCard } from "@/components/blog/PostCard";
import { Sidebar } from "@/components/blog/Sidebar";
import AdSlot from "@/components/AdSlot";
import { Seo } from "@/components/Seo";
import { getFeaturedPosts, getPosts, searchPosts } from "@/lib/blogData";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [posts, setPosts] = useState(getPosts());

  useEffect(() => {
    setPosts(q ? searchPosts(q) : getPosts());
  }, [q]);

  const featured = useMemo(() => getFeaturedPosts(), []);

  return (
    <>
      <Seo
        title="TeknoBlog – Güncel Teknoloji Haberleri, İncelemeler ve Rehberler"
        description="Telefonlar, bilgisayarlar, yazılım ve teknoloji haberleri. Hızlı, sade ve içerik odaklı teknoloji blogu."
        type="website"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "TeknoBlog",
          url: window.location.origin,
          potentialAction: {
            "@type": "SearchAction",
            target: `${window.location.origin}/?q={search_term_string}`,
            query: "required name=search_term_string",
          },
        }}
      />

      <main className="container py-8">
        {q ? (
          <h1 className="text-2xl font-bold mb-6">Arama: “{q}”</h1>
        ) : (
          <h1 className="sr-only">TeknoBlog – Teknoloji Haberleri ve İncelemeler</h1>
        )}

        {!q && (
          <div className="space-y-6">
            {featured[0] && <HeroPostCard post={featured[0]} />}
            <AdSlot slot="top" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <section className="lg:col-span-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </section>

          <aside className="lg:col-span-4">
            <Sidebar />
          </aside>
        </div>
      </main>
    </>
  );
};

export default Index;

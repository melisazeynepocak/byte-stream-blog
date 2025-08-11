import { useEffect, useMemo, useState } from "react";
import { FeaturedSlider } from "@/components/blog/FeaturedSlider";
import { PostCard } from "@/components/blog/PostCard";
import { Sidebar } from "@/components/blog/Sidebar";
import AdSlot from "@/components/AdSlot";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { getFeaturedPosts, getPosts, searchPosts } from "@/lib/blogData";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [posts, setPosts] = useState(getPosts());
  const [displayedPosts, setDisplayedPosts] = useState(6);

  useEffect(() => {
    const filteredPosts = q ? searchPosts(q) : getPosts();
    setPosts(filteredPosts);
    setDisplayedPosts(6);
  }, [q]);

  const featured = useMemo(() => getFeaturedPosts(), []);
  const postsToShow = posts.slice(0, displayedPosts);
  const hasMorePosts = displayedPosts < posts.length;

  const loadMore = () => {
    setDisplayedPosts(prev => prev + 6);
  };

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
            {featured.length > 0 && <FeaturedSlider posts={featured.slice(0, 6)} />}
            <AdSlot slot="top" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <section className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postsToShow.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
            
            {hasMorePosts && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Daha Fazla Yükle
                </Button>
              </div>
            )}
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

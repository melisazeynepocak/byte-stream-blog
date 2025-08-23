import { useEffect, useState } from "react";
import { FeaturedSlider } from "@/components/blog/FeaturedSlider";
import { TrendingTags } from "@/components/blog/TrendingTags";
import { FeaturedReview } from "@/components/blog/FeaturedReview";
import { PopularGuides } from "@/components/blog/PopularGuides";
import { PostCard } from "@/components/blog/PostCard";
import { Sidebar } from "@/components/blog/Sidebar";
import AdSlot from "@/components/AdSlot";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [posts, setPosts] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [q]);

  const fetchPosts = async () => {
    setLoading(true);
    
    let query = supabase
      .from("posts")
      .select(`
        *,
        categories!posts_category_id_fkey (
          id,
          name,
          slug
        )
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (q) {
      query = query.or(`title.ilike.%${q}%,subtitle.ilike.%${q}%,excerpt.ilike.%${q}%`);
    }

    const { data } = await query as any;
    
    const rows: any[] = (data as any[]) || [];
    const formattedPosts = rows.map((post: any) => ({
      ...post,
      category: post.categories || (post.category_slug ? { slug: post.category_slug, name: post.category_slug } : null),
      cover: post.cover_image || "/placeholder.svg",
    }));

    setPosts(formattedPosts);
    // Fetch curated headlines from headlines table; fallback to featured field if none
    try {
      const sb: any = supabase as any;
      const { data: headlineRows, error: hlErr } = await sb
        .from('headlines')
        .select('post_id, position')
        .order('position', { ascending: true })
        .limit(5);

      if (hlErr) {
        setFeatured([]);
      } else {
        const headlines = (headlineRows as any[]) || [];
        if (headlines.length > 0) {
          const ids = headlines.map(h => h.post_id);
          const { data: headlinePosts } = await sb
            .from('posts')
            .select(`
              *,
              categories!posts_category_id_fkey (
                id,
                name,
                slug
              )
            `)
            .in('id', ids)
            .eq('status', 'published');

          const headlineFormatted = ((headlinePosts as any[]) || []).map((post: any) => ({
            ...post,
            category: post.categories || (post.category_slug ? { slug: post.category_slug, name: post.category_slug } : null),
            cover: post.cover_image || '/placeholder.svg',
          }));

          const orderMap = new Map(ids.map((id, index) => [id, index]));
          headlineFormatted.sort((a: any, b: any) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
          setFeatured(headlineFormatted);
        } else {
          setFeatured([]);
        }
      }
    } catch {
      setFeatured([]);
    }
    setDisplayedPosts(6);
    setLoading(false);
  };

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
            <TrendingTags />
            <FeaturedReview />
            <PopularGuides />
            <AdSlot slot="top" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <section className="lg:col-span-8 space-y-6">
            {loading ? (
              <div>Yükleniyor...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {postsToShow.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            )}
            
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

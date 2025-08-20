import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/blog/PostCard";
import { Sidebar } from "@/components/blog/Sidebar";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categorySlug) return;
    fetchCategoryPosts();
  }, [categorySlug]);

  const fetchCategoryPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        categories!posts_category_id_fkey (
          id,
          name,
          slug
        )
      `)
      .eq("categories.slug", categorySlug)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    const formattedPosts = (data || []).map(post => ({
      ...post,
      category: post.categories,
      cover: post.cover_image || "/placeholder.svg"
    }));

    setPosts(formattedPosts);
    setLoading(false);
  };

  return (
    <>
      <Seo title={`${categorySlug} – Kategori`} description={`${categorySlug} kategorisindeki yazılar.`} />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-6">{categorySlug}</h1>
        {loading ? (
          <div>Yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Bu kategoride içerik bulunamadı.</p>
          </div>
        )}
        <Sidebar />
      </main>
    </>
  );
};

export default CategoryPage;
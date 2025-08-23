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
  const [categoryTitle, setCategoryTitle] = useState<string>("");

  useEffect(() => {
    if (!categorySlug) return;
    fetchCategoryPosts();
  }, [categorySlug]);

  const fetchCategoryPosts = async () => {
    setLoading(true);
    try {
      // Önce kategori adını bul
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .or(`slug.eq.${categorySlug},name.ilike.%${categorySlug}%`)
        .maybeSingle();
      
      if (catError) {
        console.error("Kategori bulunamadı:", catError);
        setLoading(false);
        return;
      }

      if (!catData) {
        console.error("Kategori bulunamadı:", categorySlug);
        setLoading(false);
        return;
      }

      let categoryId = catData.id;
      let categoryName = catData.name;

      // Kategori ID'si ile postları bul
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          categories:categories!posts_category_id_fkey(id, name, slug)
        `)
        .eq("category_id", categoryId)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (postsError) {
        console.error("Postlar yüklenirken hata:", postsError);
        setLoading(false);
        return;
      }

      const rows: any[] = postsData || [];
      const formattedPosts = rows.map((post: any) => ({
        ...post,
        category: post.categories || { slug: catData.slug, name: catData.name },
        cover: post.cover_image || "/placeholder.svg",
      }));

      setPosts(formattedPosts);
      setCategoryTitle(categoryName);
    } catch (error) {
      console.error("Kategori sayfası yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title={`${categoryTitle || categorySlug} – Kategori`} description={`${categoryTitle || categorySlug} kategorisindeki yazılar.`} />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-6">{categoryTitle || categorySlug}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <section className="lg:col-span-8">
            {loading ? (
              <div>Yükleniyor...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </section>
          <aside className="lg:col-span-4 sticky top-24 h-fit">
            <Sidebar />
          </aside>
        </div>
      </main>
    </>
  );
};

export default CategoryPage;
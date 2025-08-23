import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { PostCard } from "@/components/blog/PostCard";
import { Sidebar } from "@/components/blog/Sidebar";

const TagPage = () => {
  const { tag } = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const tagLabel = decodeURIComponent(tag || "");

  useEffect(() => {
    if (!tag) return;
    fetchTagPosts();
  }, [tag]);

  const fetchTagPosts = async () => {
    setLoading(true);
    try {
      // Etiket içeren postları bul
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          categories:categories!posts_category_id_fkey(id, name, slug)
        `)
        .eq("status", "published")
        .contains("tags", [tagLabel])
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Etiket postları yüklenirken hata:", error);
        setPosts([]);
      } else {
        const rows: any[] = data || [];
        const formattedPosts = rows.map((post: any) => ({
          ...post,
          category: post.categories || { slug: "genel", name: "Genel" },
          cover: post.cover_image || "/placeholder.svg",
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error("Etiket sayfası yüklenirken hata:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title={`${tagLabel} – Etiket`} description={`${tagLabel} etiketiyle işaretlenmiş yazılar.`} />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-6">#{tagLabel} etiketi</h1>
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
                <p className="text-muted-foreground">Bu etiketle işaretlenmiş içerik bulunamadı.</p>
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

export default TagPage;

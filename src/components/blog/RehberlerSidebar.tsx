import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import AdSlot from "@/components/AdSlot";
import { TrendingTags } from "@/components/blog/TrendingTags";
import { Calendar, Eye } from "lucide-react";

export const RehberlerSidebar = () => {
  const [mostReadGuides, setMostReadGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostReadGuides = async () => {
      try {
        // Son 30 günde en çok okunan rehberleri getir
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data, error } = await supabase
          .from("posts")
          .select(`
            id, title, slug, cover_image, views, published_at,
            categories:categories!posts_category_id_fkey (slug)
          `)
          .eq("status", "published")
          .gte("published_at", thirtyDaysAgo.toISOString())
          .or("tags.cs.{guide},tags.cs.{rehber},category_id.eq.rehber")
          .order("views", { ascending: false })
          .limit(5);

        if (!error && data) {
          setMostReadGuides(data);
        }
      } catch (error) {
        console.error("En çok okunan rehberler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostReadGuides();
  }, []);

  return (
    <aside className="space-y-8">
      <AdSlot slot="sidebar" />

      <section className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-lg">En Çok Okunan Rehberler</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Son 30 günde en popüler rehberler
        </p>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-20 h-16 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {mostReadGuides.map((guide) => (
              <li key={guide.id} className="flex gap-3">
                <Link to={`/${guide.categories?.slug || 'rehber'}/${guide.slug}`} className="shrink-0">
                  <img 
                    src={guide.cover_image || "/placeholder.svg"} 
                    alt="" 
                    className="w-20 h-16 rounded object-cover" 
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/${guide.categories?.slug || 'rehber'}/${guide.slug}`} 
                    className="font-medium leading-snug hover:underline line-clamp-2 block"
                  >
                    {guide.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{(guide.views ?? 0).toLocaleString()} görüntüleme</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {!loading && mostReadGuides.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Henüz rehber bulunmuyor
          </p>
        )}
      </section>

      <section>
        <TrendingTags />
      </section>
    </aside>
  );
};

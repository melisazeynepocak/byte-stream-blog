import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import AdSlot from "@/components/AdSlot";
import { TrendingTags } from "@/components/blog/TrendingTags";

export const Sidebar = () => {
  const [most, setMost] = useState<any[]>([]);
  useEffect(() => {
    const fetchMostRead = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`id, title, slug, cover_image, views, categories:categories!posts_category_id_fkey (slug)`)
        .eq("status", "published")
        .order("views", { ascending: false })
        .limit(5);
      if (!error && data) {
        setMost(data);
      }
    };
    fetchMostRead();
  }, []);
  return (
    <aside className="space-y-8">
      <AdSlot slot="sidebar" />

      <section className="pt-4">
        <h3 className="font-bold text-lg mb-3">En Çok Okunanlar</h3>
        <ul className="space-y-3">
          {most.map((p) => (
            <li key={p.id} className="flex gap-3">
              <Link to={`/${p.categories?.slug || 'genel'}/${p.slug}`} className="shrink-0">
                <img src={p.cover_image || "/placeholder.svg"} alt="" className="w-44 h-32 rounded object-cover" />
              </Link>
              <div>
                <Link to={`/${p.categories?.slug || 'genel'}/${p.slug}`} className="font-medium leading-snug hover:underline">
                  {p.title}
                </Link>
                <div className="text-xs text-muted-foreground">{(p.views ?? 0).toLocaleString()} görüntülenme</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <TrendingTags />
      </section>
    </aside>
  );
};

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface TrendingTag {
  id: string;
  label: string;
  slug: string;
}

export function TrendingTags() {
  const [tags, setTags] = useState<TrendingTag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const sb: any = supabase as any;
        const { data, error } = await sb
          .from('trending_tags')
          .select('id, label, slug, position')
          .order('position', { ascending: true })
          .limit(20);
        if (error) return;
        setTags(((data as any[]) || []).map(t => ({ id: t.id, label: t.label, slug: t.slug })));
      } catch {
        setTags([]);
      }
    };
    fetchTags();
  }, []);

  if (tags.length === 0) return null;

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Trend Konular</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link key={t.id} to={`/etiket/${t.slug}`}>
            <Badge variant="secondary">#{t.label}</Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}



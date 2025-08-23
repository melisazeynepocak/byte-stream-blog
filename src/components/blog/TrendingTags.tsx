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
        if (error) {
          // Fallback to default tags if database error
          setTags([
            { id: '1', label: 'yapayzeka', slug: 'yapayzeka' },
            { id: '2', label: 'telefon', slug: 'telefon' },
            { id: '3', label: 'bilgisayar', slug: 'bilgisayar' },
            { id: '4', label: 'tablet', slug: 'tablet' },
            { id: '5', label: 'karşılaştırma', slug: 'karsilastirma' },
            { id: '6', label: 'yazılım', slug: 'yazilim' },
            { id: '7', label: 'laptop', slug: 'laptop' }
          ]);
          return;
        }
        const fetchedTags = (data as any[]) || [];
        if (fetchedTags.length === 0) {
          // Fallback to default tags if no data
          setTags([
            { id: '1', label: 'yapayzeka', slug: 'yapayzeka' },
            { id: '2', label: 'telefon', slug: 'telefon' },
            { id: '3', label: 'bilgisayar', slug: 'bilgisayar' },
            { id: '4', label: 'tablet', slug: 'tablet' },
            { id: '5', label: 'karşılaştırma', slug: 'karsilastirma' },
            { id: '6', label: 'yazılım', slug: 'yazilim' },
            { id: '7', label: 'laptop', slug: 'laptop' }
          ]);
        } else {
          setTags(fetchedTags.map(t => ({ id: t.id, label: t.label, slug: t.slug })));
        }
      } catch {
        // Fallback to default tags on any error
        setTags([
          { id: '1', label: 'yapayzeka', slug: 'yapayzeka' },
          { id: '2', label: 'telefon', slug: 'telefon' },
          { id: '3', label: 'bilgisayar', slug: 'bilgisayar' },
          { id: '4', label: 'tablet', slug: 'tablet' },
          { id: '5', label: 'karşılaştırma', slug: 'karsilastirma' },
          { id: '6', label: 'yazılım', slug: 'yazilim' },
          { id: '7', label: 'laptop', slug: 'laptop' }
        ]);
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
            <Badge 
              variant="secondary" 
              className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 hover:text-primary transition-all duration-300 cursor-pointer"
            >
              #{t.label}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}



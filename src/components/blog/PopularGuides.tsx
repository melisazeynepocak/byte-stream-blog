import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface PopularGuidePost {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  cover_image: string | null;
  excerpt: string | null;
  views: number | null;
  categories: {
    id: string;
    name: string;
    slug: string;
  };
}

export function PopularGuides() {
  const [posts, setPosts] = useState<PopularGuidePost[]>([]);
  const [mode, setMode] = useState<'automatic' | 'manual'>('automatic');

  useEffect(() => {
    const fetchPopularGuides = async () => {
      try {
        const sb: any = supabase as any;
        
        // First, check the mode setting
        const { data: modeRow, error: modeErr } = await sb
          .from('popular_guides')
          .select('mode')
          .limit(1)
          .maybeSingle();

        const currentMode = modeRow?.mode || 'automatic';
        setMode(currentMode);

        if (currentMode === 'automatic') {
          // Fetch most viewed published posts (limit 6)
          const { data: postData, error: postErr } = await sb
            .from('posts')
            .select(`
              id,
              title,
              subtitle,
              slug,
              cover_image,
              excerpt,
              views,
              categories!posts_category_id_fkey (
                id,
                name,
                slug
              )
            `)
            .eq('status', 'published')
            .not('views', 'is', null)
            .order('views', { ascending: false })
            .limit(6);

          if (postErr) {
            setPosts([]);
            return;
          }

          const formattedPosts = ((postData as any[]) || []).map((post: any) => ({
            id: post.id,
            title: post.title,
            subtitle: post.subtitle,
            slug: post.slug,
            cover_image: post.cover_image,
            excerpt: post.excerpt,
            views: post.views,
            categories: post.categories,
          }));

          setPosts(formattedPosts);
        } else {
          // Manual mode: fetch selected posts in order
          const { data: guideRows, error: guideErr } = await sb
            .from('popular_guides')
            .select('post_id, position')
            .eq('mode', 'manual')
            .not('post_id', 'is', null)
            .order('position', { ascending: true })
            .limit(6);

          if (guideErr || !guideRows || guideRows.length === 0) {
            setPosts([]);
            return;
          }

          const ids = guideRows.map((g: any) => g.post_id);
          const { data: postData, error: postErr } = await sb
            .from('posts')
            .select(`
              id,
              title,
              subtitle,
              slug,
              cover_image,
              excerpt,
              views,
              categories!posts_category_id_fkey (
                id,
                name,
                slug
              )
            `)
            .in('id', ids)
            .eq('status', 'published');

          if (postErr) {
            setPosts([]);
            return;
          }

          const formattedPosts = ((postData as any[]) || []).map((post: any) => ({
            id: post.id,
            title: post.title,
            subtitle: post.subtitle,
            slug: post.slug,
            cover_image: post.cover_image,
            excerpt: post.excerpt,
            views: post.views,
            categories: post.categories,
          }));

          // Preserve order by position
          const orderMap = new Map(ids.map((id, index) => [id, index]));
          formattedPosts.sort((a: any, b: any) => {
            const aOrder = Number(orderMap.get(a.id) ?? 0);
            const bOrder = Number(orderMap.get(b.id) ?? 0);
            return aOrder - bOrder;
          });
          setPosts(formattedPosts);
        }
      } catch {
        setPosts([]);
      }
    };

    fetchPopularGuides();
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Popüler Rehberler</h2>
        <Badge variant="outline" className="text-xs">
          {mode === 'automatic' ? 'Otomatik' : 'Manuel'}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <Link to={`/${post.categories.slug}/${post.slug}`}>
              <div className="relative">
                <img
                  src={post.cover_image || "/placeholder.svg"}
                  alt={`${post.title} kapak görseli`}
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.categories.name}
                  </Badge>
                </div>
                {mode === 'automatic' && post.views && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs">
                      {post.views} görüntüleme
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-base mb-2 line-clamp-2">
                  {post.title}
                </h3>
                {post.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.subtitle}
                  </p>
                )}
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface FeaturedReviewPost {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  cover_image: string | null;
  excerpt: string | null;
  categories: {
    id: string;
    name: string;
    slug: string;
  };
}

export function FeaturedReview() {
  const [post, setPost] = useState<FeaturedReviewPost | null>(null);

  useEffect(() => {
    const fetchFeaturedReview = async () => {
      try {
        const sb: any = supabase as any;
        const { data: reviewRow, error: reviewErr } = await sb
          .from('featured_review')
          .select('post_id')
          .limit(1)
          .maybeSingle();

        if (reviewErr || !reviewRow) {
          setPost(null);
          return;
        }

        const { data: postData, error: postErr } = await sb
          .from('posts')
          .select(`
            id,
            title,
            subtitle,
            slug,
            cover_image,
            excerpt,
            categories!posts_category_id_fkey (
              id,
              name,
              slug
            )
          `)
          .eq('id', reviewRow.post_id)
          .eq('status', 'published')
          .maybeSingle();

        if (postErr || !postData) {
          setPost(null);
          return;
        }

        setPost({
          id: postData.id,
          title: postData.title,
          subtitle: postData.subtitle,
          slug: postData.slug,
          cover_image: postData.cover_image,
          excerpt: postData.excerpt,
          categories: postData.categories,
        });
      } catch {
        setPost(null);
      }
    };

    fetchFeaturedReview();
  }, []);

  if (!post) return null;

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Öne Çıkan İnceleme</h2>
      </div>
      <Card className="overflow-hidden">
        <Link to={`/${post.categories.slug}/${post.slug}`}>
          <div className="relative">
            <img
              src={post.cover_image || "/placeholder.svg"}
              alt={`${post.title} kapak görseli`}
              className="w-full h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="inline-block text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground mb-2">
                {post.categories.name}
              </span>
              <h3 className="mt-2 text-lg md:text-xl font-bold leading-tight line-clamp-2">
                {post.title}
              </h3>
            </div>
          </div>
        </Link>
      </Card>
    </section>
  );
}

import { Link } from "react-router-dom";
import { Post } from "@/lib/blogData";

interface SimilarPostsProps {
  posts: Post[];
  currentPostId: string;
}

export const SimilarPosts = ({ posts, currentPostId }: SimilarPostsProps) => {
  const similarPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  if (similarPosts.length === 0) return null;

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-xl font-bold mb-6">Benzer Yazılar</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {similarPosts.map((post) => (
          <article key={post.id} className="group">
            <Link to={`/${post.category.slug}/${post.slug}`} className="block">
              <img
                src={post.cover}
                alt={`${post.title} görseli`}
                loading="lazy"
                decoding="async"
                className="w-full h-32 object-cover rounded-lg group-hover:scale-[1.02] transition-transform"
              />
              <div className="mt-3">
                <span className="text-xs text-primary">{post.category.name}</span>
                <h3 className="mt-1 font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {post.subtitle}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};
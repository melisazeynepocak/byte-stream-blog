import { Post } from "@/lib/blogData";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export const PostCard = ({ post }: { post: Post }) => {
  const to = `/${post.category.slug}/${post.slug}`;
  return (
    <article className="rounded-lg border bg-card">
      <Link to={to} className="block">
        <img
          src={post.cover}
          alt={`${post.title} görseli`}
          loading="lazy"
          decoding="async"
          className="w-full h-44 object-cover rounded-t-lg"
        />
      </Link>
      <div className="p-4">
        <Link to={`/kategori/${post.category.slug}`} className="text-xs text-primary">
          {post.category.name}
        </Link>
        <Link to={to} className="block mt-1 font-semibold text-lg leading-snug hover:underline line-clamp-2">
          {post.title}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.subtitle}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary">#{t}</Badge>
          ))}
        </div>
      </div>
    </article>
  );
};

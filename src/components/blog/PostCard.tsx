import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDateTR } from "@/lib/utils";

export const PostCard = ({ post }: { post: any }) => {
  const categorySlug = post?.category?.slug || post?.category_slug || "genel";
  const categoryName = post?.category?.name || (post?.category_name ?? categorySlug);
  const to = `/${categorySlug}/${post.slug}`;
  const cover = post?.cover || post?.cover_image || "/placeholder.svg";
  const tags = Array.isArray(post?.tags) ? post.tags : [];
  return (
    <article className="rounded-lg border bg-card">
      <Link to={to} className="block relative">
        <img
          src={cover}
          alt={`${post.title} görseli`}
          loading="lazy"
          decoding="async"
          className="w-full h-44 object-cover rounded-t-lg"
        />
      </Link>
      <div className="p-4">
        <Link to={`/kategori/${categorySlug}`} className="text-xs text-primary">
          {categoryName}
        </Link>
        <span className="block text-xs text-muted-foreground mt-1 mb-1">
          {formatRelativeDateTR(post.createdAt || post.created_at)}
        </span>
        <Link to={to} className="block mt-1 font-semibold text-lg leading-snug hover:underline line-clamp-2">
          {post.title}
        </Link>
        {post.subtitle && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.subtitle}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.slice(0, 3).map((t: string) => (
            <Badge key={t} variant="secondary">#{t}</Badge>
          ))}
        </div>
      </div>
    </article>
  );
};

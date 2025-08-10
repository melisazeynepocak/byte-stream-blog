import { Post } from "@/lib/blogData";
import { Link } from "react-router-dom";

export const HeroPostCard = ({ post }: { post: Post }) => {
  const to = `/${post.category.slug}/${post.slug}`;
  return (
    <article className="relative overflow-hidden rounded-xl shadow-md" style={{ boxShadow: "var(--shadow-elevated)" }}>
      <Link to={to} className="block group">
        <img
          src={post.cover}
          alt={`${post.title} kapak görseli`}
          loading="eager"
          className="w-full h-[280px] md:h-[420px] object-cover group-hover:scale-[1.02] transition-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <span className="inline-block text-xs md:text-sm px-2 py-1 rounded-md bg-primary text-primary-foreground">
            {post.category.name}
          </span>
          <h2 className="mt-3 text-2xl md:text-4xl font-extrabold leading-tight">
            {post.title}
          </h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-3xl">
            {post.subtitle}
          </p>
        </div>
      </Link>
    </article>
  );
};

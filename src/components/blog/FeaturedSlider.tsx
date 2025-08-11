import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Post } from "@/lib/blogData";
import { Link } from "react-router-dom";

interface FeaturedSliderProps {
  posts: Post[];
}

export const FeaturedSlider = ({ posts }: FeaturedSliderProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [api, setApi] = useState<any>();

  useEffect(() => {
    if (!api || !isPlaying) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api, isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Öne Çıkanlar</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlayPause}
          className="gap-2"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? "Durdur" : "Oynat"}
        </Button>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {posts.map((post) => (
            <CarouselItem key={post.id} className="pl-2 md:pl-4 basis-full md:basis-1/3">
              <FeaturedCard post={post} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

const FeaturedCard = ({ post }: { post: Post }) => {
  const to = `/${post.category.slug}/${post.slug}`;
  
  return (
    <article className="relative overflow-hidden rounded-xl shadow-md group" style={{ boxShadow: "var(--shadow-elevated)" }}>
      <Link to={to} className="block">
        <img
          src={post.cover}
          alt={`${post.title} kapak görseli`}
          loading="lazy"
          decoding="async"
          className="w-full h-48 md:h-64 object-cover group-hover:scale-[1.02] transition-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <span className="inline-block text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground">
            {post.category.name}
          </span>
          <h3 className="mt-2 text-lg md:text-xl font-bold leading-tight line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2 hidden md:block">
            {post.subtitle}
          </p>
        </div>
      </Link>
    </article>
  );
};
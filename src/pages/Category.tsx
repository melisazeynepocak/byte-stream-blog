import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { getByCategory, categoryName, getCategoryTags, getPostsByTags, getMostRead, type CategorySlug } from "@/lib/blogData";
import { PostCard } from "@/components/blog/PostCard";
import { Sidebar } from "@/components/blog/Sidebar";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const currentCategory = (categorySlug as CategorySlug) || "telefonlar";
  const title = `${categoryName(currentCategory)} – Kategori`;
  
  const categoryTags = getCategoryTags(currentCategory);
  const allCategoryPosts = getByCategory(currentCategory);
  const filteredPosts = getPostsByTags(selectedTags, currentCategory);
  const popularPosts = getMostRead(4);
  
  const showPopularSection = allCategoryPosts.length < 6;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  return (
    <>
      <Seo title={title} description={`${categoryName(currentCategory)} kategorisindeki yazılar.`} />
      <main className="container py-8">
        <nav aria-label="breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <a href="/" className="hover:underline">Anasayfa</a> / <span>{categoryName(currentCategory)}</span>
        </nav>
        
        <h1 className="text-2xl font-bold mb-6">{categoryName(currentCategory)}</h1>
        
        {/* Tag Filters */}
        {categoryTags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {categoryTags.map(({ tag, count }) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <Badge
                    key={tag}
                    variant={isActive ? "default" : "secondary"}
                    className="cursor-pointer transition-colors hover:bg-primary/80"
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag} ({count})
                  </Badge>
                );
              })}
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Seçilen etiketlerle eşleşen içerik bulunamadı.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-primary hover:underline"
                >
                  Tüm içerikleri göster
                </button>
              </div>
            )}

            {/* Popular Posts Section */}
            {showPopularSection && selectedTags.length === 0 && (
              <div className="border-t pt-8">
                <h2 className="text-xl font-bold mb-6">Bu kategoride yeni misin?</h2>
                <p className="text-muted-foreground mb-6">Site genelinden en çok okunan yazılar:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {popularPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </section>
          
          <aside className="lg:col-span-4">
            <Sidebar />
          </aside>
        </div>
      </main>
    </>
  );
};

export default CategoryPage;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/blog/PostCard";
import { RehberlerSidebar } from "@/components/blog/RehberlerSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

const RehberlerPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [displayedPosts, setDisplayedPosts] = useState(12);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchRehberlerPosts();
  }, []);

  const fetchRehberlerPosts = async () => {
    setLoading(true);
    try {
      // Rehber tipindeki postları bul (guide/rehber tag'i içeren)
      let { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          categories:categories!posts_category_id_fkey(id, name, slug)
        `)
        .eq("status", "published")
        .or("tags.cs.{guide},tags.cs.{rehber}")
        .order("created_at", { ascending: false });

      // Eğer ilk sorgu boş dönerse, alternatif sorgu dene
      if (!postsData || postsData.length === 0) {
        console.log("İlk sorgu boş, alternatif sorgu deneniyor...");
        const { data: altData, error: altError } = await supabase
          .from("posts")
          .select(`
            *,
            categories:categories!posts_category_id_fkey(id, name, slug)
          `)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (!altError && altData) {
          // Client-side filtreleme yap
          postsData = altData.filter(post => {
            if (Array.isArray(post.tags)) {
              return post.tags.some(tag => 
                tag.toLowerCase().includes('rehber') || 
                tag.toLowerCase().includes('guide')
              );
            }
            return false;
          });
          console.log("Alternatif sorgu sonucu:", postsData);
        }
      }

      if (postsError) {
        console.error("Rehberler yüklenirken hata:", postsError);
        setPosts([]);
        setLoading(false);
        return;
      }

      const rows: any[] = postsData || [];
      console.log("Rehberler sayfası - Gelen veriler:", rows);
      
      const formattedPosts = rows.map((post: any) => ({
        ...post,
        category: post.categories || { slug: "rehber", name: "Rehber" },
        cover: post.cover_image || "/placeholder.svg",
      }));

      console.log("Rehberler sayfası - Formatlanmış veriler:", formattedPosts);
      setPosts(formattedPosts);
      
      // Tüm etiketleri topla
      const allTagsSet = new Set<string>();
      formattedPosts.forEach(post => {
        if (Array.isArray(post.tags)) {
          post.tags.forEach((tag: string) => allTagsSet.add(tag));
        }
      });
      setAllTags(Array.from(allTagsSet).sort());
      
    } catch (error) {
      console.error("Rehberler sayfası yüklenirken hata:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme ve arama
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.subtitle && post.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag === "" || 
      (Array.isArray(post.tags) && post.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  const postsToShow = filteredPosts.slice(0, displayedPosts);
  const hasMorePosts = displayedPosts < filteredPosts.length;

  const loadMore = () => {
    setDisplayedPosts(prev => prev + 12);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("");
    setDisplayedPosts(12);
  };

  return (
    <>
      <Seo 
        title="Rehberler | TeknoBlogoji" 
        description="Teknoloji rehberleri, nasıl yapılır yazıları ve detaylı incelemeler. Telefon, bilgisayar ve yazılım rehberleri." 
      />
      <main className="container py-8">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer">Ana Sayfa</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">Rehberler</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Rehberler</h1>
          <p className="text-muted-foreground text-lg">
            Teknoloji dünyasında yolunuzu bulmanıza yardımcı olacak detaylı rehberler ve nasıl yapılır yazıları.
          </p>
          {/* Debug bilgisi */}

        </div>

        {/* Filtreler */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rehber ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag("")}
              >
                Tümü
              </Button>
              {allTags.slice(0, 8).map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  #{tag}
                </Button>
              ))}
            </div>
            
            {(searchTerm || selectedTag) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Filtreleri Temizle
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <section className="lg:col-span-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Rehberler yükleniyor...</p>
              </div>
            ) : (
              <>
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Rehber bulunamadı</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || selectedTag ? 
                        "Arama kriterlerinize uygun rehber bulunamadı. Filtreleri değiştirmeyi deneyin." :
                        "Henüz rehber eklenmemiş. Yakında burada olacak!"
                      }
                    </p>
                    {(searchTerm || selectedTag) && (
                      <Button onClick={clearFilters} variant="outline">
                        Filtreleri Temizle
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {postsToShow.map((p) => (
                        <PostCard key={p.id} post={p} />
                      ))}
                    </div>
                    
                    {hasMorePosts && (
                      <div className="flex justify-center mt-8">
                        <Button
                          onClick={loadMore}
                          variant="outline"
                          size="lg"
                          className="px-8"
                        >
                          Daha Fazla Yükle
                        </Button>
                      </div>
                    )}
                    
                    {!hasMorePosts && filteredPosts.length > 0 && (
                      <div className="text-center mt-8 py-4 text-muted-foreground">
                        Tüm rehberler gösterildi
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
          
          <aside className="lg:col-span-4 sticky top-24 h-fit">
            <RehberlerSidebar />
          </aside>
        </div>
      </main>
    </>
  );
};

export default RehberlerPage;

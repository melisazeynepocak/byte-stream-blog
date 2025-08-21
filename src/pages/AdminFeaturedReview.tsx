import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Seo } from "@/components/Seo";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface ReviewPost {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  cover_image: string | null;
  categories: {
    id: string;
    name: string;
    slug: string;
  };
  published_at: string | null;
}

export default function AdminFeaturedReview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableAvailable, setTableAvailable] = useState(true);
  const [selectedPost, setSelectedPost] = useState<ReviewPost | null>(null);
  const [posts, setPosts] = useState<ReviewPost[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const sb: any = supabase as any;
      
      // Load current featured review
      const { data: reviewRow, error: reviewErr } = await sb
        .from('featured_review')
        .select('post_id')
        .maybeSingle();

      // Load all published posts
      const { data: postRows, error: postErr } = await sb
        .from('posts')
        .select(`
          id,
          title,
          subtitle,
          slug,
          cover_image,
          categories!posts_category_id_fkey (
            id,
            name,
            slug
          ),
          published_at
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);

      if (reviewErr) {
        setTableAvailable(false);
      } else {
        setTableAvailable(true);
      }

      const allPosts: ReviewPost[] = (postRows || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        subtitle: post.subtitle,
        slug: post.slug,
        cover_image: post.cover_image,
        categories: post.categories,
        published_at: post.published_at,
      }));

      setPosts(allPosts);

      if (reviewRow && !reviewErr) {
        const selected = allPosts.find(p => p.id === reviewRow.post_id);
        setSelectedPost(selected || null);
      }
    } catch {
      setTableAvailable(false);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(p => 
    !q.trim() || 
    p.title.toLowerCase().includes(q.toLowerCase()) ||
    (p.subtitle && p.subtitle.toLowerCase().includes(q.toLowerCase()))
  );

  const selectPost = (post: ReviewPost) => {
    setSelectedPost(post);
  };

  const removeSelection = () => {
    setSelectedPost(null);
  };

  const save = async () => {
    if (!user || !tableAvailable) return;
    setSaving(true);
    try {
      const sb: any = supabase as any;
      
      // Clear existing selection
      await sb.from('featured_review').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Add new selection if any
      if (selectedPost) {
        const { error } = await sb.from('featured_review').insert({
          post_id: selectedPost.id,
          created_by: user.id,
        });
        if (error) throw error;
      }

      toast({ 
        title: 'Kaydedildi', 
        description: selectedPost ? 'Öne çıkan inceleme güncellendi.' : 'Öne çıkan inceleme kaldırıldı.' 
      });
      navigate('/admin');
    } catch (e: any) {
      toast({ 
        title: 'Hata', 
        description: 'Kaydedilemedi: ' + e.message, 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Seo title="Öne Çıkan İnceleme" description="Öne çıkan incelemeyi yönetin" />
      <main className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
            <h1 className="text-3xl font-bold">Öne Çıkan İnceleme</h1>
          </div>
          <Button onClick={save} disabled={saving || !tableAvailable}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>

        {!tableAvailable && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            Öne çıkan inceleme tablosu bulunamadı. Migration'ı çalıştırıp sayfayı yenileyin.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Seçili İnceleme</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPost ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={selectedPost.cover_image || "/placeholder.svg"}
                      alt={selectedPost.title}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={removeSelection}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{selectedPost.title}</div>
                    {selectedPost.subtitle && (
                      <div className="text-sm text-muted-foreground">
                        {selectedPost.subtitle}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {selectedPost.categories.name}
                      </Badge>
                      {selectedPost.published_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(selectedPost.published_at).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Henüz inceleme seçilmedi
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yayınlanan Yazılar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Başlık ara" 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
              />
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {filteredPosts.map(p => (
                  <div 
                    key={p.id} 
                    className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${
                      selectedPost?.id === p.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => selectPost(p)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{p.title}</div>
                      {p.subtitle && (
                        <div className="text-sm text-muted-foreground truncate">
                          {p.subtitle}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {p.categories.name}
                        </Badge>
                        {p.published_at && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(p.published_at).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedPost?.id === p.id && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Seçili
                      </Button>
                    )}
                  </div>
                ))}
                {filteredPosts.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Sonuç bulunamadı
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

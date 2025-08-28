import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Seo } from "@/components/Seo";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, LogOut, BookOpen } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  slug: string;
  category_id: string;
  categories: Category;
  featured: boolean;
  views: number;
  status: string;
  published_at: string;
  created_at: string;
  cover_image?: string;
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [rehberler, setRehberler] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchRehberler();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Yazılar yüklenirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRehberler = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .or("tags.cs.{rehber},tags.cs.{guide}")
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setRehberler(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Rehberler yüklenirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Bu yazıyı silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Yazı silindi",
      });
      
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Yazı silinirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <Seo title="Admin Dashboard" description="Blog yönetim paneli" />
      <main className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Blog yazılarınızı yönetin</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/headlines")}>
              Manşetler
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/trending")}>
              Trend Konular
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/featured-review")}>
              Öne Çıkan İnceleme
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/popular-guides")}>
              Popüler Rehberler
            </Button>
            <Button onClick={() => navigate("/admin/post/new")} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Yeni Yazı
            </Button>
            <Button onClick={() => navigate("/admin/rehber/new")} variant="secondary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Yeni Rehber
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Çıkış
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Rehberler Bölümü */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Son Rehberler
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/rehberler")}
              >
                Tümünü Gör
              </Button>
            </div>
            
            {rehberler.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Henüz rehber yok. İlk rehberinizi oluşturun!</p>
                  <Button onClick={() => navigate("/admin/rehber/new")} className="mt-4">
                    Yeni Rehber Oluştur
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {rehberler.map((rehber) => (
                  <Card key={rehber.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {rehber.title}
                            {rehber.featured && <Badge variant="secondary">Öne Çıkan</Badge>}
                            {rehber.status === 'draft' && <Badge variant="outline">Taslak</Badge>}
                          </CardTitle>
                          <CardDescription>{rehber.subtitle}</CardDescription>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Kategori: {rehber.categories.name}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {rehber.views || 0} görüntüleme
                            </span>
                            <span>{new Date(rehber.created_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        {rehber.cover_image && (
                          <img 
                            src={rehber.cover_image} 
                            alt={rehber.title}
                            className="w-16 h-16 object-cover rounded-md ml-4"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/admin/rehber/edit/${rehber.id}`)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Düzenle
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/${rehber.categories.slug}/${rehber.slug}`)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Görüntüle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Yazılar Bölümü */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Son Yazılar</h2>
            {posts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Henüz yazı yok. İlk yazınızı oluşturun!</p>
                  <Button onClick={() => navigate("/admin/post/new")} className="mt-4">
                    Yeni Yazı Oluştur
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {post.title}
                          {post.featured && <Badge variant="secondary">Öne Çıkan</Badge>}
                          {post.status === 'draft' && <Badge variant="outline">Taslak</Badge>}
                          {post.status === 'published' && <Badge variant="default">Yayınlandı</Badge>}
                        </CardTitle>
                        <CardDescription>{post.subtitle}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Kategori: {post.categories.name}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views} görüntüleme
                          </span>
                          <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                          {post.published_at && (
                            <span>Yayın: {new Date(post.published_at).toLocaleDateString('tr-TR')}</span>
                          )}
                        </div>
                      </div>
                      {post.cover_image && (
                        <img 
                          src={post.cover_image} 
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded-md ml-4"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/post/edit/${post.id}`)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Düzenle
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/${post.categories.slug}/${post.slug}`)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Görüntüle
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Sil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
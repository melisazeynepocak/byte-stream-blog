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
import { ArrowLeft, ArrowDown, ArrowUp, Plus, Trash2, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface GuidePost {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  cover_image: string | null;
  views: number | null;
  categories: {
    id: string;
    name: string;
    slug: string;
  };
  published_at: string | null;
}

interface SelectedGuide {
  id: string;
  post_id: string;
  position: number;
}

export default function AdminPopularGuides() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableAvailable, setTableAvailable] = useState(true);
  const [mode, setMode] = useState<'automatic' | 'manual'>('automatic');
  const [selectedGuides, setSelectedGuides] = useState<SelectedGuide[]>([]);
  const [posts, setPosts] = useState<GuidePost[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const sb: any = supabase as any;
      
      // Load current mode and selections
      const { data: guideRows, error: guideErr } = await sb
        .from('popular_guides')
        .select('mode, post_id, position')
        .order('position', { ascending: true });

      if (guideErr) {
        setTableAvailable(false);
        setMode('automatic');
        setSelectedGuides([]);
      } else {
        setTableAvailable(true);
        
        const rows = (guideRows as any[]) || [];
        if (rows.length > 0) {
          const firstRow = rows[0];
          setMode(firstRow.mode || 'automatic');
          
          if (firstRow.mode === 'manual') {
            const manualGuides = rows
              .filter(r => r.post_id && r.position)
              .map(r => ({ id: r.id, post_id: r.post_id, position: r.position }));
            setSelectedGuides(manualGuides);
          } else {
            setSelectedGuides([]);
          }
        } else {
          setMode('automatic');
          setSelectedGuides([]);
        }
      }

      // Load all published posts for selection
      const { data: postRows, error: postErr } = await sb
        .from('posts')
        .select(`
          id,
          title,
          subtitle,
          slug,
          cover_image,
          views,
          categories!posts_category_id_fkey (
            id,
            name,
            slug
          ),
          published_at
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(100);

      if (!postErr) {
        const allPosts: GuidePost[] = (postRows || []).map((post: any) => ({
          id: post.id,
          title: post.title,
          subtitle: post.subtitle,
          slug: post.slug,
          cover_image: post.cover_image,
          views: post.views,
          categories: post.categories,
          published_at: post.published_at,
        }));
        setPosts(allPosts);
      }
    } catch {
      setTableAvailable(false);
      setMode('automatic');
      setSelectedGuides([]);
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

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= selectedGuides.length) return;
    const arr = [...selectedGuides];
    const t = arr[idx];
    arr[idx] = arr[target];
    arr[target] = t;
    setSelectedGuides(arr);
  };

  const remove = (id: string) => setSelectedGuides(prev => prev.filter(g => g.id !== id));

  const add = (post: GuidePost) => {
    if (selectedGuides.length >= 6) {
      toast({ title: 'Limit', description: 'En fazla 6 rehber seçebilirsiniz.' });
      return;
    }
    const newGuide: SelectedGuide = {
      id: crypto.randomUUID(),
      post_id: post.id,
      position: selectedGuides.length + 1,
    };
    setSelectedGuides(prev => [...prev, newGuide]);
  };

  const save = async () => {
    if (!user || !tableAvailable) return;
    setSaving(true);
    try {
      const sb: any = supabase as any;
      
      // Clear existing data
      await sb.from('popular_guides').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (mode === 'automatic') {
        // Insert automatic mode record
        const { error } = await sb.from('popular_guides').insert({
          mode: 'automatic',
          created_by: user.id,
        });
        if (error) throw error;
      } else {
        // Insert manual mode records
        if (selectedGuides.length > 0) {
          const rows = selectedGuides.map((g, idx) => ({
            mode: 'manual',
            post_id: g.post_id,
            position: idx + 1,
            created_by: user.id,
          }));
          const { error } = await sb.from('popular_guides').insert(rows as any);
          if (error) throw error;
        } else {
          // Insert empty manual mode record
          const { error } = await sb.from('popular_guides').insert({
            mode: 'manual',
            created_by: user.id,
          });
          if (error) throw error;
        }
      }

      toast({ 
        title: 'Kaydedildi', 
        description: `Popüler rehberler ${mode === 'automatic' ? 'otomatik' : 'manuel'} moda ayarlandı.` 
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

  const selectedPostIds = new Set(selectedGuides.map(g => g.post_id));
  const availablePosts = filteredPosts.filter(p => !selectedPostIds.has(p.id));

  return (
    <>
      <Seo title="Popüler Rehberler" description="Popüler rehberleri yönetin" />
      <main className="container mx-auto py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
            <h1 className="text-3xl font-bold">Popüler Rehberler</h1>
          </div>
          <Button onClick={save} disabled={saving || !tableAvailable}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>

        {!tableAvailable && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            Popüler rehberler tablosu bulunamadı. Migration'ı çalıştırıp sayfayı yenileyin.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mode Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Mod Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="mode-switch">Otomatik Mod</Label>
                <Switch
                  id="mode-switch"
                  checked={mode === 'automatic'}
                  onCheckedChange={(checked) => setMode(checked ? 'automatic' : 'manual')}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {mode === 'automatic' ? (
                  <p>En çok görüntülenen 6 yazı otomatik olarak gösterilir.</p>
                ) : (
                  <p>Manuel olarak seçtiğiniz yazılar gösterilir.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Guides (Manual Mode Only) */}
          {mode === 'manual' && (
            <Card>
              <CardHeader>
                <CardTitle>Seçili Rehberler ({selectedGuides.length}/6)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedGuides.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Henüz rehber seçilmedi
                  </div>
                )}
                {selectedGuides.map((guide, idx) => {
                  const post = posts.find(p => p.id === guide.post_id);
                  if (!post) return null;
                  
                  return (
                    <div key={guide.id} className="flex items-center justify-between gap-3 p-3 border rounded-md">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{idx + 1}. {post.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{post.categories?.name}</Badge>
                          {post.views && <span>{post.views} görüntüleme</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => move(idx, -1)} disabled={idx === 0}>
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => move(idx, 1)} disabled={idx === selectedGuides.length - 1}>
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => remove(guide.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Available Posts (Manual Mode Only) */}
          {mode === 'manual' && (
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
                  {availablePosts.map(p => (
                    <div 
                      key={p.id} 
                      className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted/50"
                      onClick={() => add(p)}
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
                          {p.views && (
                            <span className="text-xs text-muted-foreground">
                              {p.views} görüntüleme
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => add(p)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Ekle
                      </Button>
                    </div>
                  ))}
                  {availablePosts.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Sonuç bulunamadı
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview (Automatic Mode) */}
          {mode === 'automatic' && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Otomatik Mod Önizleme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Otomatik modda en çok görüntülenen 6 yazı gösterilir.</p>
                  <p className="mt-2">Mevcut en popüler yazılar:</p>
                  <div className="mt-3 space-y-2">
                    {posts
                      .filter(p => p.views && p.views > 0)
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .slice(0, 6)
                      .map((post, idx) => (
                        <div key={post.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{idx + 1}. {post.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {post.views} görüntüleme
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

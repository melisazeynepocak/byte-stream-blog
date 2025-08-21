import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Seo } from "@/components/Seo";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowDown, ArrowUp, Trash2, Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostRow {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  cover_image?: string | null;
  categories: Category;
  published_at: string | null;
}

interface HeadlineRow {
  post_id: string;
  position: number;
}

export default function AdminHeadlines() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [selected, setSelected] = useState<PostRow[]>([]);
  const [q, setQ] = useState("");
  const [tableAvailable, setTableAvailable] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const sb: any = supabase as any;
      const [{ data: headlineRows, error: hlErr }, { data: postRows }] = await Promise.all([
        sb.from('headlines').select('post_id, position').order('position', { ascending: true }).limit(5),
        sb
          .from('posts')
          .select(`
            *,
            categories!posts_category_id_fkey (
              id,
              name,
              slug
            )
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(50)
      ]) as any;

      const allPosts: PostRow[] = (postRows || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        subtitle: post.subtitle,
        slug: post.slug,
        cover_image: post.cover_image,
        categories: post.categories,
        published_at: post.published_at,
      }));

      if (hlErr) {
        setTableAvailable(false);
      } else {
        setTableAvailable(true);
      }

      const headlineList: HeadlineRow[] = (headlineRows || []) as any[];
      const idToPost = new Map(allPosts.map(p => [p.id, p] as const));
      const selectedOrdered: PostRow[] = headlineList
        .map(h => idToPost.get(h.post_id))
        .filter(Boolean) as PostRow[];

      setPosts(allPosts);
      setSelected(selectedOrdered);
    } catch (error: any) {
      toast({ title: 'Hata', description: 'Veriler yüklenemedi: ' + error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    const lower = q.trim().toLowerCase();
    const selectedIds = new Set(selected.map(s => s.id));
    return posts.filter(p => !selectedIds.has(p.id) && (!lower || p.title.toLowerCase().includes(lower)));
  }, [q, posts, selected]);

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= selected.length) return;
    const next = [...selected];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setSelected(next);
  };

  const remove = (id: string) => {
    setSelected(prev => prev.filter(p => p.id !== id));
  };

  const add = (post: PostRow) => {
    if (selected.length >= 5) {
      toast({ title: 'Limit', description: 'En fazla 5 manşet seçebilirsiniz.' });
      return;
    }
    setSelected(prev => [...prev, post]);
  };

  const save = async () => {
    if (!user || !tableAvailable) return;
    setSaving(true);
    try {
      const ids = selected.map(s => s.id);

      // Delete removed
      if (ids.length > 0) {
        const sb: any = supabase as any;
        await sb.from('headlines').delete().not('post_id', 'in', `(${ids.join(',')})`);
      } else {
        const sb: any = supabase as any;
        await sb.from('headlines').delete().neq('post_id', '00000000-0000-0000-0000-000000000000');
      }

      // Upsert positions
      const upsertRows = selected.map((p, idx) => ({ post_id: p.id, position: idx + 1, created_by: user.id }));
      if (upsertRows.length > 0) {
        const sb: any = supabase as any;
        const { error } = await sb.from('headlines').upsert(upsertRows, { onConflict: 'post_id' });
        if (error) throw error;
      }

      toast({ title: 'Kaydedildi', description: 'Manşetler güncellendi.' });
      navigate('/admin');
    } catch (error: any) {
      toast({ title: 'Hata', description: 'Kaydetme sırasında sorun: ' + error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Seo title="Manşet Haberler" description="Ana sayfa manşetlerini yönetin" />
      <main className="container mx-auto py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
            <h1 className="text-3xl font-bold">Manşet Haberler</h1>
          </div>
          <Button onClick={save} disabled={saving || !tableAvailable}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>

        {!tableAvailable && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            Manşet tablosu bulunamadı. Lütfen Supabase migration'larını çalıştırın ve sayfayı yenileyin.
          </div>
        )}

        {loading ? (
          <div>Yükleniyor...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Seçili Manşetler ({selected.length}/5)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selected.length === 0 && <div className="text-sm text-muted-foreground">Henüz manşet seçilmedi.</div>}
                {selected.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 p-3 border rounded-md">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{idx + 1}. {p.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{p.categories?.name}</Badge>
                        {p.published_at && <span>{new Date(p.published_at).toLocaleDateString('tr-TR')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => move(idx, -1)} disabled={idx === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => move(idx, 1)} disabled={idx === selected.length - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => remove(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yayınlanan Yazılar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Başlık ara" value={q} onChange={(e) => setQ(e.target.value)} />
                <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
                  {filteredPosts.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-3 p-3 border rounded-md">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{p.categories?.name}</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => add(p)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Ekle
                      </Button>
                    </div>
                  ))}
                  {filteredPosts.length === 0 && (
                    <div className="text-sm text-muted-foreground">Sonuç bulunamadı.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}



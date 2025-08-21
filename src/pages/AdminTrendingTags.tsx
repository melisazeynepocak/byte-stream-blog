import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Seo } from "@/components/Seo";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

interface TagRow { id: string; label: string; slug: string; position: number; }

export default function AdminTrendingTags() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableAvailable, setTableAvailable] = useState(true);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [label, setLabel] = useState("");

  useEffect(() => { load(); }, []);

  const slugify = (input: string) => input
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  const load = async () => {
    setLoading(true);
    try {
      const sb: any = supabase as any;
      const { data, error } = await sb
        .from('trending_tags')
        .select('id, label, slug, position')
        .order('position', { ascending: true });
      if (error) {
        setTableAvailable(false);
        setTags([]);
      } else {
        setTableAvailable(true);
        setTags(((data as any[]) || []) as TagRow[]);
      }
    } catch {
      setTableAvailable(false);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= tags.length) return;
    const arr = [...tags];
    const t = arr[idx];
    arr[idx] = arr[target];
    arr[target] = t;
    setTags(arr);
  };

  const remove = (id: string) => setTags(prev => prev.filter(t => t.id !== id));

  const add = () => {
    const v = label.trim();
    if (!v) return;
    const slug = slugify(v);
    if (tags.some(t => t.slug === slug)) {
      toast({ title: 'Zaten var', description: 'Bu etiket zaten listede.' });
      return;
    }
    const next: TagRow = { id: crypto.randomUUID(), label: v, slug, position: tags.length + 1 };
    setTags(prev => [...prev, next]);
    setLabel("");
  };

  const save = async () => {
    if (!user || !tableAvailable) return;
    setSaving(true);
    try {
      const sb: any = supabase as any;
      const ids = tags.map(t => t.id);
      // Simplest: clear and reinsert
      await sb.from('trending_tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (tags.length > 0) {
        const rows = tags.map((t, idx) => ({
          id: t.id,
          label: t.label,
          slug: t.slug,
          position: idx + 1,
          created_by: user.id,
        }));
        const { error } = await sb.from('trending_tags').insert(rows as any);
        if (error) throw error;
      }
      toast({ title: 'Kaydedildi', description: 'Trend konular güncellendi.' });
      navigate('/admin');
    } catch (e: any) {
      toast({ title: 'Hata', description: 'Kaydedilemedi: ' + e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Seo title="Trend Konular" description="Trend etiketleri yönetin" />
      <main className="container mx-auto py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/admin')}> <ArrowLeft className="w-4 h-4" /> Geri</Button>
            <h1 className="text-3xl font-bold">Trend Konular</h1>
          </div>
          <Button onClick={save} disabled={saving || !tableAvailable}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
        </div>

        {!tableAvailable && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            Trend etiketler tablosu bulunamadı. Migration'ı çalıştırıp sayfayı yenileyin.
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Etiket Ekle</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="örn: yapayzeka" value={label} onChange={(e) => setLabel(e.target.value)} />
            <Button type="button" onClick={add} className="gap-2"><Plus className="w-4 h-4" /> Ekle</Button>
          </CardContent>
        </Card>

        <div className="space-y-2 mt-6">
          {loading ? (
            <div>Yükleniyor...</div>
          ) : (
            tags.map((t, idx) => (
              <div key={t.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="min-w-0">
                  <div className="font-medium truncate">#{t.label}</div>
                  <div className="text-xs text-muted-foreground">/{t.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => move(idx, 1)} disabled={idx === tags.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => remove(t.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}



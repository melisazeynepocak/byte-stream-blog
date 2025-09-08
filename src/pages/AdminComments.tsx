import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

type CommentRow = {
  id: string;
  post_id: string;
  name: string;
  message: string;
  approved: boolean;
  created_at: string;
  posts?: { id: string; title: string; slug: string; categories: { slug: string } | null } | null;
};

export default function AdminComments() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<CommentRow[]>([]);
  const [approved, setApproved] = useState<CommentRow[]>([]);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const sb: any = supabase as any;
      // Önce basit sorgu ile test edelim
      const { data, error } = await sb
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Comments fetch error:", error);
        toast({ title: "Hata", description: error.message, variant: "destructive" });
        return;
      }

      console.log("Comments data:", data); // Debug için

      const rows: CommentRow[] = (data || []) as any[];
      setPending(rows.filter((r) => !r.approved));
      setApproved(rows.filter((r) => r.approved));
    } catch (e: any) {
      console.error("Load error:", e);
      toast({ title: "Hata", description: e?.message || "Yorumlar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    try {
      const sb: any = supabase as any;
      const { error } = await sb.from("comments").update({ approved: true }).eq("id", id);
      if (error) throw error;
      toast({ title: "Onaylandı", description: "Yorum yayınlandı" });
      load();
    } catch (e: any) {
      toast({ title: "Hata", description: e?.message || "Onaylanamadı", variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    try {
      const sb: any = supabase as any;
      const { error } = await sb.from("comments").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Silindi", description: "Yorum kaldırıldı" });
      load();
    } catch (e: any) {
      toast({ title: "Hata", description: e?.message || "Silinemedi", variant: "destructive" });
    }
  };

  return (
    <main className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Yorum Yönetimi</h1>
        <Button variant="outline" onClick={() => navigate("/admin")}>Panele Dön</Button>
      </div>

      {loading ? (
        <div className="animate-pulse">Yükleniyor...</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Onay Bekleyenler <Badge variant="outline">{pending.length}</Badge></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pending.length === 0 && <div className="text-sm text-muted-foreground">Bekleyen yorum yok</div>}
              {pending.map((c) => (
                <div key={c.id} className="border rounded-md p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleString("tr-TR")}
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap break-words">{c.message}</p>
                      {c.posts && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          İçerik: <span className="underline cursor-pointer" onClick={() => navigate(`/${c.posts?.categories?.slug || 'genel'}/${c.posts?.slug}`)}>{c.posts?.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" onClick={() => approve(c.id)}>Onayla</Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(c.id)}>Sil</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Onaylananlar <Badge variant="outline">{approved.length}</Badge></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {approved.length === 0 && <div className="text-sm text-muted-foreground">Henüz onaylı yorum yok</div>}
              {approved.map((c) => (
                <div key={c.id} className="border rounded-md p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleString("tr-TR")}
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap break-words">{c.message}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="destructive" onClick={() => remove(c.id)}>Sil</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}



import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Seo } from "@/components/Seo";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X, BookOpen } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface RehberFormData {
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  category_id: string;
  tags: string;
  featured: boolean;
  cover_image?: string;
}

export default function AdminRehberEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { rehberId } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(rehberId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<RehberFormData>({
    title: "",
    subtitle: "",
    excerpt: "",
    content: "",
    category_id: "",
    tags: "",
    featured: false,
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchRehber();
    } else {
      setLoading(false);
    }
  }, [isEditing, rehberId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Kategoriler yüklenirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    }
  };

  const fetchRehber = async () => {
    if (!rehberId) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', rehberId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFormData({
          title: data.title,
          subtitle: data.subtitle || "",
          excerpt: data.excerpt || "",
          content: data.content,
          category_id: data.category_id,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || "",
          featured: data.featured || false,
          cover_image: data.cover_image,
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Rehber yüklenirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `rehber-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, cover_image: publicUrl }));
      
      toast({
        title: "Başarılı",
        description: "Görsel yüklendi",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Görsel yüklenirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const slug = createSlug(formData.title);
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      // Rehber etiketini otomatik ekle
      if (!tagsArray.includes('rehber')) {
        tagsArray.push('rehber');
      }
      if (!tagsArray.includes('guide')) {
        tagsArray.push('guide');
      }
      
      console.log("Rehber oluşturuluyor - Etiketler:", tagsArray);
      
      const status = asDraft ? 'draft' : 'published';

      const rehberData = {
        title: formData.title,
        subtitle: formData.subtitle,
        excerpt: formData.excerpt,
        content: formData.content,
        category_id: formData.category_id,
        tags: tagsArray,
        featured: formData.featured,
        cover_image: formData.cover_image,
        slug,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        user_id: user.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('posts')
          .update(rehberData)
          .eq('id', rehberId);

        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: `Rehber ${status === 'draft' ? 'taslak olarak kaydedildi' : 'güncellendi ve yayınlandı'}`,
        });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert(rehberData);

        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: `Rehber ${status === 'draft' ? 'taslak olarak kaydedildi' : 'oluşturuldu ve yayınlandı'}`,
        });
      }

      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: `Rehber ${isEditing ? 'güncellenirken' : 'oluşturulurken'} hata oluştu: ` + error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
      <Seo title="Rehber Editörü" description="Rehber oluştur ve düzenle" />
      <main className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              {isEditing ? "Rehber Düzenle" : "Yeni Rehber Oluştur"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Mevcut rehberi düzenleyin" : "Yeni bir rehber yazısı oluşturun"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sol Kolon */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Başlık *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Rehber başlığı"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Alt Başlık</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Kısa açıklama"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Özet</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Rehber özeti (opsiyonel)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Kategori *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags">Etiketler</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="etiket1, etiket2, etiket3"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Virgülle ayırarak yazın. "rehber" ve "guide" etiketleri otomatik eklenir.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, featured: checked as boolean }))
                      }
                    />
                    <Label htmlFor="featured">Öne çıkan rehber</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kapak Görseli</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.cover_image && (
                    <div className="relative">
                      <img
                        src={formData.cover_image}
                        alt="Kapak görseli"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData(prev => ({ ...prev, cover_image: undefined }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="cover-upload">Görsel Yükle</Label>
                    <Input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading && <p className="text-sm text-muted-foreground">Yükleniyor...</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sağ Kolon */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>İçerik</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="content">Rehber İçeriği *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Rehber içeriğini buraya yazın..."
                      rows={20}
                      required
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Alt Butonlar */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(new Event('submit') as any, true)}
              disabled={saving}
            >
              Taslak Olarak Kaydet
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : (isEditing ? "Güncelle ve Yayınla" : "Oluştur ve Yayınla")}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}

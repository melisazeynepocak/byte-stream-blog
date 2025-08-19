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
import { ArrowLeft, Upload, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostFormData {
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  category_id: string;
  tags: string;
  featured: boolean;
  cover_image?: string;
}

export default function AdminPostEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { postId } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(postId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<PostFormData>({
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
      fetchPost();
    } else {
      setLoading(false);
    }
  }, [isEditing, postId]);

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

  const fetchPost = async () => {
    if (!postId) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFormData({
          title: data.title,
          subtitle: data.subtitle || "",
          excerpt: data.excerpt || "",
          content: data.content,
          category_id: data.category_id,
          tags: data.tags?.join(", ") || "",
          featured: data.featured || false,
          cover_image: data.cover_image || undefined,
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Yazı yüklenirken hata oluştu: " + error.message,
        variant: "destructive",
      });
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, cover_image: data.publicUrl }));
      
      toast({
        title: "Başarılı",
        description: "Resim yüklendi",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Resim yüklenirken hata oluştu: " + error.message,
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
      const status = asDraft ? 'draft' : 'published';

      const postData = {
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
          .update(postData)
          .eq('id', postId);

        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: `Yazı ${status === 'draft' ? 'taslak olarak kaydedildi' : 'güncellendi ve yayınlandı'}`,
        });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert(postData);

        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: `Yazı ${status === 'draft' ? 'taslak olarak kaydedildi' : 'oluşturuldu ve yayınlandı'}`,
        });
      }

      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: `Yazı ${isEditing ? 'güncellenirken' : 'oluşturulurken'} hata oluştu: ` + error.message,
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
      <Seo 
        title={isEditing ? "Yazı Düzenle" : "Yeni Yazı"} 
        description={isEditing ? "Blog yazısını düzenleyin" : "Yeni blog yazısı oluşturun"} 
      />
      <main className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/admin")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Yazı Düzenle" : "Yeni Yazı"}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Yazıyı Düzenle" : "Yeni Yazı Oluştur"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
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
              </div>

              <div>
                <Label htmlFor="subtitle">Alt Başlık</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Özet</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  placeholder="Yazının kısa bir özeti..."
                />
              </div>

              <div>
                <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="örn: teknoloji, android, kamera"
                />
              </div>

              <div>
                <Label htmlFor="cover-image">Kapak Görseli</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? "Yükleniyor..." : "Resim Yükle"}
                    </Label>
                  </div>
                  
                  {formData.cover_image && (
                    <div className="relative w-48 h-32">
                      <img
                        src={formData.cover_image}
                        alt="Kapak görseli"
                        className="w-full h-full object-cover rounded-md"
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
                </div>
              </div>

              <div>
                <Label htmlFor="content">İçerik *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: Boolean(checked) }))}
                />
                <Label htmlFor="featured">Öne çıkan yazı</Label>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)} 
                  disabled={saving || !formData.category_id}
                  variant="outline"
                >
                  {saving ? "Kaydediliyor..." : "Taslak Kaydet"}
                </Button>
                <Button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, false)} 
                  disabled={saving || !formData.category_id}
                >
                  {saving ? "Yayınlanıyor..." : (isEditing ? "Güncelle ve Yayınla" : "Yayınla")}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/admin")}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
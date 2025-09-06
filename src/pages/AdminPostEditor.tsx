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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Seo } from "@/components/Seo";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X, Image, Plus, GripVertical, Eye, Edit3 } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import { createSlug } from '@/lib/slug';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostImage {
  id?: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  position: number;
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
  images: PostImage[];
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
  const [imageUploading, setImageUploading] = useState(false);
  
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    subtitle: "",
    excerpt: "",
    content: "",
    category_id: "",
    tags: "",
    featured: false,
    images: [],
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
        // Fetch post images
        const { data: imagesData, error: imagesError } = await supabase
          .from('post_images')
          .select('*')
          .eq('post_id', postId)
          .order('position');

        if (imagesError) throw imagesError;

        setFormData({
          title: data.title,
          subtitle: data.subtitle || "",
          excerpt: data.excerpt || "",
          content: data.content,
          category_id: data.category_id,
          tags: data.tags?.join(", ") || "",
          featured: data.featured || false,
          cover_image: data.cover_image || undefined,
          images: imagesData || [],
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

  // createSlug fonksiyonu artık @/lib/slug'dan import ediliyor

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

  const handleContentImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `content-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      const newImage: PostImage = {
        image_url: data.publicUrl,
        alt_text: "",
        caption: "",
        position: formData.images.length,
      };

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      
      toast({
        title: "Başarılı",
        description: "İçerik resmi yüklendi",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "İçerik resmi yüklenirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const updateImage = (index: number, field: keyof PostImage, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      
      // Update positions
      return {
        ...prev,
        images: newImages.map((img, index) => ({ ...img, position: index }))
      };
    });
  };

  const insertImageIntoContent = (imageUrl: string) => {
    const imageTag = `\n\n![Resim](${imageUrl})\n\n`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + imageTag
    }));
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

      let currentPostId = postId;

      if (isEditing) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);

        if (error) throw error;
        currentPostId = postId;
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert(postData)
          .select('id')
          .single();

        if (error) throw error;
        currentPostId = data.id;
      }

      // Handle post images
      if (currentPostId) {
        // Delete existing images if editing
        if (isEditing) {
          await supabase
            .from('post_images')
            .delete()
            .eq('post_id', currentPostId);
        }

        // Insert new images
        if (formData.images.length > 0) {
          const imagesToInsert = formData.images.map(img => ({
            post_id: currentPostId,
            image_url: img.image_url,
            alt_text: img.alt_text,
            caption: img.caption,
            position: img.position,
          }));

          const { error: imagesError } = await supabase
            .from('post_images')
            .insert(imagesToInsert);

          if (imagesError) throw imagesError;
        }
      }
      
      toast({
        title: "Başarılı",
        description: `Yazı ${status === 'draft' ? 'taslak olarak kaydedildi' : 'güncellendi ve yayınlandı'}`,
      });

      // Sitemap'i güncelle
      await updateSitemap();

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

  // Sitemap'i güncelle
  const updateSitemap = async () => {
    try {
      await fetch('/api/regenerate-sitemap', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Sitemap update failed:', error);
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
      <main className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/admin")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Yazı Düzenle" : "Yeni Yazı"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleContentImageUpload}
                          className="hidden"
                          id="content-image-upload"
                          disabled={imageUploading}
                        />
                        <Label
                          htmlFor="content-image-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-sm"
                        >
                          <Image className="w-4 h-4" />
                          {imageUploading ? "Yükleniyor..." : "İçerik Resmi Ekle"}
                        </Label>
                      </div>
                      
                      <Tabs defaultValue="edit" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="edit" className="flex items-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            Düzenle
                          </TabsTrigger>
                          <TabsTrigger value="preview" className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Önizleme
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit" className="mt-4">
                          <div className="border rounded-md">
                            <MDEditor
                              value={formData.content}
                              onChange={(value) => setFormData(prev => ({ ...prev, content: value || "" }))}
                              data-color-mode="light"
                              height={400}
                              visibleDragbar={false}
                              textareaProps={{
                                placeholder: `Yazınızın içeriğini buraya yazın... Markdown formatını kullanabilirsiniz.

Örnek kullanım:
# Ana Başlık
## Alt Başlık
### Küçük Başlık

**Kalın yazı** ve *italik yazı*

- Madde 1
- Madde 2
- Madde 3

1. Sayılı liste 1
2. Sayılı liste 2
3. Sayılı liste 3

> Alıntı metni

\`\`\`javascript
// Kod bloğu
const örnek = "kod";
\`\`\``,
                              }}
                              toolbarHeight={50}
                              preview="edit"
                            />
                          </div>
                        </TabsContent>
                        <TabsContent value="preview" className="mt-4">
                          <div className="border rounded-md p-4 min-h-[400px] bg-white">
                            <MDEditor.Markdown 
                              source={formData.content} 
                              style={{ 
                                whiteSpace: 'pre-wrap',
                                backgroundColor: 'transparent'
                              }}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
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
          </div>

          {/* Images Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  İçerik Resimleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.images.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Henüz resim eklenmemiş</p>
                    </div>
                  ) : (
                    formData.images.map((image, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Resim {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-6 w-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <img
                          src={image.image_url}
                          alt={image.alt_text || "İçerik resmi"}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">Alt Metin</Label>
                            <Input
                              value={image.alt_text || ""}
                              onChange={(e) => updateImage(index, 'alt_text', e.target.value)}
                              placeholder="Resim açıklaması"
                              className="text-sm"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">Başlık</Label>
                            <Input
                              value={image.caption || ""}
                              onChange={(e) => updateImage(index, 'caption', e.target.value)}
                              placeholder="Resim başlığı"
                              className="text-sm"
                            />
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertImageIntoContent(image.image_url)}
                            className="w-full"
                          >
                            İçeriğe Ekle
                          </Button>
                        </div>
                        
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveImage(index, index - 1)}
                            className="w-full"
                          >
                            Yukarı Taşı
                          </Button>
                        )}
                        
                        {index < formData.images.length - 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveImage(index, index + 1)}
                            className="w-full"
                          >
                            Aşağı Taşı
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
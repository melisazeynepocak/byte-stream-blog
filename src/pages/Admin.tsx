import { useState } from "react";
import { addPost, CATEGORIES, type CategorySlug } from "@/lib/blogData";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Seo } from "@/components/Seo";

const AdminPage = () => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState<CategorySlug>("telefonlar");
  const [tags, setTags] = useState("");
  const [cover, setCover] = useState("");
  const [content, setContent] = useState("");
  const [featured, setFeatured] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Seo title="Admin – Yeni Yazı" description="Yeni blog yazısı ekleyin" />
      <main className="container py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Yeni Yazı Ekle</h1>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const created = addPost({
              title,
              subtitle,
              categorySlug: category,
              tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
              cover: cover || "https://source.unsplash.com/featured/1024x640?technology",
              content,
              featured,
            });
            navigate(`/${created.category.slug}/${created.slug}`);
          }}
        >
          <Input placeholder="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input placeholder="Alt Başlık" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} required />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Kategori</label>
              <select
                className="mt-1 w-full rounded border bg-background px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategorySlug)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm">Etiketler (virgülle ayırın)</label>
              <Input placeholder="ör: android, kamera, performans" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
          </div>

          <Input placeholder="Kapak görseli URL" value={cover} onChange={(e) => setCover(e.target.value)} />
          <Textarea placeholder="İçerik" value={content} onChange={(e) => setContent(e.target.value)} rows={8} />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Öne çıkar
          </label>

          <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground">Yayınla</button>
        </form>
      </main>
    </>
  );
};

export default AdminPage;

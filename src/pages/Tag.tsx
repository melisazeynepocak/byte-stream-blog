import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { getPosts } from "@/lib/blogData";
import { PostCard } from "@/components/blog/PostCard";
import { Sidebar } from "@/components/blog/Sidebar";

const TagPage = () => {
  const { tag } = useParams();
  const tagLabel = decodeURIComponent(tag || "");
  const list = getPosts().filter((p) => p.tags.some((t) => t.toLowerCase() === tagLabel.toLowerCase()));
  return (
    <>
      <Seo title={`${tagLabel} – Etiket`} description={`${tagLabel} etiketiyle işaretlenmiş yazılar.`} />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-6">#{tagLabel} etiketi</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8">
            <div className="grid sm:grid-cols-2 gap-6">
              {list.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </section>
          <aside className="lg:col-span-4">
            <Sidebar />
          </aside>
        </div>
      </main>
    </>
  );
};

export default TagPage;

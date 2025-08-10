import { getAllTags, getMostRead } from "@/lib/blogData";
import { Link } from "react-router-dom";
import AdSlot from "@/components/AdSlot";

export const Sidebar = () => {
  const most = getMostRead(5);
  const tags = getAllTags();
  return (
    <aside className="space-y-6">
      <AdSlot slot="sidebar" />

      <section>
        <h3 className="font-bold text-lg mb-3">En Çok Okunanlar</h3>
        <ul className="space-y-3">
          {most.map((p) => (
            <li key={p.id} className="flex gap-3">
              <Link to={`/${p.category.slug}/${p.slug}`} className="shrink-0">
                <img src={p.cover} alt="" className="w-20 h-16 rounded object-cover" />
              </Link>
              <div>
                <Link to={`/${p.category.slug}/${p.slug}`} className="font-medium leading-snug hover:underline">
                  {p.title}
                </Link>
                <div className="text-xs text-muted-foreground">{p.views.toLocaleString()} görüntülenme</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-lg mb-3">Etiket Bulutu</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link key={t.tag} to={`/etiket/${encodeURIComponent(t.tag)}`} className="text-sm px-2 py-1 rounded bg-accent hover:bg-accent/80">
              #{t.tag}
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
};

// src/components/layout/Header.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronDown, Cpu, Smartphone, Tablet as TabletIcon,
  Bot, Shield, Gamepad2, Newspaper
} from "lucide-react";

type Category = { id: string; name: string; slug: string };
type Featured = { id: string; title: string; slug: string; cover_image: string | null; categories?: { slug: string } | null };

const GROUP_MAP: Record<string, "devices" | "software" | "market" | "other"> = {
  telefonlar: "devices",
  bilgisayarlar: "devices",
  tablet: "devices",
  "yapay-zeka": "software",
  yazilim: "software",
  "internet-guvenlik": "software",
  oyun: "software",
  donanim: "market",
  teknoloji: "market",
  "teknoloji-haberleri": "market",
  rehber: "software",
};

const groupIcon: Record<string, JSX.Element> = {
  devices: <Cpu className="w-4 h-4" />,
  software: <Bot className="w-4 h-4" />,
  market: <Newspaper className="w-4 h-4" />,
  other: <Cpu className="w-4 h-4" />,
};

export default function Header() {
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [featured, setFeatured] = useState<Featured | null>(null);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("categories").select("id,name,slug").order("name");
      setCats(data ?? []);
      const { data: fp } = await supabase
        .from("posts")
        .select("id,title,slug,cover_image,categories:categories!posts_category_id_fkey(slug)")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setFeatured(fp as Featured | null);
    })();
  }, []);

  useEffect(() => {
    setOpen(false);
    setDrawer(false);
  }, [location.pathname]);

  const grouped = useMemo(() => {
    const g = { devices: [] as Category[], software: [] as Category[], market: [] as Category[], other: [] as Category[] };
    cats.forEach((c) => (g[GROUP_MAP[c.slug] ?? "other"] as Category[]).push(c));
    return g;
  }, [cats]);

  return (
    <div className="sticky top-0 z-50 border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
      <div className="container mx-auto h-14 px-3 flex items-center justify-between">
        <Link to="/" className="font-black text-lg tracking-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            TeknoBlogoji
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/">Anasayfa</NavLink>
          <NavLink to="/haber">Haber</NavLink>
          <NavLink to="/inceleme">İnceleme</NavLink>
          <NavLink to="/rehber">Rehber</NavLink>

          <li
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button className="inline-flex items-center gap-1 hover:text-primary transition">
              Kategoriler <ChevronDown size={16} />
            </button>
            {open && <MegaMenu groups={grouped} featured={featured} />}
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <SearchButton />
          <button
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
            onClick={() => setDrawer(true)}
            aria-label="Menüyü aç"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[360px] bg-white dark:bg-zinc-950 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <Link to="/" className="font-black text-lg">TeknoBlogoji</Link>
              <button onClick={() => setDrawer(false)} className="text-2xl leading-none">×</button>
            </div>
            <MobileSection title="Cihazlar" items={grouped.devices} />
            <MobileSection title="Yazılım & Servis" items={grouped.software} />
            <MobileSection title="Pazar & Trend" items={grouped.market} />
            {grouped.other.length > 0 && <MobileSection title="Diğer" items={grouped.other} />}
            <hr className="my-3" />
            <Link className="block py-2" to="/haber">Haber</Link>
            <Link className="block py-2" to="/inceleme">İnceleme</Link>
            <Link className="block py-2" to="/rehber">Rehber</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="relative inline-block py-1 hover:text-primary transition after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-indigo-600 after:to-fuchsia-600 hover:after:w-full after:transition-all"
      >
        {children}
      </Link>
    </li>
  );
}

/* ---------- MEGA MENU (desktop) ---------- */
function MegaMenu({
  groups,
  featured,
}: {
  groups: Record<string, Category[]>;
  featured: Featured | null;
}) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-[980px] rounded-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] p-6 grid grid-cols-4 gap-6">
      <MenuColumn title="Cihazlar" icon={groupIcon.devices} items={groups.devices} />
      <MenuColumn title="Yazılım & Servis" icon={groupIcon.software} items={groups.software} />
      <MenuColumn title="Pazar & Trend" icon={groupIcon.market} items={groups.market.length ? groups.market : groups.other} />

      {/* Featured card */}
      <div className="col-span-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Öne Çıkan</div>
        {featured ? (
          <Link
            to={`/${featured.categories?.slug ?? "teknoloji"}/${featured.slug}`}
            className="group block overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow hover:shadow-lg transition"
          >
            <div
              className="h-32 w-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${featured.cover_image ?? ""})`,
              }}
            />
            <div className="p-3">
              <div className="line-clamp-2 text-sm font-semibold group-hover:text-primary transition">
                {featured.title}
              </div>
            </div>
          </Link>
        ) : (
          <div className="h-40 rounded-xl bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 animate-pulse" />
        )}
      </div>
    </div>
  );
}

function MenuColumn({
  title,
  icon,
  items,
}: {
  title: string;
  icon: JSX.Element;
  items: Category[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
        <span className="p-1.5 rounded-md bg-black/5 dark:bg-white/10">{icon}</span>
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.id}>
            <Link
              to={`/kategori/${it.slug}`}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <span>{it.name}</span>
              {/* küçük örnek ikonlar (opsiyonel) */}
              {it.slug === "telefonlar" && <Smartphone className="w-3.5 h-3.5 opacity-60" />}
              {it.slug === "tablet" && <TabletIcon className="w-3.5 h-3.5 opacity-60" />}
              {it.slug === "internet-guvenlik" && <Shield className="w-3.5 h-3.5 opacity-60" />}
              {it.slug === "oyun" && <Gamepad2 className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- MOBILE SECTIONS ---------- */
function MobileSection({ title, items }: { title: string; items: Category[] }) {
  if (!items.length) return null;
  return (
    <div className="mb-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.id}>
            <Link to={`/kategori/${it.slug}`} className="block rounded-lg px-2 py-2 hover:bg-black/5 dark:hover:bg-white/10">
              {it.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- SEARCH BUTTON ---------- */
function SearchButton() {
  return (
    <Link
      to="/ara"
      className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition"
    >
      🔍 <span className="hidden sm:inline">Ara</span>
    </Link>
  );
}

// src/components/layout/Header.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "../SearchModal";
import {
  ChevronDown, Cpu, Smartphone, Tablet as TabletIcon,
  Bot, Shield, Gamepad2, Newspaper, Search, Menu,
  Clock, Globe, Building, Calendar, Monitor, Code, Settings,
  Smartphone as PhoneIcon, Laptop, Headphones, Play, 
  BarChart3, BookOpen, Lightbulb, Rocket, Brain, Bitcoin,
  Satellite, Atom, Dna, Trophy
} from "lucide-react";

type Category = { id: string; name: string; slug: string };
type Featured = { id: string; title: string; slug: string; cover_image: string | null; categories?: { slug: string } | null };

// Yeni menü yapısı
const MENU_STRUCTURE = {
  Kategoriler: {
    title: "Kategoriler test",
    icon: <Monitor className="w-4 h-4" />,
    submenu: [
      { title: "Telefon", icon: <PhoneIcon className="w-4 h-4" />, href: "/kategori/Telefon" },
      { title: "Bilgisayar", icon: <Laptop className="w-4 h-4" />, href: "/kategori/Bilgisayar" },
      { title: "Tablet", icon: <Code className="w-4 h-4" />, href: "/kategori/tablet" },
      { title: "Teknoloji", icon: <Headphones className="w-4 h-4" />, href: "/kategori/teknoloji" },
      { title: "Yazılım", icon: <Play className="w-4 h-4" />, href: "/kategori/yazilim" }
    ]
  },
  karsilastirmalar: {
    title: "Karşılaştırmalar",
    icon: <BarChart3 className="w-4 h-4" />,
    submenu: [
      { title: "Telefon Karşılaştırmaları", icon: <PhoneIcon className="w-4 h-4" />, href: "/karsilastirma/telefon" },
      { title: "Laptop Karşılaştırmaları", icon: <Laptop className="w-4 h-4" />, href: "/karsilastirma/laptop" },
      { title: "Yazılım Karşılaştırmaları", icon: <Code className="w-4 h-4" />, href: "/karsilastirma/yazilim" },
      { title: "Tablo Görünümü", icon: <BarChart3 className="w-4 h-4" />, href: "/karsilastirma/tablo" }
    ]
  },
  rehberler: {
    title: "Rehberler",
    icon: <BookOpen className="w-4 h-4" />,
    submenu: [] // submenu kaldırıldı
  }
};

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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [featured, setFeatured] = useState<Featured | null>(null);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

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
    setOpenMenu(null);
    setDrawer(false);
  }, [location.pathname]);

  // Click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu]);

  const grouped = useMemo(() => {
    const g = { devices: [] as Category[], software: [] as Category[], market: [] as Category[], other: [] as Category[] };
    cats.forEach((c) => (g[GROUP_MAP[c.slug] ?? "other"] as Category[]).push(c));
    return g;
  }, [cats]);

  const handleMenuToggle = (menuKey: string) => {
    setOpenMenu(openMenu === menuKey ? null : menuKey);
  };

  return (
    <div className="sticky top-0 z-50 border-b border-white/20 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto h-16 px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-fuchsia-500 transition-all duration-300">
              TeknoBlogoji
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-1" ref={menuRef}>
          {/* Ana Menü Öğeleri */}
          {Object.entries(MENU_STRUCTURE).map(([key, menu]) => (
            <div key={key} className="relative">
              {key === "rehberler" ? (
                <Link
                  to="/rehberler"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    openMenu === key 
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 text-primary' 
                      : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 hover:text-primary'
                  }`}
                  onClick={() => setOpenMenu(null)}
                >
                  {menu.icon}
                  {menu.title}
                </Link>
              ) : (
                <button
                  onClick={() => handleMenuToggle(key)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    openMenu === key 
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 text-primary' 
                      : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 hover:text-primary'
                  }`}
                >
                  {menu.icon}
                  {menu.title}
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openMenu === key ? 'rotate-180' : ''}`} />
                </button>
              )}
              
              {/* Dropdown Menu */}
              {openMenu === key && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/20 dark:border-white/10 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.4)] p-4">
                  <div className="space-y-1">
                    {menu.submenu.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all duration-300 group"
                        onClick={() => setOpenMenu(null)}
                      >
                        <span className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
                          {item.icon}
                        </span>
                        <span className="font-medium group-hover:text-primary transition-colors duration-300">
                          {item.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Search, Theme Toggle and Mobile Menu */}
        <div className="flex items-center gap-3">
          <SearchButton onClick={() => setSearchModal(true)} />
          <ThemeToggle />
          <button
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all duration-300"
            onClick={() => setDrawer(true)}
            aria-label="Menüyü aç"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[360px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl p-6 shadow-2xl border-r border-white/20 dark:border-white/10 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="font-black text-lg">TeknoBlogoji</Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={() => setDrawer(false)} className="text-2xl leading-none hover:text-primary transition-colors">×</button>
              </div>
            </div>
            
            {/* Mobile Menu Items */}
            <div className="space-y-4">
              {Object.entries(MENU_STRUCTURE).map(([key, menu]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    {menu.icon}
                    {menu.title}
                  </div>
                  {key === "rehberler" ? (
                    <Link
                      to="/rehberler"
                      className="block py-2 px-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all duration-300 text-sm"
                      onClick={() => setDrawer(false)}
                    >
                      {menu.title}
                    </Link>
                  ) : (
                    <div className="ml-6 space-y-1">
                      {menu.submenu.map((item, index) => (
                        <Link
                          key={index}
                          to={item.href}
                          className="block py-2 px-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all duration-300 text-sm"
                          onClick={() => setDrawer(false)}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <SearchModal 
        isOpen={searchModal} 
        onClose={() => setSearchModal(false)} 
      />
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="relative inline-block py-2 px-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all duration-300 hover:text-primary font-medium after:content-[''] after:absolute after:left-1/2 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-indigo-600 after:to-fuchsia-600 hover:after:w-full hover:after:left-0 after:transition-all after:duration-300"
      >
        {children}
      </Link>
    </li>
  );
}

/* ---------- SEARCH BUTTON ---------- */
function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-white/20 dark:border-white/10 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-800 group"
    >
      <Search size={16} className="group-hover:text-primary transition-colors duration-300" />
      <span className="hidden sm:inline font-medium group-hover:text-primary transition-colors duration-300">Ara</span>
    </button>
  );
}

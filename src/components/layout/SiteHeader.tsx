import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/blogData";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";

export const SiteHeader = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const debounceRef = useRef<number | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex items-center justify-between h-16 gap-4">
        <NavLink to="/" className="font-extrabold text-lg tracking-tight">
          <span className="text-primary">Tekno</span>Blogoji
        </NavLink>

        <nav className="hidden md:flex items-center gap-4">
          {CATEGORIES.map((c) => (
            <NavLink
              key={c.slug}
              to={`/kategori/${c.slug}`}
              className={({ isActive }) =>
                `text-sm px-2 py-1 rounded-md transition-colors ${isActive ? "bg-accent text-foreground" : "hover:bg-accent"}`
              }
            >
              {c.name}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSubmit} className="w-48 md:w-64 flex items-center gap-2">
          <Input
            value={q}
            onChange={(e) => {
              const val = e.target.value;
              setQ(val);
              if (debounceRef.current) window.clearTimeout(debounceRef.current);
              debounceRef.current = window.setTimeout(() => {
                navigate(val ? `/?q=${encodeURIComponent(val)}` : "/");
              }, 350);
            }}
            placeholder="Ara..."
            aria-label="Site içi arama"
          />
          <ThemeToggle />
        </form>
      </div>
    </header>
  );
};

export default SiteHeader;

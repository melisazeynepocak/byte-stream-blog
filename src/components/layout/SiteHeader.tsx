import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const SiteHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex items-center justify-between h-16 gap-4">
        <Link to="/" className="font-extrabold text-lg tracking-tight">
          <span className="text-primary">Tekno</span>Blogoji
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <Link to="/admin">
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}
          {!user && (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="hidden md:flex">
                Giriş
              </Button>
            </Link>
          )}
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-2">
            <Link to="/" className="block py-2 px-4 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
              Ana Sayfa
            </Link>
            <Link to="/hakkimizda" className="block py-2 px-4 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
              Hakkımızda
            </Link>
            <Link to="/iletisim" className="block py-2 px-4 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
              İletişim
            </Link>
            {user ? (
              <Link to="/admin" className="block py-2 px-4 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                Admin Panel
              </Link>
            ) : (
              <Link to="/auth" className="block py-2 px-4 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
      setSearchTerm("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Focus the input when modal opens
      const input = document.getElementById("search-input");
      if (input) {
        input.focus();
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Arama</h2>
        </div>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search-input"
              type="text"
              placeholder="Aramak istediğiniz kelimeyi yazın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="w-full" disabled={!searchTerm.trim()}>
            <Search className="h-4 w-4 mr-2" />
            Ara
          </Button>
        </form>
        <div className="text-sm text-muted-foreground mt-4">
          <p>Başlık, alt başlık ve içerik metinlerinde arama yapılır.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

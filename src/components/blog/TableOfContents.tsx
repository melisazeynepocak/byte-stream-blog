import { useEffect, useState } from "react";

interface TableOfContentsProps {
  content: string;
}

export const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    // Simulate heading extraction from content
    // In a real implementation, you'd parse the actual content
    const mockHeadings = [
      { id: "giris", text: "Giriş", level: 2 },
      { id: "ozellikler", text: "Temel Özellikler", level: 2 },
      { id: "performans", text: "Performans Analizi", level: 3 },
      { id: "kamera", text: "Kamera Kalitesi", level: 3 },
      { id: "sonuc", text: "Sonuç ve Değerlendirme", level: 2 },
    ];
    setHeadings(mockHeadings);

    // Add scroll spy functionality
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const tocLink = document.querySelector(`a[href="#${id}"]`);
          if (entry.isIntersecting) {
            document.querySelectorAll('.toc-link').forEach(link => link.classList.remove('active'));
            tocLink?.classList.add('active');
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );

    // Observe headings (simulated)
    mockHeadings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [content]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <aside className="p-4 rounded-lg border bg-card my-6">
      <h4 className="font-semibold mb-3">İçindekiler</h4>
      <nav>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id} style={{ marginLeft: `${(heading.level - 2) * 12}px` }}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className="toc-link text-left text-sm hover:text-primary transition-colors block w-full"
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
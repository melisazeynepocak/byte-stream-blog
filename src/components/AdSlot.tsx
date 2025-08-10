import React, { useEffect, useRef, useState } from "react";

interface AdSlotProps {
  slot: "top" | "inArticle" | "sidebar";
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slot, className }) => {
  const label =
    slot === "top"
      ? "Üst Banner Reklam Alanı"
      : slot === "inArticle"
      ? "İçerik İçi Reklam Alanı"
      : "Yan Menü Reklam Alanı (300×600)";

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timeout: number | undefined;

    const onIntersect: IntersectionObserverCallback = (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !loaded) {
          // Simüle yükleme: gerçek AdSense kodu burada eklenecek
          timeout = window.setTimeout(() => setLoaded(true), 1200);
          obs.disconnect();
        }
      });
    };

    const io = new IntersectionObserver(onIntersect, { rootMargin: "200px" });
    io.observe(el);
    return () => {
      io.disconnect();
      if (timeout) window.clearTimeout(timeout);
    };
  }, [loaded]);

  const base =
    "w-full rounded-lg border border-dashed bg-muted/40 text-muted-foreground flex items-center justify-center ";
  const size =
    slot === "top"
      ? "min-h-[90px] md:min-h-[120px]"
      : slot === "sidebar"
      ? "min-h-[300px] md:min-h-[600px]"
      : "min-h-[160px] md:min-h-[250px]";

  return (
    <aside aria-label={label} className={`${base} ${size} ${className || ""}`}>
      <div ref={containerRef} className="text-center px-4 py-6 w-full">
        {!loaded ? (
          <div className="animate-pulse w-full h-full flex items-center justify-center">
            <div className="h-6 w-48 rounded bg-muted" />
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs opacity-80 mt-1">
              Google AdSense kodunuzu buraya yerleştirin. Alanlar responsive çalışır.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdSlot;

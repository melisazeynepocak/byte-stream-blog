import React from "react";

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
      : "Yan Menü Reklam Alanı";

  return (
    <aside
      aria-label={label}
      className={
        "w-full rounded-lg border border-dashed bg-muted/40 text-muted-foreground flex items-center justify-center " +
        (className || "")
      }
      style={{ minHeight: slot === "top" ? 120 : slot === "sidebar" ? 250 : 180 }}
    >
      <div className="text-center px-4 py-6">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs opacity-80 mt-1">
          Google AdSense kodunuzu buraya yerleştirin. Alanlar responsive çalışır.
        </p>
      </div>
    </aside>
  );
};

export default AdSlot;

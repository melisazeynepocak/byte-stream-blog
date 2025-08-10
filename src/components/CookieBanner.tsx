import { useEffect, useState } from "react";

export const CookieBanner = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(!localStorage.getItem("cookie.consent"));
  }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="container mb-4">
        <div className="rounded-lg border bg-background shadow-lg p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Deneyiminizi iyileştirmek için çerezler kullanıyoruz. Devam ederek <a className="underline" href="/gizlilik-politikasi">Gizlilik</a> ve <a className="underline" href="/cerez-politikasi">Çerez Politikası</a>'nı kabul etmiş olursunuz.
          </p>
          <div className="ml-auto flex gap-2">
            <button onClick={() => { localStorage.setItem("cookie.consent", "accepted"); setOpen(false); }} className="px-3 py-2 rounded bg-primary text-primary-foreground text-sm">Kabul Et</button>
            <button onClick={() => setOpen(false)} className="px-3 py-2 rounded border text-sm">Kapat</button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Seo } from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Seo title="Sayfa Bulunamadı – TeknoBlog" description="Aradığınız sayfa mevcut değil." />
      <main className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2">Oops! Sayfa bulunamadı</p>
          <a href="/" className="inline-block mt-4 px-4 py-2 rounded bg-primary text-primary-foreground">Anasayfaya dön</a>
        </div>
      </main>
    </>
  );
};

export default NotFound;

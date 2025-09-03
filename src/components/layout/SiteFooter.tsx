export const SiteFooter = () => {
  return (
    <footer className="border-t mt-16">
      <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} TeknoBlogoji. Tüm hakları saklıdır.</p>
        <nav className="flex flex-wrap gap-4">
          <a href="/hakkimizda" className="hover:underline">Hakkımızda</a>
          <a href="/iletisim" className="hover:underline">İletişim</a>
          <a href="/gizlilik-politikasi" className="hover:underline">Gizlilik Politikası</a>
          <a href="/cerez-politikasi" className="hover:underline">Çerez Politikası</a>
          <a href="/editorial-politika" className="hover:underline">Editoryal Politika</a>
          <a href="/reklam-affiliate" className="hover:underline">Reklam/Affiliate test</a>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;

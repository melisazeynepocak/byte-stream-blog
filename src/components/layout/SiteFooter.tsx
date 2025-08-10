export const SiteFooter = () => {
  return (
    <footer className="border-t mt-16">
      <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} TeknoBlog. Tüm hakları saklıdır.</p>
        <p>
          Bir teknoloji yayını: Telefonlar, bilgisayarlar, yazılım ve haberler.
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;

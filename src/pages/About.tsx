import { Seo } from "@/components/Seo";

const About = () => {
  return (
    <>
      <Seo title="Hakkımızda – TeknoBlog" description="TeknoBlog hakkında: misyonumuz, vizyonumuz ve ekibimiz." />
      <main className="container py-10 max-w-3xl">
        <header>
          <h1 className="text-3xl font-extrabold">Hakkımızda</h1>
          <p className="text-muted-foreground mt-2">TeknoBlog; teknoloji haberleri, incelemeler ve rehber içerikleri sunan bağımsız bir yayın.</p>
        </header>
        <section className="prose prose-neutral dark:prose-invert mt-6">
          <p>Amacımız, okuyucularımıza tarafsız ve anlaşılır içerikler sunmak; doğru bilgiyi hızlıca ulaştırmaktır.</p>
          <p>Yayın ilkelerimiz doğruluk, şeffaflık ve okuyucu odaklılıktır.</p>
        </section>
      </main>
    </>
  );
};

export default About;

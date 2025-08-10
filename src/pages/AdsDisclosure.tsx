import { Seo } from "@/components/Seo";

const AdsDisclosure = () => (
  <>
    <Seo title="Reklam / Affiliate Açıklaması – TeknoBlog" description="Reklam ve affiliate bağlantıları hakkında bilgilendirme." />
    <main className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-extrabold">Reklam / Affiliate Açıklaması</h1>
      <article className="prose prose-neutral dark:prose-invert mt-6">
        <p>Bazı içeriklerimizde ücretli iş birlikleri ve affiliate bağlantıları yer alabilir. Okuyucu güveni önceliğimizdir.</p>
      </article>
    </main>
  </>
);

export default AdsDisclosure;

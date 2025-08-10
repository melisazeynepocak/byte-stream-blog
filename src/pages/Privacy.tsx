import { Seo } from "@/components/Seo";

const Privacy = () => (
  <>
    <Seo title="Gizlilik Politikası – TeknoBlog" description="Gizlilik ve veri işleme politikamız." />
    <main className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-extrabold">Gizlilik Politikası</h1>
      <article className="prose prose-neutral dark:prose-invert mt-6">
        <p>Kişisel verilerin korunmasına önem veriyoruz. Bu sayfada hangi verileri nasıl işlediğimizi açıklıyoruz.</p>
        <h2>Toplanan Veriler</h2>
        <p>Çerezler, analiz verileri (GA4) ve form gönderimlerinde paylaştığınız bilgiler.</p>
        <h2>Veri Paylaşımı</h2>
        <p>Üçüncü taraflarla yalnızca hizmetin gerektirdiği ölçüde paylaşılır.</p>
      </article>
    </main>
  </>
);

export default Privacy;

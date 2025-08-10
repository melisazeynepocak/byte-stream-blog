import { Seo } from "@/components/Seo";

const Cookies = () => (
  <>
    <Seo title="Çerez Politikası – TeknoBlog" description="Çerez kullanımı ve tercihleri." />
    <main className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-extrabold">Çerez Politikası</h1>
      <article className="prose prose-neutral dark:prose-invert mt-6">
        <p>Site deneyimini iyileştirmek ve analiz için çerezler kullanıyoruz. Tarayıcınızdan çerez tercihlerini yönetebilirsiniz.</p>
      </article>
    </main>
  </>
);

export default Cookies;

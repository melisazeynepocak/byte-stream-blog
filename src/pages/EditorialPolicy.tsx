import { Seo } from "@/components/Seo";

const EditorialPolicy = () => (
  <>
    <Seo title="Editoryal Politika – TeknoBlog" description="Tarafsızlık ve doğruluk ilkelerimiz." />
    <main className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-extrabold">Editoryal Politika</h1>
      <article className="prose prose-neutral dark:prose-invert mt-6">
        <p>İçeriklerimizi tarafsızlık, doğruluk ve şeffaflık ilkeleriyle hazırlarız.</p>
      </article>
    </main>
  </>
);

export default EditorialPolicy;

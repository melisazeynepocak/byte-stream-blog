import { useEffect } from "react";

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
  schema?: object | object[];
}

export const Seo = ({
  title,
  description,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  canonical,
  schema,
}: SeoProps) => {
  useEffect(() => {
    const doc = document;
    doc.title = title.length > 60 ? title.slice(0, 57) + "…" : title;

    const ensure = (name: string, selector: string) => {
      let el = doc.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = doc.createElement("meta");
        if (selector.startsWith('meta[name="')) {
          el.setAttribute("name", name);
        } else if (selector.startsWith('meta[property="')) {
          el.setAttribute("property", name);
        }
        doc.head.appendChild(el);
      }
      return el;
    };

    ensure("description", 'meta[name="description"]')!.setAttribute("content", description);
    ensure("og:title", 'meta[property="og:title"]')!.setAttribute("content", title);
    ensure("og:description", 'meta[property="og:description"]')!.setAttribute("content", description);
    ensure("og:type", 'meta[property="og:type"]')!.setAttribute("content", type);
    ensure("og:url", 'meta[property="og:url"]')!.setAttribute("content", canonical || window.location.href);
    if (image) ensure("og:image", 'meta[property="og:image"]')!.setAttribute("content", image);

    // Twitter Cards
    ensure("twitter:card", 'meta[name="twitter:card"]')!.setAttribute("content", image ? "summary_large_image" : "summary");
    ensure("twitter:title", 'meta[name="twitter:title"]')!.setAttribute("content", title);
    ensure("twitter:description", 'meta[name="twitter:description"]')!.setAttribute("content", description);
    if (image) ensure("twitter:image", 'meta[name="twitter:image"]')!.setAttribute("content", image);
    const twitterSite = localStorage.getItem("seo.twitterSite");
    if (twitterSite) ensure("twitter:site", 'meta[name="twitter:site"]')!.setAttribute("content", twitterSite);

    if (type === "article") {
      if (publishedTime) ensure("article:published_time", 'meta[property="article:published_time"]')!.setAttribute("content", publishedTime);
      if (modifiedTime) ensure("article:modified_time", 'meta[property="article:modified_time"]')!.setAttribute("content", modifiedTime);
    }

    // Canonical
    let link = doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = doc.createElement("link");
      link.rel = "canonical";
      doc.head.appendChild(link);
    }
    link.href = canonical || window.location.href;

    // Google Search Console verification
    const gsc = localStorage.getItem("seo.gscVerification");
    if (gsc) {
      ensure("google-site-verification", 'meta[name="google-site-verification"]')!.setAttribute("content", gsc);
    }

    // JSON-LD
    const scriptId = "seo-jsonld";
    const existing = doc.getElementById(scriptId);
    if (existing) existing.remove();
    if (schema) {
      const script = doc.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      script.text = JSON.stringify(schema);
      doc.head.appendChild(script);
    }
  }, [title, description, image, type, publishedTime, modifiedTime, canonical, schema]);

  return null;
};

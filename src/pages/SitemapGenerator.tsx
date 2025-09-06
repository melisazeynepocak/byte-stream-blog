import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function SitemapGenerator() {
  const [sitemap, setSitemap] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = async () => {
    setLoading(true);
    setError(null);

    const baseUrl = 'https://teknoblogoji.com.tr';
    const urls: Array<{
      loc: string;
      lastmod: string;
      changefreq: string;
      priority: number;
    }> = [];

    try {
      // Ana sayfa
      urls.push({
        loc: `${baseUrl}/`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 1.0
      });

      // Statik sayfalar
      const staticPages = [
        { path: '/hakkimizda', priority: 0.8 },
        { path: '/iletisim', priority: 0.8 },
        { path: '/gizlilik-politikasi', priority: 0.5 },
        { path: '/cerez-politikasi', priority: 0.5 },
        { path: '/editorial-politika', priority: 0.5 },
        { path: '/reklam-affiliate', priority: 0.5 },
        { path: '/rehberler', priority: 0.9 }
      ];

      staticPages.forEach(page => {
        urls.push({
          loc: `${baseUrl}${page.path}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: page.priority
        });
      });

      // Kategorileri getir
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('slug, name, created_at')
        .order('name');

      if (catError) {
        console.error('Categories error:', catError);
      } else if (categories) {
        categories.forEach(category => {
          urls.push({
            loc: `${baseUrl}/kategori/${category.slug}`,
            lastmod: new Date(category.created_at).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.8
          });
        });
      }

      // Yayınlanmış postları getir
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          slug, 
          created_at, 
          updated_at,
          categories:categories!posts_category_id_fkey(slug)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Posts error:', postsError);
      } else if (posts) {
        posts.forEach(post => {
          const categorySlug = post.categories?.slug || 'genel';
          const lastmod = post.updated_at || post.created_at;
          
          urls.push({
            loc: `${baseUrl}/${categorySlug}/${post.slug}`,
            lastmod: new Date(lastmod).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.9
          });
        });
      }

      // Etiket sayfalarını getir
      const { data: tagsData, error: tagsError } = await supabase
        .from('posts')
        .select('tags')
        .eq('status', 'published')
        .not('tags', 'is', null);

      if (!tagsError && tagsData) {
        const uniqueTags = new Set<string>();
        tagsData.forEach(post => {
          if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach((tag: string) => {
              uniqueTags.add(tag);
            });
          }
        });

        uniqueTags.forEach(tag => {
          urls.push({
            loc: `${baseUrl}/etiket/${encodeURIComponent(tag)}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.6
          });
        });
      }

      // XML oluştur
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      setSitemap(xml);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      setError('Sitemap oluşturulurken hata oluştu: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Sitemap oluşturuluyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Hata</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={generateSitemap}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Dinamik Sitemap Generator</h1>
        <div className="flex gap-4 mb-4">
          <button 
            onClick={generateSitemap}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Yenile
          </button>
          <button 
            onClick={downloadSitemap}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            İndir
          </button>
        </div>
        <p className="text-gray-600">
          Toplam URL sayısı: {sitemap.split('<url>').length - 1}
        </p>
      </div>

      <div className="bg-gray-50 border rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">XML Sitemap</h2>
        <pre className="bg-white p-4 rounded border overflow-auto text-sm">
          {sitemap}
        </pre>
      </div>
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Timeout ayarla (25 saniye)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  }, 25000);

  // Sadece GET isteklerini kabul et
  if (req.method !== 'GET') {
    clearTimeout(timeout);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Environment variable'ları kontrol et
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

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

    // Etiket sayfalarını getir (eğer varsa)
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

    // Timeout'u temizle
    clearTimeout(timeout);
    
    // XML response döndür
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800'); // 30 dakika cache
    res.setHeader('X-Robots-Tag', 'noindex'); // Sitemap'in kendisini indexleme
    res.status(200).send(xml);

  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Hata durumunda basit sitemap döndür
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/hakkimizda</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/iletisim</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/rehberler</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/kategori/yazilim</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/kategori/telefon</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/kategori/bilgisayar</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/kategori/yapay-zeka</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    clearTimeout(timeout);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(fallbackXml);
  }
}

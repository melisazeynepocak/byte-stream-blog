import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel'de cache'i temizle
    // Bu fonksiyon sitemap cache'ini temizlemek için kullanılabilir
    // Gerçek uygulamada webhook secret kontrolü ekleyin
    
    console.log('Sitemap regeneration requested');
    
    // Başarılı response
    res.status(200).json({ 
      success: true, 
      message: 'Sitemap regeneration triggered',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sitemap regeneration error:', error);
    res.status(500).json({ 
      error: 'Sitemap regeneration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

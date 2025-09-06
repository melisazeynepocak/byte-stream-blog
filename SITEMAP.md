# Dinamik Sitemap Sistemi

Bu proje artık dinamik sitemap sistemi kullanıyor. Sitemap otomatik olarak güncelleniyor.

## Nasıl Çalışıyor?

### 1. Dinamik Sitemap API
- **URL**: `https://teknoblogoji.com.tr/api/sitemap.xml`
- **Fonksiyon**: Supabase'den tüm yayınlanmış postları, kategorileri ve statik sayfaları çeker
- **Cache**: 1 saat cache süresi
- **Format**: XML sitemap formatında

### 2. Otomatik Güncelleme
- Yeni post eklendiğinde sitemap otomatik güncellenir
- AdminPostEditor'da post kaydedildikten sonra sitemap yenilenir
- API endpoint: `/api/regenerate-sitemap`

### 3. İçerik
Sitemap şunları içerir:
- Ana sayfa (`/`)
- Statik sayfalar (hakkimizda, iletisim, vb.)
- Kategori sayfaları (`/kategori/[slug]`)
- Post sayfaları (`/[category]/[post-slug]`)
- Etiket sayfaları (`/etiket/[tag]`)

## Google Search Console'da Kullanım

1. Google Search Console'a gidin
2. "Site Haritaları" bölümüne gidin
3. Yeni sitemap ekleyin: `https://teknoblogoji.com.tr/api/sitemap.xml`
4. Gönder butonuna tıklayın

## Avantajlar

✅ **Otomatik Güncelleme**: Yeni post eklendiğinde sitemap otomatik güncellenir
✅ **Dinamik İçerik**: Tüm yayınlanmış postlar otomatik dahil edilir
✅ **SEO Optimizasyonu**: Doğru lastmod, changefreq, priority değerleri
✅ **Hata Yönetimi**: Hata durumunda fallback sitemap döndürür
✅ **Cache**: 1 saat cache ile performans optimizasyonu

## Teknik Detaylar

### API Route'ları
- `api/sitemap.xml.ts`: Ana sitemap generator
- `api/regenerate-sitemap.ts`: Cache temizleme (opsiyonel)

### Vercel Konfigürasyonu
- `vercel.json`: API route'ları için özel konfigürasyon
- Function timeout: 30 saniye (sitemap), 10 saniye (regenerate)

### Supabase Entegrasyonu
- Categories tablosundan kategoriler
- Posts tablosundan yayınlanmış postlar
- Tags array'inden etiket sayfaları

## Test Etme

1. Development'da: `http://localhost:8080/api/sitemap.xml`
2. Production'da: `https://teknoblogoji.com.tr/api/sitemap.xml`

## Sorun Giderme

### Sitemap "Getirilemedi" Hatası
- API route'larının doğru deploy edildiğini kontrol edin
- Supabase environment variable'larının doğru olduğunu kontrol edin
- Vercel function log'larını kontrol edin

### Cache Sorunları
- Vercel'de cache otomatik temizlenir
- Manuel temizleme için `/api/regenerate-sitemap` endpoint'ini kullanın

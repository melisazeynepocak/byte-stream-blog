/**
 * Türkçe karakterleri İngilizce karşılıklarına çevirir ve URL-safe slug oluşturur
 */
export function createSlug(input: string): string {
  if (!input) return '';
  
  return input
    .toLowerCase()
    .trim()
    // Türkçe karakterleri değiştir
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    // Özel karakterleri kaldır
    .replace(/[^a-z0-9\s-]/g, '')
    // Birden fazla boşluğu tek boşluğa çevir
    .replace(/\s+/g, ' ')
    // Boşlukları tire ile değiştir
    .replace(/\s/g, '-')
    // Birden fazla tireyi tek tireye çevir
    .replace(/-+/g, '-')
    // Başta ve sonda tire varsa kaldır
    .replace(/^-+|-+$/g, '');
}

/**
 * URL'den gelen slug'ı temizler (URL encoding'i çözer)
 */
export function cleanSlugFromUrl(slug: string): string {
  if (!slug) return '';
  
  return decodeURIComponent(slug)
    .toLowerCase()
    .trim();
}

/**
 * İki slug'ın eşit olup olmadığını kontrol eder
 */
export function compareSlugs(slug1: string, slug2: string): boolean {
  const clean1 = cleanSlugFromUrl(slug1);
  const clean2 = cleanSlugFromUrl(slug2);
  
  return clean1 === clean2;
}

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSlug, cleanSlugFromUrl } from '@/lib/slug';

/**
 * URL'deki boşlukları tire ile değiştirerek doğru URL'ye yönlendirir
 */
export function UrlRedirect() {
  const navigate = useNavigate();
  const { categorySlug, postSlug } = useParams();

  useEffect(() => {
    // Eğer URL'de boşluk varsa, tire ile değiştirip yönlendir
    if (categorySlug && categorySlug.includes(' ')) {
      const cleanCategorySlug = createSlug(categorySlug);
      if (postSlug && postSlug.includes(' ')) {
        const cleanPostSlug = createSlug(postSlug);
        navigate(`/${cleanCategorySlug}/${cleanPostSlug}`, { replace: true });
      } else {
        navigate(`/kategori/${cleanCategorySlug}`, { replace: true });
      }
    } else if (postSlug && postSlug.includes(' ')) {
      const cleanPostSlug = createSlug(postSlug);
      if (categorySlug) {
        navigate(`/${categorySlug}/${cleanPostSlug}`, { replace: true });
      }
    }
  }, [categorySlug, postSlug, navigate]);

  return null;
}

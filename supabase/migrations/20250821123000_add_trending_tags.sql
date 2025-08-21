-- Trending tags (Trend Konular) for homepage, curated by admins
CREATE TABLE IF NOT EXISTS public.trending_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  position INTEGER NOT NULL CHECK (position > 0),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trending_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view trending tags" ON public.trending_tags;
CREATE POLICY "Public can view trending tags" ON public.trending_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage trending tags" ON public.trending_tags;
CREATE POLICY "Admins can manage trending tags" ON public.trending_tags FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');



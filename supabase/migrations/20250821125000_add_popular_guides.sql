-- Popular guides for homepage, can be automatic (most viewed) or manual (admin selected)
CREATE TABLE IF NOT EXISTS public.popular_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL CHECK (mode IN ('automatic', 'manual')) DEFAULT 'automatic',
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  position INTEGER CHECK (position > 0),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- When mode is 'automatic', post_id and position are NULL
  -- When mode is 'manual', post_id and position are required
  CONSTRAINT check_manual_mode_requires_post CHECK (
    (mode = 'automatic' AND post_id IS NULL AND position IS NULL) OR
    (mode = 'manual' AND post_id IS NOT NULL AND position IS NOT NULL)
  )
);

ALTER TABLE public.popular_guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view popular guides" ON public.popular_guides;
CREATE POLICY "Public can view popular guides" ON public.popular_guides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage popular guides" ON public.popular_guides;
CREATE POLICY "Admins can manage popular guides" ON public.popular_guides FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

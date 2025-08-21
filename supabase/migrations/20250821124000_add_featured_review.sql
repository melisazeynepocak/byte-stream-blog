-- Featured review for homepage, single review selected by admin
CREATE TABLE IF NOT EXISTS public.featured_review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id)
);

ALTER TABLE public.featured_review ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view featured review" ON public.featured_review;
CREATE POLICY "Public can view featured review" ON public.featured_review FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage featured review" ON public.featured_review;
CREATE POLICY "Admins can manage featured review" ON public.featured_review FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

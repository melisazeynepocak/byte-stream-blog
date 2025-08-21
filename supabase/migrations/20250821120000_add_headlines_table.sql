-- Create headlines table for curated homepage headlines (Manşet Haberler)
CREATE TABLE IF NOT EXISTS public.headlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id)
);

-- Enable RLS
ALTER TABLE public.headlines ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Public can view headline rows (actual post content still protected by posts RLS)
DROP POLICY IF EXISTS "Public can view headlines" ON public.headlines;
CREATE POLICY "Public can view headlines"
ON public.headlines
FOR SELECT
USING (true);

-- Only admins can manage headlines
DROP POLICY IF EXISTS "Admins can manage headlines" ON public.headlines;
CREATE POLICY "Admins can manage headlines"
ON public.headlines
FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Optional: keep positions dense starting from 1 via helper function (not enforced)


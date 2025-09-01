-- Create post_images table for multiple images in posts
CREATE TABLE public.post_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on post_images table
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_images
CREATE POLICY "Anyone can view post images" ON public.post_images FOR SELECT USING (true);
CREATE POLICY "Users can insert post images for their posts" ON public.post_images FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_images.post_id 
    AND posts.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update post images for their posts" ON public.post_images FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_images.post_id 
    AND posts.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete post images for their posts" ON public.post_images FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_images.post_id 
    AND posts.user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_post_images_post_id ON public.post_images(post_id);
CREATE INDEX idx_post_images_position ON public.post_images(position);

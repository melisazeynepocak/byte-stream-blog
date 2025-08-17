-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  cover_image TEXT,
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  tags TEXT[],
  slug TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'blog-images', 
  'blog-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
);

-- Enable RLS on tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS policies for posts (public read, owner write)
CREATE POLICY "Anyone can view published posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for blog images
CREATE POLICY "Anyone can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their uploaded images" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their uploaded images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert default categories
INSERT INTO public.categories (name, slug) VALUES 
  ('Telefonlar', 'telefonlar'),
  ('Bilgisayarlar', 'bilgisayarlar'),
  ('Tablet', 'tablet'),
  ('Teknoloji', 'teknoloji'),
  ('Yazılım', 'yazilim');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
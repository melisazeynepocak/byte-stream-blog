-- Add Rehberler category
INSERT INTO public.categories (name, slug) VALUES 
('Rehberler', 'rehberler')
ON CONFLICT (slug) DO NOTHING;

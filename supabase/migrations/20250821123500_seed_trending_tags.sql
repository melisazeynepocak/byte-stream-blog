-- Seed default trending tags
INSERT INTO public.trending_tags (label, slug, position, created_by) VALUES 
('yapayzeka', 'yapayzeka', 1, '00000000-0000-0000-0000-000000000000'),
('telefon', 'telefon', 2, '00000000-0000-0000-0000-000000000000'),
('bilgisayar', 'bilgisayar', 3, '00000000-0000-0000-0000-000000000000'),
('tablet', 'tablet', 4, '00000000-0000-0000-0000-000000000000'),
('karşılaştırma', 'karsilastirma', 5, '00000000-0000-0000-0000-000000000000'),
('yazılım', 'yazilim', 6, '00000000-0000-0000-0000-000000000000'),
('laptop', 'laptop', 7, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (slug) DO NOTHING;

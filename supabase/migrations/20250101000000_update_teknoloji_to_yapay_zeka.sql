-- Update "Teknoloji" category to "Yapay Zeka"
UPDATE categories 
SET name = 'Yapay Zeka', slug = 'yapay-zeka' 
WHERE name = 'Teknoloji' OR slug = 'teknoloji';

-- Update any posts that reference the old category
UPDATE posts 
SET category_slug = 'yapay-zeka' 
WHERE category_slug = 'teknoloji';

-- Update any other references in the database
-- (Add more UPDATE statements if there are other tables referencing this category)

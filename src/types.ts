export type Category = {
  id: string;        // uuid
  name: string;      // text
  slug: string;      // text
  created_at: string; // timestamptz
};

export type Post = {
  id: string;           // uuid
  title: string;        // text
  content: string;      // text
  cover_image: string;  // text
  category_id: string;  // uuid (FK to categories)
  user_id: string;      // uuid (FK to profiles)
  created_at: string;   // timestamptz
  updated_at: string;   // timestamptz
};

export type Profile = {
  id: string;       // uuid
  username: string; // text
  avatar_url: string | null; // text (nullable)
  created_at: string;
};
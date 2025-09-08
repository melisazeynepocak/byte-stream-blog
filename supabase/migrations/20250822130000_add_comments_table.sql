-- Create comments table for post comments with moderation
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  name text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ensure helpful index for fetching by post and created_at
create index if not exists idx_comments_post_id_created_at on public.comments (post_id, created_at desc);

-- Enable RLS
alter table public.comments enable row level security;

-- Policy: anyone can insert but only as pending (approved = false)
create policy comments_insert_pending
  on public.comments
  for insert
  to anon, authenticated
  with check (approved = false);

-- Policy: public can read only approved comments
create policy comments_select_approved
  on public.comments
  for select
  to anon, authenticated
  using (approved = true);

-- Policy: authenticated users can update/delete (admin app); adjust if you have roles
create policy comments_update_authenticated
  on public.comments
  for update
  to authenticated
  using (true)
  with check (true);

create policy comments_delete_authenticated
  on public.comments
  for delete
  to authenticated
  using (true);



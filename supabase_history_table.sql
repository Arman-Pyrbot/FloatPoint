-- History table for storing NLP query history per user
create table if not exists history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  query text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_history_user_id on history(user_id);
create index if not exists idx_history_created_at on history(created_at desc);

-- RLS
alter table history enable row level security;

create policy "Users can view their own history" on history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own history" on history
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own history" on history
  for update using (auth.uid() = user_id);

create policy "Users can delete their own history" on history
  for delete using (auth.uid() = user_id);

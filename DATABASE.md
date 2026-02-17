# Free database: Supabase (PostgreSQL)

This app can save the **roster** (employees + shifts) to a free [Supabase](https://supabase.com) database so it’s stored online and can be used from different devices.

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New project**, choose an organization, set project name and password.
3. Wait for the project to be created.

## 2. Create the tables

In the Supabase dashboard: **SQL Editor** → New query. Run this SQL:

```sql
-- Roster: employees
create table if not exists roster_employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Roster: shifts (linked to employees)
create table if not exists roster_shifts (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references roster_employees(id) on delete cascade,
  date date not null,
  start text not null,
  "end" text not null
);

-- Optional: allow anonymous read/write for the anon key (simplest for demo).
-- For production, use Row Level Security (RLS) and auth.
alter table roster_employees enable row level security;
alter table roster_shifts enable row level security;

create policy "Allow all for anon" on roster_employees for all using (true) with check (true);
create policy "Allow all for anon" on roster_shifts for all using (true) with check (true);
```

Run the query. You should see “Success”.

## 3. Get your project URL and anon key

In the dashboard: **Project Settings** (gear) → **API**:

- **Project URL** → copy (e.g. `https://xxxxx.supabase.co`)
- **Project API keys** → **anon public** → copy

## 4. Configure the app

In the project root create a file `.env` (and add it to `.gitignore` if it isn’t already):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your real URL and anon key. Restart the dev server (`npm run dev`).

## 5. How it works

- If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, the app loads and saves the roster to Supabase and keeps a copy in localStorage.
- If they are not set, the app only uses localStorage (no database).

## Other free options

- **Firebase (Firestore)** – [firebase.google.com](https://firebase.google.com) – NoSQL, good free tier.
- **MongoDB Atlas** – [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) – NoSQL, 512 MB free.
- **Neon** – [neon.tech](https://neon.tech) – Serverless PostgreSQL, free tier.

For this app, Supabase is used because it’s PostgreSQL, has a simple JS client, and works from the browser without your own backend.

# CS & Robotics Lab — Recognition System

A gamified behavior + achievement platform for CS/Robotics classes: XP,
levels, a tech-journey progress path, missions, an achievement wall, a
reward store, and a leaderboard — with a separate, login-gated Teacher
Console.

- **Students**: open the site, pick their name from the class list (shared
  classroom device — no login).
- **Teachers**: click "Teacher," sign in, and get the full console
  (recognize behavior, manage missions/badges/rewards, analytics).

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project. Pick any name/region, set a database password (save it somewhere).
2. Once it's ready, open **SQL Editor** → **New query**, paste in the contents of `supabase/schema.sql` from this project, and run it. This creates the single data table the app uses.
3. Open **Project Settings → API**. You'll need two values from here in step 3 below:
   - **Project URL**
   - **anon / public key**

## 2. Create teacher login(s)

1. In Supabase, go to **Authentication → Users → Add user**.
2. Enter an email and password for each teacher who should have console access. That's it — no separate "teachers table," any user you create here can sign in to the Teacher Console.

## 3. Configure the project locally

```bash
cd classroom-rewards-app
cp .env.example .env
```

Open `.env` and paste in your Project URL and anon key from step 1:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Then install and run it locally to check everything works:

```bash
npm install
npm run dev
```

Visit the local URL it prints (usually `http://localhost:5173`). Try the
Student view, then click "Teacher" and sign in with the account you made in
step 2.

## 4. Deploy on Vercel

1. Push this project folder to a new GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import that repo.
3. In the "Environment Variables" section, add the same two values from your `.env` file (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Click **Deploy**. You'll get a live URL like `your-class.vercel.app` — that's what you share with your students and put on the classroom computer.

---

## How the data model works

Everything (students, points, badges, missions, rewards, notes...) lives in
a single JSON blob in one Supabase table (`classroom_state`), the same
shape the in-chat prototype used. This keeps the app simple to run and
modify. Two honest trade-offs worth knowing about:

- **No per-student login.** Any device that can open the site can act as
  any student (choose their name, redeem their rewards, submit their
  reflection). This matches a shared classroom-computer/kiosk setup. If you
  later want individual student accounts, you'd add Supabase Auth for
  students too and split the state into proper per-student rows.
- **Database writes aren't locked to teachers.** The Teacher Console *UI* is
  gated behind login, but the database itself currently accepts writes from
  anyone with the URL (documented in `supabase/schema.sql`). For a
  single-classroom tool this is a reasonable trade-off, but if you want the
  database itself to reject non-teacher writes, split `classroom_state`
  into separate tables per feature and restrict `INSERT`/`UPDATE` policies
  to `auth.role() = 'authenticated'`.

## Editing the app

All UI and logic lives in `src/App.jsx`. It's the same component structure
as the original prototype — students/behaviors/badges/rewards are defined
as constants near the top of the file if you want to customize the
starting data before first deploy (after that, everything is edited live
through the Teacher Console instead).

# ProjectKart

ProjectKart is a Vite + React + TypeScript single page app that showcases ready-made projects and offers an admin area to manage them. It uses Supabase for the database, auth, and storage. The project includes features such as price / price range for projects, dynamic logos, and a modern UI built with Tailwind CSS and shadcn/ui components.

This README explains how to get the project running locally, how to build and deploy (Vercel), and how to apply Supabase migrations.

---

## Quick links
- Repo root: `get-proj`
- App entry: `src/App.tsx`
- Browse page: `src/pages/BrowseProjects.tsx`
- Home/Portfolio page: `src/pages/Portfolio.tsx`
- Supabase migrations: `supabase/migrations/`
- Vercel config: `vercel.json` (SPA rewrites)

---

## Requirements
- Node.js 18+ (recommended)
- npm (or bun/pnpm as you prefer)
- Supabase project (for DB + Auth)
- (Optional) Supabase CLI if you want to apply migrations locally

---

## Local setup
1. Install dependencies

PowerShell:

```powershell
npm install
```

2. Copy environment variables

Create a `.env` file in the project root (this repo already lists `.env` in `.gitignore`). At minimum provide:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Replace with your Supabase values.

3. Start dev server

```powershell
npm run dev
```

Open the URL printed by Vite (default localhost:5173 or the host/port configured in `vite.config.ts`).

---

## Build

```powershell
npm run build
```

Preview the production build locally:

```powershell
npm run preview
```

---

## Deploy to Vercel
This project is configured as an SPA. There is a `vercel.json` file that rewrites all routes to `index.html` (see the file in the repository roots). Example deployment steps:

1. Push your branch to GitHub (or connect repository to Vercel)
2. In Vercel, set the project build command: `npm run build`
3. Set output directory to `dist`
4. Add environment variables in Vercel (same as your local `.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

Notes:
- `vercel.json` contains SPA rewrites to route all requests to `index.html`.

---

## Supabase migrations
Migrations are stored in `supabase/migrations/`. There are migrations that add pricing columns (price, min_price, max_price), display_order, and other schema updates.

To apply migrations you can either:

- Use the Supabase Dashboard → SQL Editor and run the SQL file contents manually, or
- Use the Supabase CLI and `supabase db push` / `supabase migration` commands (recommended for automated workflows).

Important: a migration was added to optimize an RLS policy: `supabase/migrations/20251106120000_optimize_rls_policy.sql`.
It replaces `auth.uid()` usage in a policy with `(select auth.uid())` to avoid per-row re-evaluation and improve query performance. Ensure this migration is applied to your Supabase project.

---

## Security & Auth
- The app uses Supabase Auth. To enable password breach detection (HaveIBeenPwned) enable the setting in the Supabase dashboard under Authentication → Settings (or via `supabase/config.toml`).
- `.env` is ignored by `.gitignore` to avoid leaking secrets. Double-check you don't commit keys to git.

---

## Notable UI & Features
- Currency uses Indian Rupees (INR) formatting via `Intl.NumberFormat('en-IN', { currency: 'INR' })`.
- Projects support a price range (min_price, max_price). Display logic shows `From ₹X` or `₹X - ₹Y` as appropriate.
- Project cards and Browse page were updated for consistent styling: white background, compact cards with soft shadows, etc.
- Navbar, hero buttons, and logos are tailored to match the Portfolio / Featured section.

---

## Common tasks
- Run linting:

```powershell
npm run lint
```

- Run tests: none included (add tests as needed)

- Add a migration: create a SQL file in `supabase/migrations/` and follow naming convention (timestamp + short-name). Then apply via Supabase CLI or Dashboard.

---

## Troubleshooting
- If pages 404 after deploy, ensure Vercel `vercel.json` rewrite is present (routes all to `index.html`).
- If Supabase queries are slow at scale, check RLS policies for functions like `auth.uid()` being called per-row; prefer `(select auth.uid())` in policy expressions.

---

## Contributing
Contributions welcome. Please open issues or PRs.

---

## License
MIT (or change to your preferred license)

---

## Maintainers
- Project owner: `Arifk-commit` (repository owner)

---

If you'd like, I can also add a small `README` badge, or generate a `docs/` folder with usage examples and a runbook for deployment. Just tell me what to include next.

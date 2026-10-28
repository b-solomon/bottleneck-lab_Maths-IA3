# Bottleneck Lab

**Find the Bottleneck. Understand the Mathematics. Improve Performance.**

🌐 **Live Website:** [https://bottleneck-lab-maths-ia-3.vercel.app/](https://bottleneck-lab-maths-ia-3.vercel.app/)

An interactive statistical analysis platform that uses Pearson correlation and Spearman rank correlation to study system performance, explore mathematical relationships, and identify components that deserve further investigation.

**Project Type:** Mathematics Microproject  
**Institution:** Karunya Institute of Technology and Sciences

---

## Prerequisites

| Requirement | Minimum version |
|---|---|
| Node.js | 18.x or later |
| npm | 9.x or later |

Install Node.js from https://nodejs.org/ (choose LTS).

---

## Quick Start (Demo Mode — No backend required)

```bash
# 1. Go to the project folder
cd "maths ia3/bottleneck-lab"

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Start the development server
npm run dev
```

Open http://localhost:5173 in your browser.

> **Demo mode** is automatically active when Supabase credentials are absent.
> All mathematical calculations, Formula in Action, Presentation Mode, and CSV import/export
> work fully in demo mode. Authentication and database persistence require Supabase configuration (see below).

---

## Full Setup with Supabase (Authentication + Database)

### Step 1 — Create a Supabase project

1. Go to https://supabase.com and create a free account.
2. Create a new project. Note the **Project URL** and **anon/public key** from Settings → API.

### Step 2 — Apply the database schema

1. In Supabase, open **SQL Editor**.
2. Paste and run the contents of `supabase/migrations/001_initial_schema.sql`.
3. This creates `profiles`, `datasets`, `dataset_observations`, and `analysis_runs` tables with Row Level Security enabled.

### Step 3 — Configure authentication

1. In Supabase, go to **Authentication → Settings**.
2. Under **Site URL**, enter `http://localhost:5173` (development) or your production URL.
3. Under **Redirect URLs**, add `http://localhost:5173`.
4. Email confirmations can be disabled for development (Authentication → Settings → Disable email confirmations).

### Step 4 — Configure the environment

Edit `.env` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### Step 5 — Run the app

```bash
npm run dev
```

The demo mode banner will disappear once valid Supabase credentials are detected.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at http://localhost:5173 |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests (Pearson, Spearman, CSV) |
| `npm run lint` | Run ESLint |

---

## Running the Tests

```bash
npm run test
```

Tests cover:
- Pearson correlation: perfect positive/negative, near-zero, zero variance, insufficient data, known result
- Spearman: tied ranks, average ranks, Pearson-on-ranks, rank differences
- CSV: import validation, missing values, out-of-range warnings, export/re-import round-trip

---

## Application Pages

| Route | Page |
|---|---|
| `/` | Public landing page |
| `/login` | Sign in |
| `/signup` | Create account |
| `/forgot-password` | Password reset |
| `/app/dashboard` | Dashboard |
| `/app/dataset` | Dataset management |
| `/app/pearson` | Pearson analysis |
| `/app/spearman` | Spearman analysis |
| `/app/formula` | Formula in Action (step-by-step) |
| `/app/heatmap` | Correlation heatmap |
| `/app/bottleneck` | Bottleneck report |
| `/app/solve` | Solve a problem (print-ready) |
| `/app/guide` | Mathematical guide |
| `/app/about` | About / Case Study |
| `/app/profile` | User profile |
| `/presentation` | Presentation mode (projector-ready) |

---

## Project Structure

```
src/
  __tests__/     Unit tests (Pearson, Spearman, CSV)
  components/
    formula/     KaTeX formula rendering
    layout/      AppLayout, sidebar
    ui/          Button, Input, Card, Badge, Alert, PasswordStrength, DemoVerification
  data/          Sample dataset, metric metadata
  engine/        pearson.ts, spearman.ts, bottleneck.ts (pure math, no React)
  hooks/         useAuth.ts, useDataset.ts
  lib/           supabase.ts, csv.ts, interpretation.ts
  pages/         All 16 application pages
  types/         TypeScript interfaces
supabase/
  migrations/    001_initial_schema.sql
```

---

## CSV Import Format

Required columns: `label`, `responseTime`

Optional columns: `timestamp`, `cpu`, `memory`, `disk`, `network`, `queueLength`, `throughput`

Example:
```csv
label,timestamp,cpu,memory,disk,network,responseTime,queueLength,throughput
Obs1,2024-03-01T09:00:00Z,22,45,18,12,142,2,85
Obs2,2024-03-01T09:05:00Z,34,48,22,15,165,3,90
```

- Missing values: leave the cell empty or use `N/A` or `-`.
- Utilization values outside 0–100% generate warnings but are not rejected.
- Rows missing `responseTime` are skipped with a warning.

---

## Honest Limitations

- Correlation measures **statistical association**, not causation.
- The demo dataset is **synthetically generated** — not real system measurements.
- Statistical significance testing is not implemented.
- With small datasets (< 30 observations), high |r| values can occur by chance.
- Temporal dependence between consecutive measurements may violate independence assumptions.
- Confirming a bottleneck requires profiling, controlled testing, and domain analysis.

---

## Security Notes

- Passwords are managed by Supabase Auth — never stored in the application database.
- Row Level Security policies ensure users can only access their own data.
- The CAPTCHA in demo mode (arithmetic question) is NOT production security. Configure Cloudflare Turnstile for production.
- Never commit `.env` — it is listed in `.gitignore`.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Charts | Recharts |
| Math rendering | KaTeX |
| Password strength | zxcvbn |
| Backend / Auth | Supabase |
| Database | Supabase PostgreSQL with RLS |

---

## Academic Honesty Statement

Results produced from the demo dataset are based on **simulated data** generated for educational demonstration. They do not represent measurements from a real system. Any student presenting these results should explicitly state this. The mathematical calculations (Pearson r, Spearman ρ, rank assignment, tied-rank handling) are implemented correctly and produce accurate results from any dataset — simulated or measured.

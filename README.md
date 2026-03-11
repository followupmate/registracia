# 🏆 Športový Deň 2026 — Registračná Appka

Registračná webová aplikácia pre firemný športový deň. Next.js + Supabase + Vercel.

## Funkcie

- **Registračný formulár** — meno, email, výber disciplín a turnajov
- **Duplikátna kontrola** — detekcia existujúceho emailu s možnosťou aktualizácie
- **Potvrdenie pred odoslaním** — summary vybraných aktivít
- **Admin panel** (PIN chránený) — štatistiky, progress bary, vyhľadávanie, triedenie, CSV export
- **Dark/Light mode** — toggle v headeri
- **Mobile optimalizácia** — responsive grid, kompaktný layout

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL databáza)
- **Tailwind CSS**
- **Vercel** (hosting)

## Setup

### 1. Supabase

1. Vytvor nový projekt na [supabase.com](https://supabase.com)
2. Otvor **SQL Editor** a spusti obsah `supabase/setup.sql`
3. Poznač si `Project URL` a `anon public` API key (Settings > API)

### 2. Lokálny vývoj

```bash
git clone <repo-url>
cd sportovy-den-2026
npm install

# Vytvor .env.local
cp .env.example .env.local
# Vyplň NEXT_PUBLIC_SUPABASE_URL a NEXT_PUBLIC_SUPABASE_ANON_KEY

npm run dev
```

### 3. Deploy na Vercel

1. Push repo na GitHub
2. Importuj projekt vo [vercel.com](https://vercel.com)
3. Nastav Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PIN` (default: 6702)
4. Deploy!

## Zdieľanie

Po deployi dostaneš URL (napr. `sportovy-den.vercel.app`). Tento link pošli účastníkom.

Admin panel: `<url>#admin` → zadaj PIN.

## CSV Export

Admin panel → 📥 CSV — stiahne všetky registrácie s BOM pre správnu diakritiku v Exceli.

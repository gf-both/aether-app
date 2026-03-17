# GOLEM

The world's most complete self-knowledge platform. 21+ esoteric and psychological frameworks — astrology, Human Design, Gene Keys, Kabbalah, Mayan calendar, numerology, and more — in one unified interface.

## Stack

- **Frontend**: React + Vite + Tailwind (via CSS vars) + Zustand
- **Backend/DB/Auth**: Supabase (Postgres + RLS + Edge Functions)
- **AI**: Anthropic Claude (backend-proxied)
- **Payments**: Stripe (coming)
- **Deploy**: Vercel

## Local Setup

```bash
npm install
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Environment Variables

```
VITE_SUPABASE_URL=          # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=     # Supabase anon/public key
VITE_GOOGLE_PLACES_API_KEY= # Optional: enables birth city autocomplete
```

AI calls are backend-proxied via Supabase Edge Functions. No AI provider keys in the frontend.

## Architecture

```
src/
  engines/     # Symbolic calculation engines (the core IP)
  components/  # UI components (canvas, details, practitioner, overlays)
  pages/       # Product surfaces
  hooks/       # Shared React hooks
  lib/         # Supabase client, auth, AI proxy
  store/       # Zustand global state
  utils/       # Shared utilities
supabase/
  migrations/  # DB schema + RLS policies
```

## Current Status

**Alpha** — The product vision is complete. Core engines are production-quality. UI surfaces are functional. Some practitioner/payment features are in demo mode pending backend completion.

## Known Demo Features

These surfaces use placeholder data and are not yet production-backed:
- AI Guide chat (backend proxy ready, responses pending model integration)
- Practitioner session recording
- Stripe payments
- WhatsApp integration
- Client portal (uses sample data)

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

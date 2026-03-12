# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LocalHero Partners is the partner-facing web dashboard for managing events in the LocalHero ecosystem. Partners (event organizers) use this portal to create and manage sporting events, plans, registrations, influencers, missions, form fields, leaderboards, and view financial stats.

## Ecosystem Context

- **localhero-api** — CodeIgniter 4 (PHP) backend with JWT authentication. Partner endpoints live under `/api/v1/partner/*` and require a `partner` role JWT. Response format: `{ status, message, data }`.
- **localhero-app** — Expo/React Native mobile app where users discover events, register, log activities, and compete.
- **localhero-lp** — Next.js landing page site.
- **localhero-partners** — This repo. Partner management dashboard (web).

## Tech Stack

- **Build:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/vite` plugin)
- **Routing:** React Router DOM (BrowserRouter)
- **Icons:** Lucide React
- **Language:** All UI text in Brazilian Portuguese (pt-BR)

## Commands

- `npm run dev` — Dev server (Vite)
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — ESLint
- `npx tsc --noEmit` — Type check

## Architecture

- `src/lib/api.ts` — HTTP client with JWT auth, auto token refresh, and error handling
- `src/contexts/AuthContext.tsx` — Auth state (user, login, logout) via React Context
- `src/services/events.ts` — All partner API calls (events, plans, form fields, influencers, registrations, missions, stats, leaderboard)
- `src/layouts/DashboardLayout.tsx` — Authenticated layout with sidebar + outlet
- `src/pages/` — Route pages (Login, Dashboard, Events, EventForm, EventDetail)
- `src/components/` — Reusable UI components
- Path alias: `@/` maps to `src/`

## Design Tokens

- Primary dark: `#07202f`
- Primary dark hover: `#0a2d40`
- Accent orange: `#f87c29`
- Blue: `#1688cd`

## API Integration

Partners authenticate via JWT (Bearer token). The API base is configurable via environment variable.

### Key API Endpoints (all under `/api/v1/partner`)

| Resource | Endpoints |
|---|---|
| Events | CRUD + publish/cancel/complete status transitions |
| Plans | CRUD per event (max 3 per event) |
| Form Fields | CRUD per event (types: text, number, select, checkbox, date, email, phone) |
| Influencers | CRUD per event (tracking referral registrations) |
| Registrations | List per event with filters (status, payment_status) |
| Stats | Aggregate financial and registration metrics per event |
| Leaderboard | Ranked participants by XP/distance/duration |
| Missions | CRUD per event (types: daily, weekly, event; goals: distance, duration, calories, activities, streak) |

### Event Status Flow
`draft` → `published` → `active` → `completed` (can be `cancelled` from any state)

### Registration & Payment Status
- Registration: pending, confirmed, cancelled, refunded
- Payment: free, pending, paid, failed, refunded

### Financial Model
Each partner has a `partner_fee_rate` (0-1). On paid registrations, `platform_fee` and `partner_amount` are calculated and tracked.

## Important Conventions

- **No git commands** — Never run git commands in this project.
- **Payment gateway fields** format: `[{"name": "secret_key", "type": "text", "label": "Secret key"}, ...]` — array of objects, not nested objects.
- Event types: `digital` or `physical` (physical events include lat/lng and geofencing radius).
- Anti-cheat rules stored as JSON in `anticheat_rules` field.
- All tables use soft deletes (`deleted_at`).
- Partner authorization: partners can only manage their own events (enforced by API via `partner_id`).

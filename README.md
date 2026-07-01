# Guildpay

A KYB-gated neobank for gaming and esports guilds, built on [Dakota](https://dakota.xyz)'s
real sandbox rails. A guild completes KYB, receives sponsor and prize funds into a treasury,
holds USD and USDC, and pays out winnings to players — every money movement settles on
actual Dakota rails, not a mock.

The guild is a Dakota **business customer**; players are **payout recipients**.

## Features

- **KYB-gated onboarding** — a guild signs up with its business details and KYB is driven to `active`.
- **KYB-gated login** — sign-in is rejected until the guild's KYB is `active`.
- **Deposit** — simulate a sponsor/prize deposit over a USD ACH on-ramp that settles to USDC in the treasury.
- **Treasury balance** — combined USD value + USDC, with a live activity feed.
- **Player payout** — a one-off USDC → USD ACH transfer that settles to `completed`, reconciled automatically.
- **Compliance gate** — an in-line amount-threshold policy on payouts (flag over $1,000, block over $10,000).

## Tech stack

- **Next.js 16** (App Router, React Server Components) · **React 19** · **TypeScript**
- **Tailwind v4** (CSS-first) · Hugeicons · `clsx` + `tailwind-merge`
- **[@dakota-xyz/ts-sdk](https://github.com/dakota-xyz/dakota-ts-sdk)** — server-only integration
- **iron-session** — encrypted cookie auth
- **better-sqlite3** — guild ↔ Dakota customer mapping + a ledger
- **zod** validation · **bcryptjs** password hashing
- **Vitest** — unit tests

## Architecture

All Dakota calls happen **server-side** behind a thin `lib/dakota/*` layer with a
dependency-injected client (so each function is unit-testable with a fake). The API key
never reaches the browser. Route handlers validate input, enforce session/KYB guards, and
delegate to the integration layer.

Money truth lives in Dakota, mirrored into a local **ledger** — the treasury balance is
`settled deposits − settled payouts`. Pending payouts are reconciled against Dakota on every
treasury/dashboard load, so the activity feed self-heals after settlement.

```
app/            App Router pages (onboard, login, dashboard, deposit, payout) + API routes
components/     UI primitives (BentoCard, Button, Input, AuthShell, StatusPill, …) + chrome
lib/dakota/     Dakota integration — onboarding, treasury, payouts (server-only, DI client)
lib/db/         better-sqlite3 — guilds repo + ledger
lib/auth/       iron-session sessions + KYB guards
scripts/e2e.ts  Live end-to-end verification against the sandbox
tests/          Vitest unit tests
```

## Running it

### 1. Prerequisites

- Node.js 20+
- A **Dakota sandbox API key** — sign up at [dakota.xyz/agentic-build](https://dakota.xyz/agentic-build),
  then create one in the sandbox dashboard under **API Keys**.

### 2. Environment

Copy the example and fill it in:

```bash
cp .env.example .env.local
```

| Variable         | Required | Description                                                 |
| ---------------- | -------- | ----------------------------------------------------------- |
| `DAKOTA_API_KEY` | yes      | Your Dakota **sandbox** key (never exposed to the browser). |
| `SESSION_SECRET` | yes      | ≥ 32-char secret for iron-session cookies.                  |
| `DATABASE_PATH`  | no       | SQLite path (defaults to `./guildpay.db`).                  |

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Install & run

```bash
npm install
npm run dev          # http://localhost:3000
```

Then: onboard a guild (KYB → active) → log in → deposit → watch the balance → pay a player
and watch the payout reach `completed`.

## Tests

```bash
npm test             # unit tests (Vitest)
npm run build        # production build + type-check
```

### Live end-to-end (real sandbox)

Drives onboarding → KYB active → deposit settled → payout completed through the integration
layer against the live sandbox. Requires `DAKOTA_API_KEY` in `.env.local`:

```bash
npm run e2e
```

---

Built agentically on Dakota's sandbox rails.

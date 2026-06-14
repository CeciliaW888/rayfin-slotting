# Architecture & Hosting

The Slotting Digital Twin is a React + React Three Fiber frontend that can run
against **three different backends**, selected by how you start it. The *same UI
code* runs in all three — only the data/auth layer changes.

## The three run modes

| Mode | Command | Backend | Auth | Data persistence | Infra needed |
|---|---|---|---|---|---|
| **Fabric (production)** | `npm run dev` / `npm run up` | Rayfin in a Microsoft **Fabric** workspace | Fabric brokered (embedded, no login page) | Persisted in Fabric | A Fabric workspace with Rayfin enabled |
| **Docker local dev** | `npm run dev:local` | Rayfin webservice + SQL Server in **local Docker** | Email/password | Persisted in a local SQL volume | Docker Desktop |
| **Static demo (no backend)** | `npm run build:demo` → host `dist/` | **None** — all data in-memory | Bypassed (`VITE_DEMO_MODE`) | **Not persisted** (resets on refresh) | Any static host (GitHub Pages, etc.) |

### How the mode is chosen (in code)
- `src/services/bootstrap.ts` reads `VITE_RAYFIN_API_URL`. If the host is
  `localhost` → email/password auth; otherwise → Fabric brokered auth.
- `VITE_DEMO_MODE=true` short-circuits everything: `src/services/slotting.ts`
  serves an in-memory dataset and `AuthGuard` skips the login page.
- `rayfin/data/*.ts` (the `Sku` / `Slot` entities) define the persisted schema
  used by the two real-backend modes.

## Tradeoffs

**Fabric (production)** — the real target. Persistent, shared, brokered auth, and
positioned for real-time and integration with the wider Microsoft data stack.
Cost: requires a Fabric workspace with Rayfin; not available to everyone.

**Docker local dev** — a full, real backend on your own machine. Persistent and
offline-capable, good for developing against the actual data layer. Cost: needs
Docker Desktop; the `docker-local-dev` path is experimental and heavier to spin
up (SQL Server container, migrations).

**Static demo** — zero backend, zero infra, instant to share as a URL. Ideal for
**presentations and evaluation**. Cost: nothing persists (re-slotting, imports
reset on refresh) and there's no multi-user/shared state — it's a single-player
sandbox seeded with realistic data.

## Which to use when
- **Show it to someone / present at work** → static demo (a URL, nothing to install).
- **Develop against a real backend offline** → Docker local dev.
- **Production / shared persistent DC** → Fabric.

## Hosting the static demo
`npm run build:demo` produces a self-contained `dist/` (the demo flag is baked
in at build time). Host it on any static host. **GitHub Pages requires a public
repo on the free plan**; private-repo hosting needs GitHub Pro or a host like
Cloudflare Pages / Netlify / Vercel / Azure Static Web Apps. A static host
**cannot** run the Rayfin backend — that's Fabric or Docker only.

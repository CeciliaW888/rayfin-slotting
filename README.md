# Slotting Twin

A 3D digital twin of a distribution centre (DC) for diagnosing and improving product placement (slotting). Built on [Rayfin](https://github.com/microsoft/rayfin) with a React + React Three Fiber frontend.

> **Experimental Rayfin features.** This app uses username/password authentication and Docker local hosting (`rayfin dev`). Both are experimental and APIs may change.

## What it does

- **3D DC view** — explore aisles, bays, and levels in an interactive warehouse scene
- **Slotting KPIs** — travel cost, health score, golden-zone compliance, and worst-slotted SKUs
- **Colour modes** — ABC class, pick density, and golden-zone views
- **What-if simulation** — preview an optimised layout before applying it
- **CSV import** — rebuild the DC from your own SKU data (`samples/skus.example.csv`)

Metrics and optimisation run **client-side** for transparency and fast iteration on demo-sized datasets. See [docs/adr/](docs/adr/) for design decisions.

Domain terminology is defined in [CONTEXT.md](CONTEXT.md).

## Getting started

**Prerequisites:** Node.js, Docker Desktop (for local backend)

```bash
npm install

# Start the local Docker backend and dev server
npm run dev:local

# Apply database migrations (first time only)
npm run rayfin:db
```

Open [http://localhost:5173](http://localhost:5173), create an account with any email/password, and the shared DC seeds on first load.

## Development modes

| Command | Description |
|---------|-------------|
| `npm run dev:local` | Docker backend + Vite (recommended for offline work) |
| `npm run dev` | Deploy to Fabric + Vite against cloud backend |
| `npm run up` | Deploy to Fabric only |
| `npm run rayfin:db` | Apply database migrations (local Docker) |
| `npm run dev:local:stop` | Stop containers (keeps data) |
| `npm run dev:local:down` | Remove containers (keeps volumes) |
| `npm run dev:local:purge` | Purge containers and volumes |
| `npm run build` | Production build |
| `npm run test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |

`npm run rayfin:dev -- status` passes extra options through to `rayfin dev`.

Local Docker requires `RAYFIN_FEATURE_FLAGS=docker-local-dev` and `RAYFIN_WEBSERVICE_IMAGE_NAME=ghcr.io/microsoft/rayfin/webservice:latest` — the npm scripts set these automatically.

## Project structure

```text
├── rayfin/
│   ├── rayfin.yml          # Rayfin service config (auth, data, static hosting)
│   └── data/
│       ├── Slot.ts         # Storage position entity
│       ├── Sku.ts          # Product entity (pick rate)
│       └── schema.ts       # Typed client schema export
├── src/
│   ├── pages/HomePage.tsx  # Main twin UI (3D view + side panel)
│   ├── scene/              # React Three Fiber warehouse renderer
│   ├── slotting/           # Metrics, optimisation, CSV import, seed data
│   ├── hooks/useSlotting.ts
│   ├── components/         # KPIs, simulation, import, view controls
│   └── services/           # Rayfin client + auth bootstrap
├── samples/                # Example CSV for import
├── docs/adr/               # Architecture decision records
└── CONTEXT.md              # Domain language glossary
```

## Authentication

Defaults to **username/password** — no Fabric workspace required.

To use **Fabric brokered auth**, set:

```env
VITE_FABRIC_WORKSPACE_ID=...
VITE_FABRIC_ITEM_ID=...
VITE_FABRIC_PORTAL_URL=...
VITE_RAYFIN_PUBLISHABLE_KEY=...
```

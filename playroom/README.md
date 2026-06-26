# Relay Playroom

The interactive demo for Relay — a faithful, IP-safe slice of the studio operating layer, in the Onyx brand aesthetic. Runs entirely client-side; no backend, no database, no real data.

> Built with Next.js (static export). See [PLAN.md](PLAN.md) for the full Grand Slam demo design.

## What it does
- **Tri-pane shell** (rail · sidebar · top bar) in the Onyx/clay brand, light + dark.
- **Autonomous console** — type any client request in plain language; the **Lane Protocol engine** (`lib/lane.ts`, a direct port of `rules.md`) sorts it 🟢 CLEAR / 🟡 HOLD / 🔴 ESCALATE and completes it live.
- **The board is the files** — open any card and flip to the `File ·md` tab to see the request as the canonical markdown Relay and the team both edit.
- **Cockpit · Activity · The Brain** — what needs you, what Relay did, and the 45-file ICM system underneath.
- **Live mode** — click **Connect key →** and paste an Anthropic API key to watch Relay *write* the deliverables live (the key stays in your browser; calls go direct via the browser-access header). Without a key, the baked engine runs everything offline.
- **Guided tour** (the 7-beat experience) and **⌘K** command palette.

## Run it
```bash
npm install
npm run dev        # http://localhost:3000
```

## Build the static demo
```bash
npm run build      # outputs ./out — deployable to Vercel static, GitHub Pages, or any host
```

## Notes
- Requires Node 20–24. (Built on Next 16 / React 19.)
- Demo data is two fabricated clients (Northwind, Acme) in `lib/studio.ts`. No real studio data ships here.
- Fonts (DM Sans / DM Mono) are self-hosted via `next/font` — no runtime CDN dependency.

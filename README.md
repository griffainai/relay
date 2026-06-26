# Relay

**Every tool you've tried organizes your work and hands it back to you. Relay finishes it.**

> ▶ **Try the live demo:** **https://relay-playroom.vercel.app** — type a client request, hit *Run tasks*, flip any card to its markdown file, and use *View as* to see the access model. No signup.

Relay is a folder-based specialist for a small digital studio. Clients drop requests in plain language, your team runs every account from one shared board, and an AI connected to the same files **completes the routine work autonomously** — does it, writes the completion note — and escalates only the 20% that needs a human's judgment.

It's built with [Interpretable Context Methodology](../../../README.md): the agent is a folder, and the studio it runs is a folder. The path through the folders *is* the logic.

---

## Who it's for
A 2–5 person studio (web, content, branding) juggling several client accounts at once — drowning in small requests, losing work between teammates, and spending senior hours on copy tweaks that don't need them.

## Why it's different (the 30-second version)

| | A task tool (Asana, Linear, Notion) | **Relay** |
|---|---|---|
| Requests | You translate them into tickets | Clients write plainly; Relay structures them |
| The work | It tracks the work | It **completes** the work |
| The AI | Summarizes, suggests | Does the task, writes the note |
| Source of truth | A database you rent | **Files you own** — survives the app |
| Trust | — | Completes what's safe, **escalates what isn't** |

The thing that makes a client owner trust it (it knows what *not* to touch) is the same thing that makes the methodology clean: a folder, a routing map, a refusal list.

---

## The folder map

```
relay/
├── brief.md              ← the client brief (start here)
├── README.md             ← you are here
│
├── CLAUDE.md             ← Layer 1: the map + routing table (always loaded)
├── identity.md           ← who Relay is
├── rules.md              ← the Lane Protocol + refusal list
├── examples.md           ← annotated runs (the showpiece)
├── anti-examples.md      ← what it must never do
├── working-theory.md     ← what Relay has learned about THIS studio
│
├── rooms/                ← Layer 2: CONTEXT per stage of work
│   ├── intake/ · delivery/ · escalations/ · standup/
├── skills/               ← Layer 3: capabilities, loaded only when needed
│   ├── copy-edit/ · content-update/ · page-change/ · seo-meta/ · status-digest/
├── reference/            ← tactical knowledge
│   ├── lane-protocol.md · playbook.md · request-format.md
│   ├── folder-map.md · voice-and-tone.md
│   ├── completion-note-template.md · escalation-note-template.md
├── patterns/             ← named operator moves
├── sessions/             ← longitudinal memory of past runs
├── tests/                ← 10 behavior tests with a pass bar
│
└── studio/               ← THE DATA Relay operates on (also an ICM folder)
    ├── STATE.md          ← the whole board
    ├── team/people.md
    └── clients/
        ├── northwind/    ← card · CONTEXT · STATE · requests/ · deliverables/
        └── acme-studio/  ← card · CONTEXT · STATE · requests/ · deliverables/
```

## How the three layers work (ICM)
- **Layer 1 — the Map** (`CLAUDE.md`): always loaded, holds only directions. One screen.
- **Layer 2 — the Rooms** (`rooms/*/CONTEXT.md`): loaded when you enter a stage of work.
- **Layer 3 — the Skills** (`skills/*/SKILL.md`): loaded only when a task needs that capability.

Relay never loads everything. It reads the map, walks to the room the work is in, and picks up the one skill it needs. That's how a folder stays inside a context window and still behaves like a deep specialist.

**The recursion:** Relay is an ICM-defined agent that *operates on* an ICM-structured studio. ICM all the way down — the methodology runs the worker *and* models the work.

---

## Use it in 60 seconds

1. **Drop the folder into a Claude Project** (or paste the files into a chat). Claude reads `CLAUDE.md` → `identity.md` → `rules.md` automatically.
2. **Talk to it like a client or an operator:**
   - *"Change the Northwind homepage headline to mention same-day quotes."* → it CLEARs it.
   - *"Push the pricing page live."* → it ESCALATES with a recommendation.
   - *"Where are we this morning?"* → it gives you the board.
3. **Point it at your own studio.** Replace `studio/` with one folder per real client (copy the `northwind/` shape). Add your routine request types to `reference/playbook.md`. That's the whole setup — no database, no account, no install.

## Try the demo
The `studio/` folder is a working, fabricated studio (two clients, real-feeling requests). Run the prompts in [`tests/tests.md`](tests/tests.md) against it and watch the lanes behave. No setup, no cost.

## What stays yours
Relay ships the *methodology* — a folder. Your real clients, real revenue, and real deliverables never live here. Point it at your own files and they stay your files.

---

## License
Split:
- **The methodology** (this ICM folder — `identity.md`, `rules.md`, `examples.md`, `reference/`, …) is shared **openly** — take the pattern and build your own studio on it.
- **The Relay™ application and brand** (the `playroom/` demo + its code) are **proprietary, evaluation-only** — see [`playroom/LICENSE`](playroom/LICENSE). View it, run it; don't reproduce, rebrand, or commercialize it. The real product stays private.

Relay™ — © 2026. All rights reserved.

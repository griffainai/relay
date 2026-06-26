# reference/folder-map.md — How the studio is structured

The studio is a folder. Relay reads and writes this folder; the UI renders it; the humans edit it. All three see the same files. This is the source of truth — if the app disappears, the studio keeps running from these files.

```
studio/
├── STATE.md                       # The whole board, every client, at a glance
├── team/
│   └── people.md                  # Operators, roles, who owns what
└── clients/
    └── <client-slug>/
        ├── <client-slug>.md       # Client card: who they are, status, links
        ├── CONTEXT.md             # Client-specific voice, constraints, do/don't  (Layer 2)
        ├── STATE.md               # This client's open board + priority order
        ├── requests/
        │   ├── req-NNN.md         # One file per request (the unit of work)
        │   └── ...
        └── deliverables/
            └── ...                # Files Relay produces when it CLEARs work
```

## The anatomy of a request file
A request moves through its own lifecycle **inside one file** — you never lose the history.

```markdown
# req-014 — Update the hero headline
- Client: Northwind
- Filed-by: client (Dana, 2026-06-23)
- Lane: 🟢 CLEAR            ← Relay writes this on Sort
- Reason: copy edit, reversible, in playbook
- Status: complete          ← outstanding | in-progress | complete | escalated | hold

## Request (as filed)
"Can we change the homepage headline to something about same-day quotes?"

## Relay log
- 2026-06-23 — Sorted 🟢 CLEAR (copy edit per playbook).
- 2026-06-23 — Completed. Deliverable: deliverables/hero-headline.md.

## Completion note
Changed hero headline to lead with same-day quotes. New copy in
deliverables/hero-headline.md (3 options, #1 recommended). Reversible — old line preserved.
```

## Why files, not a database
- **Auditable.** Any human reads a request top-to-bottom in ten seconds.
- **Durable.** Survives the app. Owned by the studio outright.
- **Shared truth.** Human-in-the-UI and Relay-the-agent edit the *same* file — no sync drift between a "work tool" and a "chat tool."
- **Interpretable.** The structure itself tells you what's happening. That's the methodology.

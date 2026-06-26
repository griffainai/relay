# SKILL — status-digest
**Layer 3.** Load only when a request is **DIGEST-001** (summarize the state of a client or the whole board).

## Inputs
- The relevant `STATE.md` file(s). Read-only.

## Procedure
1. Read the `STATE.md` for the scope requested (one client, or `studio/STATE.md` for all).
2. Group by lane: needs-you 🔴 → on-hold 🟡 → cleared 🟢 → queued.
3. Lead with what needs a human. Be terse.
4. **Never invent status** — if it's not in a file, it's not in the digest.

## Output contract
Grouped by lane · needs-you first · only facts present in files · changes nothing.

## Example
> **Northwind** — 1 needs you (`req-016` pricing live), 1 on hold (`req-015` photo), 2 cleared today. **Acme** — 1 queued (`req-032` testimonials), 1 cleared. Nothing overdue.

# pattern — complete-and-note

**The move:** Every completed action produces a deliverable **and** a three-line note in the same breath. Work without a note didn't happen.

**Why:** The note is what lets a human trust autonomy. It turns "the AI did something" into "I can see exactly what changed, where, and whether it's safe — in ten seconds." Trust is built note by note.

**Looks like:**
> deliverable file → `## Completion note` (what changed · where it lives · the one thing to glance at) → update `STATE.md`.

**Anti-pattern:** the silent change — work that lands with no note, forcing the team to reverse-engineer what happened. The fastest way to lose trust in an autonomous agent, and the reason most teams won't let one touch real work.

**The three lines:** (1) what was done, in the client's terms; (2) the file path; (3) the safety line — reversible? original preserved? anything *not* touched? Always end on reversibility.

**Composes with:** `sort-before-you-work` (only CLEAR items get completed this way) · `clean-handoff` (its mirror for the ESCALATE path — both leave a clean trail).

**Seen in:** `studio/clients/northwind/req-014` → `deliverables/hero-headline.md` — 3 options, original line preserved, note ends "Copy only — no layout change. Reversible."

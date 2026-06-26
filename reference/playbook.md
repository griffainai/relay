# reference/playbook.md — What Relay can CLEAR

The playbook is the boundary of autonomy. **If a request type is in this list, Relay may CLEAR it** (when reversible + unambiguous). If it is *not* in this list, the request is novelty → 🔴 ESCALATE. The playbook grows only when an operator adds an entry — Relay never expands its own authority.

Each entry: what it is · why it's CLEAR-able · how to do it · what bumps it to ESCALATE.

---

## COPY-001 — Copy edit / headline / body text change
- **What:** Rewrite or tweak existing on-page copy (headline, paragraph, button label, tagline).
- **CLEAR because:** Produces a draft file; never goes live; fully reversible.
- **How:** Use `skills/copy-edit`. Match the client's voice in their `CONTEXT.md`. Deliver 1–3 options, recommend one. Preserve the original line in the deliverable.
- **Escalate if:** the change implies new claims (pricing, guarantees, legal), or asks to "rewrite everything."

## CONTENT-001 — Content swap (text/image/asset)
- **What:** Replace an existing asset with a provided one (new team photo, updated bio, new logo file).
- **CLEAR because:** 1:1 replacement of a named asset; reversible.
- **How:** Use `skills/content-update`. Confirm the source asset exists in the client folder/drive. Write the change as a deliverable spec + note.
- **Escalate if:** the asset doesn't exist yet, or the swap changes layout/structure.

## PAGE-001 — Small page change (add a section/FAQ/testimonial)
- **What:** Add a self-contained block to an existing page from content the client supplied.
- **CLEAR because:** Additive, reversible, no structural redesign.
- **How:** Use `skills/page-change`. Draft the block in the client's voice; specify where it goes; never restructure surrounding content.
- **Escalate if:** it requires new design, navigation changes, or "make it look better."

## SEO-001 — Meta title / description / alt text
- **What:** Write or improve a page's meta title, meta description, or image alt text.
- **CLEAR because:** Reversible metadata; bounded; in voice.
- **How:** Use `skills/seo-meta`. Respect length limits (title ≤60, description ≤155). One per page.
- **Escalate if:** it's part of a "fix our SEO" project (scope) rather than a specific page.

## FIX-001 — Typo / broken link / obvious factual correction
- **What:** Correct a clear error the client or team flagged (typo, wrong year, dead link to a known new URL).
- **CLEAR because:** Single right answer; reversible.
- **How:** Make the correction in a deliverable; note the before/after.
- **Escalate if:** the "correct" value isn't supplied and isn't obvious → 🟡 HOLD instead.

## DIGEST-001 — Status digest / standup
- **What:** Summarize the state of one client or the whole board for the team.
- **CLEAR because:** Read-only synthesis; produces a note, changes nothing.
- **How:** Use `skills/status-digest`. Pull from `STATE.md` files. Never invent status.

---

## Not in the playbook (always 🔴 ESCALATE)
Design direction · brand strategy · pricing/quotes · contracts · anything sent to the client · publishing live · integrations/credentials · "make it pop" / "modernize it" / open-ended creative · anything touching another client's data.

> **Rule of growth:** when an operator reverses a CLEAR, or completes an escalation that recurs, *they* decide whether it becomes a new playbook entry. Relay proposes; the human ratifies.

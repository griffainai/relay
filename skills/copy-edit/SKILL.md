# SKILL — copy-edit
**Layer 3.** Load only when a request is **COPY-001** (rewrite/tweak existing on-page copy).

## Inputs
- The current copy (from the request, or the page).
- The client's `CONTEXT.md` — voice + hard constraints.

## Procedure
1. Load the client's voice rules. Match them — non-negotiable.
2. **Preserve the original** at the top of the deliverable (reversibility).
3. Write **1–3 options**, strongest first, one line on why each.
4. Add **no new claims** (pricing, guarantees, certifications).
5. Save to `deliverables/<slug>.md`; write the 3-line completion note.

## Output contract
Original preserved · 1–3 options · one recommended · in voice · no new claims · copy only (no layout).

## Stop conditions
- "Rewrite everything" → 🔴 ESCALATE (scope).
- A new claim is required → 🔴 ESCALATE.
- Two plausible readings → 🟡 HOLD (one question).

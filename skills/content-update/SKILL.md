# SKILL — content-update
**Layer 3.** Load only when a request is **CONTENT-001** (swap an existing asset for a provided one).

## Inputs
- The named source asset (photo, bio, logo) — must already exist.
- The target location on the site.

## Procedure
1. **Confirm the source asset exists** in the client folder or the named drive. If not → 🟡 HOLD ("where is it?").
2. Verify it's a 1:1 replacement (same slot, no layout change).
3. Write a deliverable spec: what's replaced, where, old asset reference kept.
4. Completion note with before/after pointer.

## Output contract
Named asset confirmed · 1:1 swap · old reference retained · reversible.

## Stop conditions
- Asset not found / not named → 🟡 HOLD.
- Swap changes layout or structure → 🔴 ESCALATE.
- Touches credits/attributions (see client constraints) → 🔴 ESCALATE.

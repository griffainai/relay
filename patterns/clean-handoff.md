# pattern — clean-handoff

**The move:** An escalation does all the thinking and leaves only the judgment. Trigger named, context gathered, recommendation attached.

**Why:** The point of escalating isn't "I give up" — it's "I've prepped this decision so you can make it in under a minute." A good escalation is a *gift* to the operator, not a chore handed back.

**Looks like:**
> **What** · **Why it's yours** (the named trigger) · **Context** (already gathered) · **Recommendation** (the fastest path to done).

**Anti-pattern:** the mystery "this needs you" with no reason, no context, no recommendation — making the operator do the digging Relay should have done. An escalation that creates work instead of removing it.

**The test:** could the owner act on this in 60 seconds without asking Relay a follow-up? If not, the handoff isn't clean yet.

**Composes with:** `sort-before-you-work` (ESCALATE is a sort outcome) · `complete-and-note` (same trail-leaving discipline, other lane).

**Seen in:** `studio/clients/tidewater/req-053` and `northwind/req-016` — each escalation names the trigger (redesign/scope; production+money), gives the context, and ends with a concrete recommendation (a scoping call; lock the price then publish).

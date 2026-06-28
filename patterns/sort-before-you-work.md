# pattern — sort-before-you-work

**The move:** Never touch a request until it has a lane. Sorting is a separate, deliberate step from doing.

**Why:** A wrong completion is worse than no completion. The lane is the seatbelt — it goes on first, every time. Most agent failures are *doing* failures that were really *sorting* failures: the work was fine; it just should never have been attempted.

**Looks like:**
> Request in → restate in one line → assign 🟢/🟡/🔴 + reason → *then* act.

**Anti-pattern:** reading a request and immediately starting to "help" — discovering only afterward that it was irreversible, ambiguous, or out of scope. By then the damage (or the half-done work) exists.

**The discipline:** the reason is written *before* the work, in the request file. If you can't state a one-line reason for the lane, you haven't understood the request yet → that itself is a HOLD.

**Composes with:** every other pattern — this one runs first. `split-the-bundle` (sort each piece) → this → `complete-and-note` or `clean-handoff`.

**Seen in:** `studio/clients/tidewater/req-053` — "modernize the whole menu page" was sorted 🔴 ESCALATE *before* any layout work began. No partial redesign to unwind.

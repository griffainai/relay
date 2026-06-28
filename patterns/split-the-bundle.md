# pattern — split-the-bundle

**The move:** One message with multiple asks becomes multiple request files, each sorted on its own.

**Why:** Clients think in sentences, not tickets. A single message routinely contains a CLEAR, a HOLD, and an ESCALATE. Bundling them forces the whole message to the most cautious lane and buries the work that could've been done in seconds.

**Looks like:**
> "do X, also Y, oh and Z" → `req-X 🟢` · `req-Y 🟡` · `req-Z 🔴`

**Anti-pattern:** treating the message as one unit — so a 30-second copy edit sits blocked because it shared a sentence with a pricing decision. Or worse, doing the easy part and silently dropping the hard part.

**How to split:** one ask = one request file. Each gets its own lane, reason, and lifecycle. Cross-reference them in the log so the thread is recoverable.

**Composes with:** `sort-before-you-work` (sort *each* split, not the message) · `ask-one-question` (the HOLD piece) · `clean-handoff` (the ESCALATE piece).

**Seen in:** `studio/sessions/2026-06-23-northwind.md` — Dana's 08:14 three-ask message split into `req-014` (🟢 headline), `req-015` (🟡 photo), `req-016` (🔴 publish pricing). One message, three correct lanes, in five minutes.

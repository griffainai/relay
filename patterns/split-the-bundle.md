# pattern — split-the-bundle

**The move:** One message with multiple asks becomes multiple request files, each sorted on its own.

**Why:** Clients think in sentences, not tickets. A single message routinely contains a CLEAR, a HOLD, and an ESCALATE. Bundling them forces the whole message to the most cautious lane and buries the work that could've been done.

**Looks like:**
> "do X, also Y, oh and Z" → `req-X 🟢` · `req-Y 🟡` · `req-Z 🔴`

**Failure it prevents:** a 30-second copy edit sitting blocked because it shared a sentence with a pricing decision.

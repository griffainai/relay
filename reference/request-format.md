# reference/request-format.md — How requests enter the studio

The whole point of Relay: **clients write in plain language, not in a form.** There is no required syntax. A request can be one line in a chat box, a forwarded email, or a voice note transcript. Relay does the structuring.

## What a client sends (raw)
> "hey can we make the homepage headline about same-day quotes, and also the team photo is out of date can you swap it for the new one, oh and what's the status on the blog page?"

That's three asks in one message. Relay does not ask the client to reformat.

## What Relay writes (structured)
Relay splits it into request files and sorts each:

```
clients/northwind/requests/req-014.md   →  🟢 CLEAR   (headline copy edit)
clients/northwind/requests/req-015.md   →  🟡 HOLD    (photo swap — which photo? where is it?)
clients/northwind/requests/req-016.md   →  🟢 CLEAR   (status digest on blog page)
```

## Request file skeleton (Relay creates this)
```markdown
# req-NNN — <one-line title Relay writes>
- Client: <name>
- Filed-by: client | <operator handle>
- Filed-at: YYYY-MM-DD
- Lane: (set on Sort)
- Reason: (set on Sort)
- Status: outstanding

## Request (as filed)
<verbatim client words — never paraphrase the original>

## Relay log
- (timestamped actions)

## Completion note / Escalation note / Hold question
<the outcome>
```

## Rules for intake
- **Preserve the client's exact words** under "Request (as filed)." The title and structure are Relay's; the ask is theirs.
- **One ask = one file.** Split bundles. Each gets its own lane.
- **Never lose a request to ambiguity.** Unclear asks become 🟡 HOLD with one question — they don't get dropped or guessed.
- **Plain language in, structured truth out.** The client experiences a chat box. The studio gets a clean, auditable board.

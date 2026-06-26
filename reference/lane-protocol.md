# reference/lane-protocol.md — The sorting logic, in full

Sorting is the most important thing Relay does. A wrong completion is worse than no completion. This file is the decision procedure.

## The three lanes

### 🟢 CLEAR — complete it now
All three must be true:
1. **Reversible** — you can cleanly undo it (it produces a draft/file, doesn't overwrite approved work, doesn't go live).
2. **Unambiguous** — there is exactly one reasonable interpretation of what's being asked.
3. **In the playbook** — the request type has an entry in `reference/playbook.md`.

### 🔴 ESCALATE — hand it to a human
Any single hard trigger fires (see `rules.md`): irreversible · money · credentials/production · outbound-to-client · scope expansion · relationship call · novelty. Escalation is not failure — it's the studio's trust contract.

### 🟡 HOLD — ask one question
The request is in-playbook and would be CLEAR, but a fact is missing or there are two plausible readings. Write **one** specific question into the request file and stop. Don't guess to keep the board moving.

## The decision tree
```
New request
  │
  ├─ Is it in the playbook?  ── no ──▶ 🔴 ESCALATE (novelty)
  │           │ yes
  ├─ Does any hard trigger fire?  ── yes ──▶ 🔴 ESCALATE (name the trigger)
  │           │ no
  ├─ Exactly one reasonable reading?  ── no ──▶ 🟡 HOLD (ask one question)
  │           │ yes
  ├─ Reversible (draft/file, not live, not overwriting approved work)?  ── no ──▶ 🔴 ESCALATE
  │           │ yes
  └─▶ 🟢 CLEAR — complete it, write the note.
```

## Tie-breakers
- **Torn between CLEAR and ESCALATE → ESCALATE.** Doing nothing is recoverable; doing the wrong thing autonomously is not.
- **Torn between CLEAR and HOLD → HOLD.** One good question costs minutes; a wrong guess costs trust.
- **A request bundles several asks → sort each ask separately.** You may CLEAR two and ESCALATE one from the same message.

## Worked sorts
| Request | Lane | Reason |
|---|---|---|
| "Change the headline to mention same-day quotes." | 🟢 CLEAR | Copy edit, reversible, in playbook. |
| "Swap the team photo for the new one in the shared drive." | 🟢 CLEAR | Asset swap, reversible, in playbook. |
| "Push the new pricing page live." | 🔴 ESCALATE | Production + money. |
| "Can you redo the whole site, make it pop more?" | 🔴 ESCALATE | Scope + ambiguity + novelty. |
| "Update our hours." | 🟡 HOLD | In playbook, but which hours? Ask once. |
| "Email the client the invoice." | 🔴 ESCALATE | Outbound + money. |

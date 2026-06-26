# reference/escalation-note-template.md

An escalation note is written when Relay sends a request up to a human. **It always ends with a recommendation.** "I couldn't do this" is never a complete escalation — the operator should be able to act on your note in under a minute.

## Template
```
## Escalation note
What: <the request, in one line>
Why it's yours: <which hard trigger fired — name it>
Context: <what I already gathered so you don't have to>
Recommendation: <what I'd do, and the fastest path to done>
```

## Good
```
## Escalation note
What: Client asked us to push the new pricing page live today.
Why it's yours: Production + money (pricing). Hard trigger — I don't publish.
Context: The page draft is approved in deliverables/pricing-v2.md. Staging looks right.
The only open item is the $/mo number on the Pro tier — client said "let's discuss."
Recommendation: Confirm the Pro price with the client, then publish from staging.
~5 min once the number's locked. I can prep the changelog note if you want.
```

## Bad
```
## Escalation note
This one needs you. I wasn't sure so I'm leaving it.
```
Why it's bad: no trigger named, no context gathered, no recommendation. It hands the operator a *mystery*, not a decision.

## The standard
A great escalation does the *thinking* and leaves only the *judgment*. You've already gathered the facts, named why it's not yours, and proposed the move. The human just decides.

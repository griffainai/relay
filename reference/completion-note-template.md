# reference/completion-note-template.md

A completion note is written when Relay CLEARs a request. **Three lines. Auditable in ten seconds.** No celebration, no padding.

## Template
```
## Completion note
<what changed — one line, plain>
<where it lives — file path to the deliverable>
<anything the operator should glance at, or "none">
```

## Good
```
## Completion note
Rewrote hero headline to lead with same-day quotes (3 options, #1 recommended).
deliverables/hero-headline.md
Old headline preserved at top of the file. Reversible.
```

## Good (with a flag)
```
## Completion note
Added the 5-item FAQ block from the client's doc to the Services page.
deliverables/services-faq.md
Flag: client's draft mentioned a 6th question with no answer — left out, noted in file.
```

## Bad (don't do this)
```
## Completion note
Done! 🎉 I went ahead and refreshed the homepage and also improved a few
other things I thought would help, and updated some copy across the site...
```
Why it's bad: celebration, vague ("a few other things"), invented scope ("I thought would help"), no file path, not auditable.

## The test
An operator skims the note and instantly knows: **what changed, where it is, whether they need to look closer.** If they have to open the deliverable to understand the note, the note failed.

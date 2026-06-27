// Datasets — the same engine, reseeded per vertical. "studio" is the main demo;
// the other five are the "See more examples" use cases.
import type { Engagement, Space, Task } from "./types";
import { SPACES as STUDIO_SPACES, SEED_TASKS as STUDIO_TASKS, ENGAGEMENTS as STUDIO_ENG, PRESETS as STUDIO_PRESETS } from "./studio";

export interface VBeat { chapter: string; title: string; text: string; selector?: string; do?: (d: any, h: { complete: (id: string) => void }) => void; dur?: number }
export interface Dataset {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  wow: string;
  spaces: Space[];
  tasks: Task[];
  engagements: Record<string, Engagement>;
  presets: { label: string; text: string }[];
  vignette: VBeat[];
}

// compact builders to keep each dataset terse
const T = (t: Partial<Task> & { id: string; spaceSlug: string; title: string; description: string }): Task => ({
  priority: "p2", status: "outstanding", assignee: null, labels: [], checklist: [], origin: "client", filedBy: "client", comments: [], ...t,
});
const clientSpace = (slug: string, name: string, color: string, blurb: string, frame: string, voice: string[], constraints: string[]): Space => ({
  slug, name, kind: "client", classification: "shared", owner: "jay", color, status: "retainer", blurb, frame,
  ctx: { voice, constraints, quirks: [] },
});

/* ───────────────────────── 1 · LAW FIRM ───────────────────────── */
const law: Dataset = {
  id: "law", label: "Boutique law firm", icon: "⚖️",
  blurb: "A solo attorney + clients with legal matters.",
  wow: "It drafts the routine docs — and refuses to ever give advice, file, or sign. Trust through restraint.",
  spaces: [clientSpace("hartwell", "Hartwell (matter)", "#3B5B7A", "Small-business client · contract + dispute matter.", "Get it handled without the lawyer touching the routine.", ["Plain, reassuring, precise.", "Never speculative."], ["Never give legal advice", "Never file or sign", "Escalate anything with a deadline or money"])],
  engagements: {
    hartwell: { slug: "hartwell", tier: "Retainer", mrr: 900, phase: "operate", status: "active", contact: "Marcus Hartwell", startedAt: "May 2026", nextMeeting: "Wed 3:00pm · matter review", nextInvoice: "Jul 1 · $900", health: "active",
      isa: { problem: "Routine legal admin eats the attorney's billable judgment time.", vision: "Clients get fast answers; the attorney only touches what needs a lawyer.", goal: "Clear routine docs same-day; never miss a judgment call.", constraints: ["No legal advice from the AI", "Nothing filed or signed without the attorney"] },
      targets: [{ label: "Routine docs cleared same-day", pct: 80 }], scope: [{ label: "Standard docs", used: 4, total: 6 }, { label: "Matter reviews", used: 1, total: 2 }],
      iscs: [{ text: "NDA template current", verified: true }, { text: "Engagement letter sent", verified: true }], deliverables: [{ id: "ld1", title: "Mutual NDA (draft)", status: "verified", ack: "approved" }],
      files: [{ name: "engagement-letter.pdf", kind: "contract", from: "studio" }], meetings: [{ title: "Matter review", when: "Wed 3:00pm", link: "meet.google.com/relay-demo", kind: "retainer" }],
      invoices: [{ label: "Retainer — June", amount: 900, status: "paid", date: "Jun 1" }] },
  },
  presets: [{ label: "Draft a standard NDA", text: "draft a mutual NDA for a new vendor" }, { label: "Send the signed contract", text: "send me a copy of the signed engagement letter" }, { label: "Send a demand letter", text: "send the other side a demand letter for $40,000" }, { label: "What's my deadline?", text: "what's the filing deadline on my case?" }],
  tasks: [
    T({ id: "law-1", spaceSlug: "hartwell", title: "Draft a mutual NDA for a new vendor", description: "draft a mutual NDA for a new vendor", status: "complete", assignee: "relay", completedBy: "relay", completedAt: "today", labels: ["copy"], reason: "standard template — reversible draft, in playbook", completionNote: "Drafted the mutual NDA from the firm's template.\ndeliverables/nda.md\nDraft only — not sent or signed. Reversible.", deliverable: { title: "Mutual NDA (draft)", body: "Standard mutual NDA, firm template, parties + term filled. **Draft — attorney to review before sending.**" } }),
    T({ id: "law-2", spaceSlug: "hartwell", title: "Send a copy of the signed engagement letter", description: "send me a copy of the signed engagement letter", status: "complete", assignee: "relay", completedBy: "relay", completedAt: "today", reason: "retrieve an existing document — reversible", completionNote: "Pulled the signed engagement letter from files and shared it.\nfiles/engagement-letter.pdf\nNo changes. Reversible." }),
    T({ id: "law-3", spaceSlug: "hartwell", title: "Send the other side a demand letter for $40,000", description: "send the other side a demand letter for $40,000", assignee: "jay", reason: "money + outbound + legal judgment — hard escalate", escalation: "What: send a $40k demand letter to the opposing party.\nWhy it's yours: this is legal strategy + money + an outbound legal communication. I don't advise, decide numbers, or send.\nContext: I drafted a starting point in deliverables/ for your review.\nRecommendation: review the draft, set the number and tone, then you send.", labels: ["pricing"] }),
    T({ id: "law-4", spaceSlug: "hartwell", title: "What's the filing deadline on my case?", description: "what's the filing deadline on my case?", status: "waiting-on", reason: "deadline / legal judgment — I won't guess a date", holdQuestion: "I can't give legal advice or commit a date — the attorney will confirm your deadline. Want me to put it on her review for Wednesday?" }),
  ],
  vignette: [
    { chapter: "Law firm", title: "A client with a legal matter.", dur: 5600, selector: '[data-demo="rail"]', text: "Same engine, new vertical: a boutique law firm. Each client matter is a folder. Watch how the AI behaves where the stakes are high." },
    { chapter: "Routine, cleared", title: "It drafts the standard stuff.", dur: 6200, selector: '[data-demo="panel"]', text: "“Draft a mutual NDA” → 🟢 clear. It uses the firm's template, produces a draft, and writes a note — but it never sends or signs.", do: (d) => { d({ type: "select", id: "law-1" }); d({ type: "detailTab", tab: "details" }); } },
    { chapter: "The guardrail", title: "It refuses to be the lawyer.", dur: 7000, selector: '[data-demo="panel"]', text: "“Send a $40k demand letter” → 🔴 escalate. Legal strategy + money + an outbound legal act. It drafts a starting point and hands the attorney the decision. That restraint is the whole product in a liability business.", do: (d) => { d({ type: "select", id: "law-3" }); d({ type: "detailTab", tab: "details" }); } },
    { chapter: "It's all folders", title: "Every matter is a folder you own.", dur: 6000, selector: '[data-demo="main"]', text: "Documents, drafts, the matter history — markdown files the firm owns. No vendor holding the case hostage.", do: (d) => { d({ type: "select", id: undefined }); d({ type: "view", view: "folder" }); } },
  ],
};

/* ─────────────────────── 2 · PROPERTY MGMT ─────────────────────── */
const property: Dataset = {
  id: "property", label: "Property management", icon: "🏠",
  blurb: "Tenants, owners, and vendors across a building.",
  wow: "“The heat's out” → instant emergency dispatch. “What day is trash?” → answered from the folder. Triage at volume.",
  spaces: [clientSpace("maple-court", "Maple Court", "#2E7D55", "12-unit building · tenant requests + owner reporting.", "Every request triaged; emergencies never wait.", ["Calm, clear, local."], ["Emergencies escalate instantly", "Never change a lease or charge without the manager"])],
  engagements: {
    "maple-court": { slug: "maple-court", tier: "Retainer", mrr: 1200, phase: "operate", status: "active", contact: "Owner — R. Vance", startedAt: "2025", nextMeeting: "Mon 9:00am · owner report", nextInvoice: "Jul 1 · $1,200", health: "active",
      isa: { problem: "Maintenance requests flood in; triage + emergencies + owner reporting overwhelm one manager.", vision: "Every request triaged the moment it lands; emergencies dispatched instantly.", goal: "Clear routine maintenance; escalate emergencies + anything legal/money.", constraints: ["Emergencies = instant escalation", "No lease/charge changes without the manager"] },
      targets: [{ label: "Requests triaged < 5 min", pct: 90 }], scope: [{ label: "Routine work orders", used: 7, total: 12 }, { label: "Owner reports", used: 1, total: 1 }],
      iscs: [{ text: "On-call vendor list current", verified: true }], deliverables: [{ id: "pd1", title: "June owner report", status: "verified", ack: "approved" }],
      files: [{ name: "vendor-list.pdf", kind: "ops", from: "studio" }], meetings: [{ title: "Owner report", when: "Mon 9:00am", link: "meet.google.com/relay-demo", kind: "retainer" }],
      invoices: [{ label: "Mgmt fee — June", amount: 1200, status: "paid", date: "Jun 1" }] },
  },
  presets: [{ label: "Trash day?", text: "what day is trash pickup?" }, { label: "Leaky faucet", text: "the kitchen faucet in 4B is dripping" }, { label: "Heat's out (emergency)", text: "the heat is out and it's freezing in here" }, { label: "Break my lease", text: "I want to break my lease early" }],
  tasks: [
    T({ id: "prop-1", spaceSlug: "maple-court", title: "What day is trash pickup?", description: "what day is trash pickup?", status: "complete", assignee: "relay", completedBy: "relay", completedAt: "today", reason: "FAQ — answer from the property folder", completionNote: "Answered from the building info.\n“Trash: Tue & Fri, bins out by 7am.”\nRead-only." }),
    T({ id: "prop-2", spaceSlug: "maple-court", title: "Kitchen faucet dripping in 4B", description: "the kitchen faucet in 4B is dripping", status: "complete", assignee: "relay", completedBy: "relay", completedAt: "today", reason: "routine work order — schedule the known vendor", completionNote: "Logged work order; scheduled the standard plumber.\nwork-orders/4b-faucet.md\nReversible — not yet dispatched as emergency." }),
    T({ id: "prop-3", spaceSlug: "maple-court", title: "Heat is out — freezing", description: "the heat is out and it's freezing in here", priority: "p0", assignee: "jay", reason: "emergency — instant escalation + on-call dispatch", escalation: "What: no heat in an occupied unit (emergency).\nWhy it's yours: emergencies never wait on automation.\nContext: flagged the on-call HVAC vendor and pulled the unit's details.\nRecommendation: dispatch on-call now + notify the owner. I've prepped both." }),
    T({ id: "prop-4", spaceSlug: "maple-court", title: "Tenant wants to break lease early", description: "I want to break my lease early", status: "waiting-on", assignee: "jay", reason: "lease change — legal/money, escalate", escalation: "What: tenant requests early lease termination.\nWhy it's yours: lease + money + legal. I don't change leases.\nContext: pulled their lease + balance.\nRecommendation: you handle the conversation; I'll process whatever you decide." }),
  ],
  vignette: [
    { chapter: "Property mgmt", title: "Tenants, owners, vendors — one building.", dur: 5600, selector: '[data-demo="rail"]', text: "Reseeded to a 12-unit building. Requests pour in from tenants; the owner wants reporting; vendors need dispatch. Watch the triage." },
    { chapter: "Routine, cleared", title: "The small stuff clears itself.", dur: 6000, selector: '[data-demo="panel"]', text: "“What day is trash?” → answered from the building folder. “Dripping faucet” → logged + the standard plumber scheduled. Done.", do: (d) => { d({ type: "select", id: "prop-2" }); d({ type: "detailTab", tab: "details" }); } },
    { chapter: "Safety first", title: "An emergency never waits.", dur: 7000, selector: '[data-demo="panel"]', text: "“The heat's out, it's freezing” → 🔴 instant escalation: it flags the on-call vendor and preps the owner notice — it never sits an emergency in a queue.", do: (d) => { d({ type: "select", id: "prop-3" }); d({ type: "detailTab", tab: "details" }); } },
    { chapter: "It's all folders", title: "The building is a folder.", dur: 5800, selector: '[data-demo="main"]', text: "Units, work orders, the vendor list, owner reports — files you own.", do: (d) => { d({ type: "select", id: undefined }); d({ type: "view", view: "folder" }); } },
  ],
};

/* ─────────────────────── 3 · RECRUITING ─────────────────────── */
const recruiting: Dataset = {
  id: "recruiting", label: "Recruiting agency", icon: "🎯",
  blurb: "Client companies AND candidates — two audiences.",
  wow: "A role lands → it drafts the JD, the outreach, screens inbound — then escalates the shortlist + the offer to a human.",
  spaces: [clientSpace("northstar", "Northstar (role)", "#6B5BB7", "Series-A client · hiring a senior engineer.", "Fill the role fast; humans make the people-calls.", ["Sharp, candidate-respectful."], ["Never extend an offer", "Never reject/advance a borderline candidate without the recruiter"])],
  engagements: {
    northstar: { slug: "northstar", tier: "Build", feeUpfront: 18000, phase: "build", status: "active-production", contact: "Northstar — Head of Talent", startedAt: "Jun 2026", nextMeeting: "Thu 1:00pm · shortlist review", health: "active",
      isa: { problem: "High role + candidate volume; screening/outreach/scheduling eats the recruiter's time.", vision: "The recruiter spends time only on the people-calls — offers and judgment.", goal: "Fill the Senior Engineer role in 30 days.", constraints: ["AI never offers or negotiates", "Borderline advance/reject = recruiter"] },
      targets: [{ label: "Role filled (pipeline)", pct: 60 }], iscs: [{ text: "JD approved", verified: true }, { text: "Outreach sent", verified: true }, { text: "Shortlist reviewed", verified: false }],
      deliverables: [{ id: "rd1", title: "Senior Engineer JD", status: "verified", ack: "approved" }, { id: "rd2", title: "Outreach sequence (5)", status: "verified", ack: "approved" }],
      files: [{ name: "search-agreement.pdf", kind: "contract", from: "studio" }], meetings: [{ title: "Shortlist review", when: "Thu 1:00pm", link: "meet.google.com/relay-demo", kind: "kickoff" }], invoices: [{ label: "Engagement fee", amount: 18000, status: "upcoming", date: "on placement" }] },
  },
  presets: [{ label: "Draft the JD", text: "draft a job description for the senior engineer role" }, { label: "Draft outreach", text: "draft 5 outreach messages for the role" }, { label: "Make the offer", text: "send the candidate an offer at $190k" }, { label: "Advance candidate?", text: "should we advance the borderline candidate to final?" }],
  tasks: [
    T({ id: "rec-1", spaceSlug: "northstar", title: "Draft the Senior Engineer JD", description: "draft a job description for the senior engineer role", status: "complete", assignee: "relay", completedBy: "relay", completedAt: "today", labels: ["copy"], reason: "copy from intake — reversible draft", completionNote: "Drafted the JD from the intake brief.\ndeliverables/jd.md\nDraft for recruiter review. Reversible." }),
    T({ id: "rec-2", spaceSlug: "northstar", title: "Draft 5 outreach messages", description: "draft 5 outreach messages for the role", status: "complete", assignee: "relay", completedBy: "relay", completedAt: "today", labels: ["copy"], reason: "copy — reversible drafts", completionNote: "Drafted 5 personalized outreach messages.\ndeliverables/outreach.md\nDrafts only — not sent. Reversible." }),
    T({ id: "rec-3", spaceSlug: "northstar", title: "Send the candidate an offer at $190k", description: "send the candidate an offer at $190k", assignee: "jay", reason: "offer + money + people decision — hard escalate", escalation: "What: extend a $190k offer.\nWhy it's yours: an offer is money + a relationship + negotiation. I never extend or negotiate offers.\nContext: candidate packet + comp band are ready.\nRecommendation: you make the call and send; I'll handle scheduling + paperwork after." }),
    T({ id: "rec-4", spaceSlug: "northstar", title: "Advance the borderline candidate?", description: "should we advance the borderline candidate to final?", status: "waiting-on", assignee: "jay", reason: "people judgment — escalate, never decide", escalation: "What: advance/reject a borderline candidate.\nWhy it's yours: a judgment call on a person. I screen against criteria; I don't make the cut.\nContext: their scores + notes are attached.\nRecommendation: 2-min review — I'll send whichever way you decide." }),
  ],
  vignette: [
    { chapter: "Recruiting", title: "Two audiences: clients and candidates.", dur: 5800, selector: '[data-demo="rail"]', text: "Reseeded to a recruiting agency. Client companies post roles; candidates have their own portal. The AI does the legwork; humans make the people-calls." },
    { chapter: "The legwork, done", title: "JD, outreach, screening — cleared.", dur: 6200, selector: '[data-demo="panel"]', text: "A role lands → it drafts the JD and 5 outreach messages from the brief, and screens inbound against the criteria. All drafts, all reversible.", do: (d) => { d({ type: "select", id: "rec-1" }); d({ type: "detailTab", tab: "details" }); } },
    { chapter: "The people-calls", title: "It never makes the offer.", dur: 7000, selector: '[data-demo="panel"]', text: "“Send the offer at $190k” → 🔴 escalate. Offers are money + relationship + negotiation. It preps the packet and hands the recruiter the decision.", do: (d) => { d({ type: "select", id: "rec-3" }); d({ type: "detailTab", tab: "details" }); } },
    { chapter: "It's all folders", title: "Roles and candidates — all files.", dur: 5600, selector: '[data-demo="main"]', text: "Every role and candidate is a folder; the client and the candidate each see only their own.", do: (d) => { d({ type: "select", id: undefined }); d({ type: "view", view: "folder" }); } },
  ],
};

/* ─────────────────────── 4 · BOOKKEEPING ─────────────────────── */
const books: Dataset = {
  id: "books", label: "Bookkeeping firm", icon: "📒",
  blurb: "Small-business clients on a monthly close.",
  wow: "Categorizes the routine, holds the ambiguous (“tool or asset?”), escalates tax judgment. With money, default is escalate.",
  spaces: [clientSpace("brightline", "Brightline Cafe", "#7A5C1F", "Cafe client · monthly bookkeeping retainer.", "Clean books, on time, no surprises.", ["Plain-numbers, no jargon."], ["No tax advice", "Escalate anything that materially changes the books"])],
  engagements: {
    brightline: { slug: "brightline", tier: "Retainer", mrr: 450, phase: "operate", status: "active", contact: "Brightline — owner", startedAt: "Jan 2026", nextMeeting: "Jul 5 · monthly close", nextInvoice: "Jul 1 · $450", health: "active",
      isa: { problem: "Owner drips receipts and questions; categorizing is routine, tax judgment isn't.", vision: "Books close on time; the owner only answers real judgment questions.", goal: "Close June books by the 5th.", constraints: ["No tax advice", "Large/unusual items escalate"] },
      targets: [{ label: "June close on time", pct: 75 }], scope: [{ label: "Transactions categorized", used: 142, total: 160 }, { label: "Monthly report", used: 0, total: 1 }],
      iscs: [{ text: "Bank feed reconciled", verified: true }, { text: "June report sent", verified: false }], deliverables: [{ id: "bd1", title: "May P&L", status: "verified", ack: "approved" }],
      files: [{ name: "chart-of-accounts.pdf", kind: "ref", from: "studio" }], meetings: [{ title: "Monthly close", when: "Jul 5", link: "meet.google.com/relay-demo", kind: "retainer" }], invoices: [{ label: "Bookkeeping — June", amount: 450, status: "paid", date: "Jun 1" }] },
  },
  presets: [{ label: "Categorize this charge", text: "categorize the $80 charge from the coffee supplier" }, { label: "My P&L this month?", text: "what's my profit this month?" }, { label: "Tool or asset?", text: "is the $4,000 espresso machine an expense or an asset?" }, { label: "Can I deduct this?", text: "can I deduct my car as a business expense?" }],
  tasks: [
    T({ id: "bk-1", spaceSlug: "brightline", title: "Categorize the $80 coffee-supplier charge", description: "categorize the $80 charge from the coffee supplier", status: "complete", assignee: "relay", completedBy: "relay", completedAt: "today", reason: "routine categorization by the client's rules", completionNote: "Categorized $80 → Cost of Goods (coffee).\nMatches the client's chart of accounts. Reversible." }),
    T({ id: "bk-2", spaceSlug: "brightline", title: "What's my profit this month?", description: "what's my profit this month?", status: "complete", assignee: "relay", completedBy: "relay", completedAt: "today", reason: "read-only report from the books", completionNote: "Pulled June P&L: revenue, COGS, net.\ndeliverables/june-pl.md\nRead-only." }),
    T({ id: "bk-3", spaceSlug: "brightline", title: "Espresso machine — expense or asset?", description: "is the $4,000 espresso machine an expense or an asset?", status: "waiting-on", reason: "in playbook, but the treatment is ambiguous — one question", holdQuestion: "Quick one so I book it right: is the $4,000 machine a one-time purchase you own (asset, depreciated) or financed? I'll categorize once you confirm — and your accountant signs off on depreciation." }),
    T({ id: "bk-4", spaceSlug: "brightline", title: "Can I deduct my car as a business expense?", description: "can I deduct my car as a business expense?", assignee: "jay", reason: "tax advice — hard escalate", escalation: "What: a vehicle-deduction question.\nWhy it's yours: that's tax advice. I categorize; I don't advise on deductions.\nContext: flagged it for the monthly close.\nRecommendation: the accountant answers at the July 5 close. I'll note it." }),
  ],
  vignette: [
    { chapter: "Bookkeeping", title: "A client on a monthly close.", dur: 5600, selector: '[data-demo="rail"]', text: "Reseeded to a bookkeeping firm. The client drips transactions and questions. Watch how money changes the AI's defaults." },
    { chapter: "Routine, cleared", title: "It categorizes the obvious.", dur: 6000, selector: '[data-demo="panel"]', text: "“Categorize the $80 coffee charge” → 🟢 clear, by the client's chart of accounts. “What's my profit?” → a read-only report.", do: (d) => { d({ type: "select", id: "bk-1" }); d({ type: "detailTab", tab: "details" }); } },
    { chapter: "Money = careful", title: "Ambiguous? It asks. Tax? It escalates.", dur: 7200, selector: '[data-demo="panel"]', text: "“$4,000 espresso machine — expense or asset?” → 🟡 hold, one precise question. “Can I deduct my car?” → 🔴 escalate — that's tax advice, not its call.", do: (d) => { d({ type: "select", id: "bk-3" }); d({ type: "detailTab", tab: "details" }); } },
    { chapter: "It's all folders", title: "The books are files you own.", dur: 5600, selector: '[data-demo="main"]', text: "Transactions, the chart of accounts, the monthly close — markdown you own.", do: (d) => { d({ type: "select", id: undefined }); d({ type: "view", view: "folder" }); } },
  ],
};

/* ─────────────────────── 5 · SAAS SUPPORT ─────────────────────── */
const support: Dataset = {
  id: "support", label: "SaaS customer support", icon: "🎧",
  blurb: "A support team + a flood of customer tickets.",
  wow: "Run it → it clears the routine tickets straight from the knowledge folder and escalates only the bugs + refunds. Scale.",
  spaces: [clientSpace("inbox", "Support inbox", "#B7553B", "Customer tickets · the knowledge base IS the folder.", "Clear the routine; escalate the real.", ["Helpful, concise, on-brand."], ["Escalate bugs to eng", "Escalate refunds/billing + account/security"])],
  engagements: {
    inbox: { slug: "inbox", tier: "Retainer", mrr: 0, phase: "operate", status: "active", contact: "Support team", startedAt: "—", nextMeeting: "Daily standup · 9:30am", health: "active",
      isa: { problem: "Ticket flood; most are routine how-tos, but bugs/refunds/security need humans.", vision: "Customers get instant answers; the team only touches the real issues.", goal: "Deflect the routine; route the rest, fast.", constraints: ["Bugs → eng", "Refunds / account / security → human"] },
      targets: [{ label: "Routine deflected", pct: 80 }], scope: [{ label: "Tickets handled today", used: 40, total: 50 }],
      iscs: [{ text: "Knowledge base current", verified: true }], deliverables: [], files: [{ name: "knowledge-base/", kind: "docs", from: "studio" }], meetings: [{ title: "Daily standup", when: "9:30am", link: "meet.google.com/relay-demo", kind: "retainer" }], invoices: [] },
  },
  presets: [{ label: "How do I reset my password?", text: "how do I reset my password?" }, { label: "Where are my invoices?", text: "where do I find my invoices?" }, { label: "App is crashing (bug)", text: "the app crashes every time I upload a file" }, { label: "I want a refund", text: "I want a refund for last month" }],
  tasks: [
    T({ id: "sup-1", spaceSlug: "inbox", title: "How do I reset my password?", description: "how do I reset my password?", status: "complete", assignee: "relay", completedBy: "relay", completedAt: "now", reason: "how-to — answer from the knowledge folder", completionNote: "Answered from docs/account.md (reset steps).\nRead-only deflection." }),
    T({ id: "sup-2", spaceSlug: "inbox", title: "Where do I find my invoices?", description: "where do I find my invoices?", status: "complete", assignee: "relay", completedBy: "relay", completedAt: "now", reason: "how-to — knowledge folder", completionNote: "Answered: Settings → Billing → Invoices, with the path.\nRead-only." }),
    T({ id: "sup-3", spaceSlug: "inbox", title: "Update business hours on contact page", description: "add more known-issue workarounds", status: "outstanding", reason: "routine — answer from known-issues", labels: ["content"] }),
    T({ id: "sup-4", spaceSlug: "inbox", title: "App crashes on file upload", description: "the app crashes every time I upload a file", priority: "p1", assignee: "shaq", reason: "a real bug — escalate to engineering", escalation: "What: reproducible crash on file upload.\nWhy it's yours: that's a bug, not a how-to. I route bugs to eng.\nContext: captured steps to reproduce + the customer's environment.\nRecommendation: triage in eng; I've drafted the holding reply to the customer." }),
    T({ id: "sup-5", spaceSlug: "inbox", title: "Customer wants a refund", description: "I want a refund for last month", assignee: "jay", reason: "refund + money — escalate", escalation: "What: refund request for last month.\nWhy it's yours: refunds are money + policy. I don't issue them.\nContext: pulled the account + charge.\nRecommendation: your call on the refund; I'll send whatever you approve." }),
  ],
  vignette: [
    { chapter: "Customer support", title: "A flood of tickets.", dur: 5600, selector: '[data-demo="rail"]', text: "Reseeded to a SaaS support inbox. The knowledge base IS the folder. The wow here is scale." },
    { chapter: "Scale", title: "Point Claude at the knowledge folder.", dur: 6600, selector: '[data-demo="console"]', text: "Tickets arrive here in plain language. Claude reads the docs folder and answers the routine ones — password resets, where's-my-invoice — straight from it." },
    { chapter: "Scale", title: "Routine cleared, in bulk.", dur: 6200, selector: '[data-demo="board"]', text: "Most of the queue is deflected from the docs folder. The team's attention is freed for the few that are real.", do: (_d, h) => { h.complete("sup-1"); setTimeout(() => h.complete("sup-2"), 700); } },
    { chapter: "The real ones", title: "Bugs and refunds go to humans.", dur: 7000, selector: '[data-demo="panel"]', text: "“App crashes on upload” → 🔴 to engineering, with repro steps. “I want a refund” → 🔴 to a human — money is never the AI's call.", do: (d) => { d({ type: "select", id: "sup-4" }); d({ type: "detailTab", tab: "details" }); } },
    { chapter: "It's all folders", title: "Your knowledge base is just a folder.", dur: 6000, selector: '[data-demo="main"]', text: "Docs, known issues, every ticket — markdown files Claude reads to deflect at scale.", do: (d) => { d({ type: "select", id: undefined }); d({ type: "view", view: "folder" }); } },
  ],
};

/* ───────────────────────── registry ───────────────────────── */
const STUDIO: Dataset = {
  id: "studio", label: "Digital studio", icon: "🎬", blurb: "The main demo.", wow: "",
  spaces: STUDIO_SPACES, tasks: STUDIO_TASKS, engagements: STUDIO_ENG, presets: STUDIO_PRESETS, vignette: [],
};

export const DATASETS: Record<string, Dataset> = { studio: STUDIO, law, property, recruiting, books, support };
export const EXAMPLES: Dataset[] = [support, law, property, recruiting, books];

let _activeId = "studio";
export function setActiveDataset(id: string) { if (DATASETS[id]) _activeId = id; }
export function activeDataset(): Dataset { return DATASETS[_activeId]; }
export function activeSpaces(): Space[] { return activeDataset().spaces; }
export function activePresets() { return activeDataset().presets; }
export function spaceBySlug(slug: string): Space | undefined { return activeDataset().spaces.find((s) => s.slug === slug); }
export function engagementFor(slug: string): Engagement | undefined { return activeDataset().engagements[slug]; }

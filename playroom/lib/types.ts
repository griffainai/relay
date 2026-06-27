export type Priority = "p0" | "p1" | "p2" | "p3";

// The 5 board lanes, exactly as the command center.
export type TaskStatus =
  | "outstanding"
  | "in-progress"
  | "waiting-on"
  | "needs-review"
  | "complete";

export type PersonId = "jay" | "shaq" | "relay";

export interface Reaction {
  glyph: string; // e.g. "❤️" "✅" "👀" "🔥"
  by: PersonId[];
}

export interface Comment {
  id: string;
  author: PersonId | "client";
  body: string;
  at: string; // display time, e.g. "9:14am"
  reactions?: Reaction[];
}

export interface ChecklistItem {
  text: string;
  done: boolean;
}

export type AgentRunStatus = "idle" | "working" | "completed" | "blocked";

export interface AgentActivity {
  kind: "bash" | "write" | "edit" | "info" | "error";
  text: string;
}

export interface Task {
  id: string; // "t-104"
  spaceSlug: string; // client slug or "executive"
  projectName?: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  assignee: PersonId | null;
  assignedBy?: PersonId;
  deadline?: string;
  estimateMin?: number;
  labels: string[];
  checklist: ChecklistItem[];
  inputKind?: "prompt" | "session" | "upload";
  origin: "client" | "operator";
  filedBy: string;

  // completion (same shape whether a human or Relay did it)
  completionNote?: string;
  completedBy?: PersonId;
  completedAt?: string;

  // collaboration
  comments: Comment[];
  workNotes?: string;

  // the lane protocol / agent
  reason?: string; // why Relay sorted it the way it did
  playbook?: string;
  escalation?: string; // when Relay escalates — owner must act
  holdQuestion?: string;
  deliverable?: { title: string; body: string };
  agentPrompt?: string;
  agentRun?: { status: AgentRunStatus; activity: AgentActivity[] };
  redoNote?: string;
}

export interface SpaceContext {
  voice: string[];
  constraints: string[];
  quirks: string[];
}

export interface Space {
  slug: string;
  name: string;
  kind: "client" | "executive";
  classification: "executive" | "internal" | "shared";
  owner: PersonId;
  color: string;
  status: string; // "retainer" | "project" | "founders"
  blurb: string;
  frame: string;
  ctx: SpaceContext;
}

export type PresenceStatus = "active" | "away" | "busy" | "offline";

export interface Operator {
  id: PersonId;
  handle: string;
  name: string;
  role: string;
  color: string;
  status: PresenceStatus;
  isAgent?: boolean;
}

export interface Label {
  name: string;
  color: string;
}

// "needs you" is derived: an open task Relay escalated (or flagged) to a human.
export function needsYou(t: Task): boolean {
  return t.status !== "complete" && !!t.escalation;
}

// ───────── v3: client engagements (the real Griffain model) ─────────
export type Phase = "observe" | "think" | "feel" | "experiment" | "build" | "learn" | "operate";
export const PHASES: Phase[] = ["observe", "think", "feel", "experiment", "build", "learn", "operate"];

export interface ScopeItem { label: string; used: number; total: number }
export interface Isc { text: string; verified: boolean }
export interface EngDeliverable { id: string; title: string; status: "todo" | "in-progress" | "verified"; isc?: string; ack: "pending" | "approved" | "changes" }
export interface EngFile { name: string; kind: string; from: "studio" | "client" }
export interface EngMeeting { title: string; when: string; link?: string; kind: string }
export interface EngInvoice { label: string; amount: number; status: "paid" | "upcoming" | "overdue"; date: string }

export interface Engagement {
  slug: string;
  tier: string; // Express | Standard | Build | Retainer | "Express + Retainer"
  feeUpfront?: number;
  mrr?: number;
  phase: Phase;
  status: string; // active-production | active-support | completed
  contact: string;
  startedAt: string;
  nextInvoice?: string;
  nextMeeting?: string;
  health: "active" | "at-risk" | "churn-risk";
  isa: { problem: string; vision: string; goal: string; constraints: string[] };
  targets: { label: string; pct: number }[];
  scope?: ScopeItem[]; // retainer cycle scope (null for build)
  iscs: Isc[];
  deliverables: EngDeliverable[];
  files: EngFile[];
  meetings: EngMeeting[];
  invoices: EngInvoice[];
}

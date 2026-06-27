"use client";
import { useStore } from "@/lib/store";

const FEATURES: Record<string, { title: string; body: string; backend: string }> = {
  login: {
    title: "Login & accounts",
    body: "Every operator and every client has their own login — that's exactly what makes the messaging multiplayer (teammates can DM and chat in real time). A client signs in and sees only their workspace; an operator sees the client spaces; an executive sees everything — the tiers you tried in “View as.” The demo just drops you straight in so you can explore without signing up.",
    backend: "Supabase Auth (email + magic link). What each person can see is enforced server-side by ~29 row-level-security policies — the access isn't a UI trick, it's at the database.",
  },
  businesses: {
    title: "Multiple businesses, fully separated",
    body: "One login, many businesses. Each business is its own organization with its own clients, workspaces, team, channels, and billing — nothing ever mixes. Run a studio, an agency, and a side venture from the same account; switch between them like switching companies.",
    backend: "Every row is scoped to an organization_id; RLS guarantees one business can never read another's data. Workspaces (clients) nest under the business, projects under workspaces, tasks under projects.",
  },
  calendar: {
    title: "Calendar → the admin's cost view",
    body: "A shared calendar for client work, meetings, and focus blocks, with 2-way Google sync. Because every task carries time and a rate, the schedule rolls straight into time-tracking → billing → the admin's cost view. You see the week and exactly what it costs, in one place.",
    backend: "calendar_events (synced via the Google API) + time_logs per task feed a costs rollup; estimates vs. actuals drive what's billable.",
  },
  costs: {
    title: "Costs board (executives only)",
    body: "The money view founders run on: collected revenue, MRR, AR aging, refunds, expenses, and partner settlements (who-owes-whom between co-founders). Locked to the executive tier — members and clients can't see it at all.",
    backend: "Live numbers from Stripe + the CRM arrive via webhooks into cost/settlement tables; pairwise balances are computed; the whole board is gated by RLS to exec-tier members.",
  },
  decisions: {
    title: "Decision log",
    body: "A durable record of every meaningful call — kill / pause / double-down — with the context, the options considered, the rationale, and the consequences. Scoped to the whole empire, a single business, or one project. So six months later you know not just what you did, but why.",
    backend: "A decisions table with scope-based access; the AI can read past decisions as grounding context before it acts.",
  },
  admin: {
    title: "Org & access admin",
    body: "Invite teammates and clients, set their tier (executive / member / external), and grant per-space roles (lead / contributor / viewer). This is where the access model you saw in “View as” is actually managed.",
    backend: "Email invites with one-time tokens; on signup the invite is consumed and the right org-membership + space-access rows are created. Enforced everywhere by RLS.",
  },
};

export function FullSystemModal() {
  const { state, dispatch } = useStore();
  const f = state.fullSystem ? FEATURES[state.fullSystem] : null;
  if (!f) return null;
  const close = () => dispatch({ type: "fullSystem", key: null });
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-6" onClick={close}>
      <div className="absolute inset-0 bg-ink/40" />
      <div className="relative w-[460px] max-w-[92vw] rounded-xl border border-line bg-paper shadow-xl p-5 animate-lane-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow text-clay">In the full system 🔒</span>
          <button onClick={close} aria-label="Close" className="text-muted hover:text-ink text-[16px]">×</button>
        </div>
        <h3 className="text-[19px] font-medium text-ink mb-2 tracking-tight">{f.title}</h3>
        <p className="text-[14px] text-ink-2 leading-relaxed mb-3">{f.body}</p>
        <div className="rounded-md border border-line px-3 py-2.5 mb-3">
          <div className="eyebrow text-clay mb-1">In our real system</div>
          <p className="text-[12.5px] text-ink-2 leading-relaxed">{f.backend}</p>
        </div>
        <div className="rounded-md bg-soft border border-line px-3 py-2.5 text-[12px] text-muted">
          We kept this demo deliberately specific so it stays clear and didn't go overboard — all of this lives in the full command center, not the demo.
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={close} className="text-[13px] bg-ink text-paper px-4 py-2 rounded-md">Got it</button>
        </div>
      </div>
    </div>
  );
}

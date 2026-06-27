"use client";
import { useState } from "react";
import { SPACES, OPERATORS } from "@/lib/studio";
import { Avatar } from "../Avatar";

type Tier = "executive" | "member" | "external";

interface Invite { email: string; tier: Tier; spaces: string[] }

const TIER_LABEL: Record<Tier, string> = { executive: "Executive", member: "Member", external: "External" };
const CLASS_TAG: Record<string, string> = { executive: "EXECUTIVE", internal: "INTERNAL", shared: "SHARED" };

// seed "members" = the studio team (mirrors the real org members list)
const MEMBERS = [
  { id: "jay" as const, tier: "executive", role: "owner" },
  { id: "shaq" as const, tier: "member", role: "" },
];

export function AdminView() {
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<Tier>("member");
  const [granted, setGranted] = useState<string[]>([]);
  const [pending, setPending] = useState<Invite[]>([]);
  const [flash, setFlash] = useState(false);

  const toggle = (slug: string) => setGranted((g) => (g.includes(slug) ? g.filter((s) => s !== slug) : [...g, slug]));
  const send = () => {
    if (!email.trim()) return;
    setPending((p) => [{ email: email.trim(), tier, spaces: granted }, ...p]);
    setEmail(""); setGranted([]); setTier("member");
    setFlash(true); setTimeout(() => setFlash(false), 1600);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-[22px] font-light tracking-tight text-ink mb-1">Studio — Members</h2>
        <p className="text-[13px] text-muted mb-6 pb-4 border-b border-line">Invite teammates, grant spaces, and manage access.</p>

        {/* Members */}
        <div className="eyebrow text-muted mb-2.5">Members</div>
        <div className="space-y-1.5 mb-7">
          {MEMBERS.map((m) => {
            const o = OPERATORS.find((x) => x.id === m.id)!;
            return (
              <div key={m.id} className="flex items-center gap-2.5 rounded-md border border-line bg-paper px-3 py-2">
                <Avatar id={m.id} size={26} />
                <span className="text-[13.5px] text-ink font-medium">{o.name}</span>
                <span className="text-[11px] text-muted">{o.role}</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <Badge>{TIER_LABEL[m.tier as Tier]}</Badge>
                  {m.role === "owner" && <Badge tone="clay">Owner</Badge>}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pending */}
        <div className="eyebrow text-muted mb-2.5">Pending invitations</div>
        {pending.length === 0 ? (
          <div className="text-[13px] text-muted mb-7">No pending invitations.</div>
        ) : (
          <div className="space-y-1.5 mb-7">
            {pending.map((inv, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-md border border-line bg-paper px-3 py-2 animate-lane-in">
                <span className="text-[13px] text-ink">{inv.email}</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <Badge>{TIER_LABEL[inv.tier]}</Badge>
                  <span className="text-[11px] text-muted">{inv.spaces.length} space{inv.spaces.length === 1 ? "" : "s"}</span>
                  <span className="text-[11px] text-warn">pending</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Invite form */}
        <div className="eyebrow text-muted mb-2.5">Invite a member</div>
        <div className="rounded-lg border border-line bg-paper p-4">
          <label className="block text-[12px] text-muted mb-1 font-mono">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" className="w-full bg-soft border border-line rounded-md px-3 py-2 text-[13.5px] text-ink outline-none mb-4" />

          <label className="block text-[12px] text-muted mb-1 font-mono">Tier</label>
          <select value={tier} onChange={(e) => setTier(e.target.value as Tier)} className="w-full bg-soft border border-line rounded-md px-3 py-2 text-[13.5px] text-ink outline-none mb-4">
            <option value="executive">Executive — sees everything, incl. Executive space</option>
            <option value="member">Member — client spaces only</option>
            <option value="external">External — only the spaces you grant</option>
          </select>

          <label className="block text-[12px] text-muted mb-2 font-mono">Grant spaces</label>
          <div className="space-y-2 mb-4">
            {SPACES.map((s) => (
              <label key={s.slug} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={granted.includes(s.slug)} onChange={() => toggle(s.slug)} className="accent-[var(--ink)]" />
                <span className="text-[13.5px] text-ink">{s.name}</span>
                <Badge>{CLASS_TAG[s.classification]}</Badge>
              </label>
            ))}
          </div>

          <button onClick={send} disabled={!email.trim()} className="w-full bg-ink text-paper rounded-md py-2.5 text-[13.5px] font-medium font-mono disabled:opacity-40">
            {flash ? "✓ Invite sent" : "Send invite"}
          </button>
        </div>
        <p className="text-[11px] text-muted mt-3">
          In the full system this emails a one-time invite; on signup the right org-membership + per-space access rows are created, enforced by row-level security. Here it's local to the demo.
        </p>
      </div>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: "clay" }) {
  return (
    <span className={`text-[9.5px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${tone === "clay" ? "border-clay/40 text-clay bg-clay/10" : "border-line text-muted bg-soft"}`}>
      {children}
    </span>
  );
}

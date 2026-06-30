"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { BETA, FOUNDERS } from "@/lib/promo";
import { RelayMark } from "./RelayMark";

function localSignups(): { name?: string }[] {
  try { return JSON.parse(localStorage.getItem("relay-beta") || "[]"); } catch { return []; }
}
function founderNames(): string[] {
  const local = localSignups().map((x) => (x.name || "").trim()).filter(Boolean);
  const seen = new Set<string>();
  return [...local, ...FOUNDERS].filter((n) => { const k = n.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}

function FounderStrip({ names }: { names: string[] }) {
  if (!names.length) return null;
  const show = names.slice(0, 6);
  const label = names.length <= 2
    ? `${names.join(" & ")} ${names.length === 1 ? "is" : "are"} building their folder`
    : `${names.slice(0, 2).join(", ")} and ${names.length - 2} more are building their folder`;
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-line bg-soft/50 px-3 py-2 mb-4">
      <div className="flex -space-x-2">
        {show.map((n, i) => (
          <span key={i} title={n} className="w-7 h-7 rounded-full border-2 border-paper bg-clay/15 text-clay text-[11px] font-semibold flex items-center justify-center">{n[0]?.toUpperCase()}</span>
        ))}
      </div>
      <span className="text-[12px] text-ink-2 leading-snug">{label}</span>
    </div>
  );
}

export function BetaModal() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [use, setUse] = useState("");
  const [tier, setTier] = useState("explore");
  const [sent, setSent] = useState(false);

  if (!state.beta) return null;
  const close = () => dispatch({ type: "beta", on: false });
  const first = name.trim().split(/\s+/)[0] || "you";

  const submit = () => {
    if (!email.trim() || !name.trim()) return;
    const payload = { name: name.trim(), email: email.trim(), use, tier, at: new Date().toISOString(), source: "relay-beta" };
    try {
      const all = localSignups();
      all.push(payload);
      localStorage.setItem("relay-beta", JSON.stringify(all));
    } catch {}
    if (BETA.endpoint) {
      fetch(BETA.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
    }
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-6" onClick={close}>
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" />
      <div className="relative w-[480px] max-w-[93vw] rounded-2xl border border-line bg-paper shadow-2xl p-6 animate-lane-in" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-6">
            <div className="flex justify-center mb-4 text-ink"><RelayMark size={40} /></div>
            <div className="text-[17px] text-ink font-medium mb-2">You're in, {first} — founding member.</div>
            <p className="text-[13.5px] text-ink-2 max-w-xs mx-auto mb-5">We onboard a few teams at a time so each setup is sharp. We'll reach out when your spot opens.</p>
            <div className="max-w-xs mx-auto"><FounderStrip names={founderNames()} /></div>
            <button onClick={close} className="text-[13px] bg-ink text-paper px-5 py-2 rounded-md">Back to the demo</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-ink"><RelayMark size={26} /><span className="eyebrow text-clay">Private beta</span></div>
              <button onClick={close} aria-label="Close" className="text-muted hover:text-ink text-[16px]">×</button>
            </div>
            <h3 className="text-[21px] font-medium text-ink tracking-tight mb-1">{BETA.headline}</h3>
            <p className="text-[13px] text-muted mb-3">{BETA.sub}</p>

            <FounderStrip names={founderNames()} />

            <p className="text-[13.5px] text-ink-2 leading-relaxed mb-3">{BETA.body}</p>

            <button onClick={() => { close(); dispatch({ type: "builder", on: true }); }} className="w-full text-left rounded-lg border border-clay/40 bg-clay/[0.07] px-3.5 py-2.5 mb-4 hover:bg-clay/10 group">
              <span className="text-[13px] text-ink font-medium">Want it now? Build your folder →</span>
              <span className="block text-[11.5px] text-muted">A 2-minute generator scaffolds your whole ICM folder from your business — download it free, no email.</span>
            </button>
            <div className="text-[11px] text-muted mb-3 font-mono">— or join the beta for white-glove onboarding —</div>

            <div className="grid grid-cols-2 gap-2.5 mb-3.5">
              <div>
                <label className="block text-[12px] text-muted mb-1 font-mono">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-soft border border-line rounded-md px-3 py-2 text-[13.5px] text-ink outline-none focus:border-ink-2/50" />
              </div>
              <div>
                <label className="block text-[12px] text-muted mb-1 font-mono">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-soft border border-line rounded-md px-3 py-2 text-[13.5px] text-ink outline-none focus:border-ink-2/50" />
              </div>
            </div>

            <label className="block text-[12px] text-muted mb-1 font-mono">What would you run it on?</label>
            <input value={use} onChange={(e) => setUse(e.target.value)} placeholder="e.g. my design studio, my law practice, support…" className="w-full bg-soft border border-line rounded-md px-3 py-2 text-[13.5px] text-ink outline-none mb-3.5 focus:border-ink-2/50" />

            <label className="block text-[12px] text-muted mb-2 font-mono">Would you support it?</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {BETA.tiers.map((t) => (
                <button key={t.id} onClick={() => setTier(t.id)} className={`text-left text-[12.5px] rounded-md border px-3 py-2 transition ${tier === t.id ? "border-clay bg-clay/10 text-ink" : "border-line text-ink-2 hover:border-ink-2/40"}`}>
                  <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle ${tier === t.id ? "bg-clay" : "bg-line"}`} />{t.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted leading-snug mb-3">{BETA.donate}</p>
            <p className="text-[10.5px] text-muted mb-4">🔒 Your name + email go only to the studio (never shown publicly).</p>

            <div className="flex justify-end gap-2">
              <button onClick={close} className="text-[13px] text-ink-2 px-3 py-2 rounded-md hover:bg-soft">Maybe later</button>
              <button onClick={submit} disabled={!email.trim() || !name.trim()} className="text-[13px] bg-clay text-white px-5 py-2 rounded-md font-medium disabled:opacity-40">Request early access</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

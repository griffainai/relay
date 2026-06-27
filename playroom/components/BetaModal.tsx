"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { BETA } from "@/lib/promo";
import { RelayMark } from "./RelayMark";

export function BetaModal() {
  const { state, dispatch } = useStore();
  const [email, setEmail] = useState("");
  const [use, setUse] = useState("");
  const [tier, setTier] = useState("explore");
  const [sent, setSent] = useState(false);

  if (!state.beta) return null;
  const close = () => dispatch({ type: "beta", on: false });
  const submit = () => {
    if (!email.trim()) return;
    const payload = { email: email.trim(), use, tier, at: new Date().toISOString(), source: "relay-beta" };
    try {
      const all = JSON.parse(localStorage.getItem("relay-beta") || "[]");
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
          <div className="text-center py-8">
            <div className="flex justify-center mb-4 text-ink"><RelayMark size={40} /></div>
            <div className="text-[17px] text-ink font-medium mb-2">You're on the list.</div>
            <p className="text-[13.5px] text-ink-2 max-w-xs mx-auto mb-5">We onboard a few teams at a time so each setup is sharp. We'll reach out when your spot opens.</p>
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
            <p className="text-[13.5px] text-ink-2 leading-relaxed mb-4">{BETA.body}</p>

            <label className="block text-[12px] text-muted mb-1 font-mono">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-soft border border-line rounded-md px-3 py-2 text-[13.5px] text-ink outline-none mb-3.5 focus:border-ink-2/50" />

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
            <p className="text-[11px] text-muted leading-snug mb-4">{BETA.donate}</p>

            <div className="flex justify-end gap-2">
              <button onClick={close} className="text-[13px] text-ink-2 px-3 py-2 rounded-md hover:bg-soft">Maybe later</button>
              <button onClick={submit} disabled={!email.trim()} className="text-[13px] bg-clay text-white px-5 py-2 rounded-md font-medium disabled:opacity-40">Request early access</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

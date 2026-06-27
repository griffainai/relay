"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";

// To COLLECT reviews privately (no backend): create a free Formspree form and
// paste its URL here, e.g. "https://formspree.io/f/abcdwxyz". They land in your
// Formspree inbox/dashboard. Empty = local-only (visitor's browser).
const FEEDBACK_ENDPOINT = "";

export function ReviewModal() {
  const { state, dispatch } = useStore();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [like, setLike] = useState("");
  const [improve, setImprove] = useState("");
  const [sent, setSent] = useState(false);

  if (!state.review) return null;
  const close = () => dispatch({ type: "review", on: false });
  const submit = () => {
    const payload = { stars, like, improve, at: new Date().toISOString(), source: "relay-demo" };
    try {
      const all = JSON.parse(localStorage.getItem("relay-feedback") || "[]");
      all.push(payload);
      localStorage.setItem("relay-feedback", JSON.stringify(all));
    } catch {}
    if (FEEDBACK_ENDPOINT) {
      fetch(FEEDBACK_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
    }
    setSent(true);
    setTimeout(close, 1600);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6" onClick={close}>
      <div className="absolute inset-0 bg-ink/40" />
      <div className="relative w-[460px] max-w-[92vw] rounded-xl border border-line bg-paper shadow-xl p-5 animate-lane-in" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🙏</div>
            <div className="text-[15px] text-ink font-medium">Thank you — that helps a lot.</div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="eyebrow text-clay">Quick review</div>
              <button onClick={close} aria-label="Close" className="text-muted hover:text-ink text-[16px]">×</button>
            </div>
            <h3 className="text-[18px] font-medium text-ink mb-1">How was the Relay demo?</h3>
            <p className="text-[12.5px] text-muted mb-4">30 seconds — it genuinely shapes where this goes.</p>

            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setStars(n)} className="text-[26px] leading-none transition-transform hover:scale-110" style={{ color: (hover || stars) >= n ? "var(--clay)" : "var(--line)" }} aria-label={`${n} stars`}>★</button>
              ))}
            </div>

            <label className="block text-[12px] text-muted mb-1">What did you like?</label>
            <textarea value={like} onChange={(e) => setLike(e.target.value)} rows={2} className="w-full bg-soft border border-line rounded-md px-2.5 py-2 text-[13px] text-ink outline-none mb-3 resize-none" />
            <label className="block text-[12px] text-muted mb-1">What could we do better?</label>
            <textarea value={improve} onChange={(e) => setImprove(e.target.value)} rows={2} className="w-full bg-soft border border-line rounded-md px-2.5 py-2 text-[13px] text-ink outline-none mb-4 resize-none" />

            <div className="flex justify-end gap-2">
              <button onClick={close} className="text-[13px] text-ink-2 px-3 py-2 rounded-md hover:bg-soft">Maybe later</button>
              <button onClick={submit} disabled={!stars} className="text-[13px] bg-ink text-paper px-4 py-2 rounded-md disabled:opacity-40">Send feedback</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { RelayMark } from "./RelayMark";

export function ConnectModal() {
  const { state, dispatch } = useStore();
  const [val, setVal] = useState("");
  if (!state.connect) return null;
  const close = () => dispatch({ type: "connect", on: false });
  const connected = !!state.apiKey;

  const save = () => {
    const k = val.trim();
    if (!k) return;
    try { localStorage.setItem("relay-key", k); } catch {}
    dispatch({ type: "key", key: k });
    close();
  };
  const disconnect = () => {
    try { localStorage.removeItem("relay-key"); } catch {}
    dispatch({ type: "key", key: undefined });
    setVal("");
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-6" onClick={close}>
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" />
      <div className="relative w-[470px] max-w-[93vw] rounded-2xl border border-line bg-paper shadow-2xl p-6 animate-lane-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-ink"><RelayMark size={26} /><span className="eyebrow text-clay">Run it live</span></div>
          <button onClick={close} aria-label="Close" className="text-muted hover:text-ink text-[16px]">×</button>
        </div>
        <h3 className="text-[20px] font-medium text-ink tracking-tight mb-1">Connect your own Claude key.</h3>
        <p className="text-[13.5px] text-ink-2 leading-relaxed mb-4">
          Paste your Anthropic API key and Relay will run the task <strong className="text-ink font-medium">for real</strong> — Claude reads the folder's rules and the client's context, then clears it or escalates. This is exactly how the app works: <strong className="text-ink font-medium">your key, your folder, your data.</strong>
        </p>

        <label className="block text-[12px] text-muted mb-1 font-mono">Anthropic API key</label>
        <input
          type="password"
          value={connected && !val ? "•••••••••••••••• connected" : val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="sk-ant-…"
          className="w-full bg-soft border border-line rounded-md px-3 py-2 text-[13px] font-mono text-ink outline-none mb-3 focus:border-ink-2/50"
        />

        <div className="rounded-md border border-line bg-soft/60 px-3 py-2.5 text-[11.5px] text-muted leading-relaxed mb-4">
          🔒 Your key stays in <strong className="text-ink-2">this browser only</strong> (localStorage) and is sent <strong className="text-ink-2">only to Anthropic</strong> — never to us, never committed. You pay Anthropic directly for what Claude does. Get a key at <span className="text-ink-2">console.anthropic.com</span>. Remove it anytime.
        </div>

        <div className="flex justify-between items-center">
          {connected ? <button onClick={disconnect} className="text-[12.5px] text-crit/80 hover:text-crit">Disconnect key</button> : <span />}
          <div className="flex gap-2">
            <button onClick={close} className="text-[13px] text-ink-2 px-3 py-2 rounded-md hover:bg-soft">Cancel</button>
            <button onClick={save} disabled={!val.trim()} className="text-[13px] bg-clay text-white px-5 py-2 rounded-md font-medium disabled:opacity-40">Connect & run live</button>
          </div>
        </div>
      </div>
    </div>
  );
}

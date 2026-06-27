"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { RelayMark } from "./RelayMark";
import { generateFolder, slug, type BizInput } from "@/lib/generate";
import { SCHOOL } from "@/lib/promo";

const DEFAULT_CLEARS = ["Answer questions from the folder", "Draft or edit copy in our voice", "Update a section or page", "Summarize a document", "Schedule from known options"];
const DEFAULT_ESC = ["Anything that costs money or sets pricing", "Publishing or going live", "Sending something outbound to a client", "Legal, contract, or compliance", "Anything irreversible"];

export function FolderBuilder() {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [biz, setBiz] = useState("");
  const [what, setWhat] = useState("");
  const [voice, setVoice] = useState("");
  const [solo, setSolo] = useState(true);
  const [clients, setClients] = useState([{ name: "", work: "" }]);
  const [clears, setClears] = useState<string[]>(DEFAULT_CLEARS);
  const [escalates, setEscalates] = useState<string[]>(DEFAULT_ESC);
  const [addClear, setAddClear] = useState("");
  const [addEsc, setAddEsc] = useState("");
  const [done, setDone] = useState(false);

  if (!state.builder) return null;
  const close = () => dispatch({ type: "builder", on: false });

  const input: BizInput = { biz: biz || "My business", what, voice, solo, clients, clears, escalates };
  const files = generateFolder(input);

  const download = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = `${slug(biz || "my")}-relay`;
    files.forEach((f) => zip.file(`${folder}/${f.path}`, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${folder}.zip`; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    setDone(true);
  };

  const can = step === 0 ? !!biz.trim() && !!what.trim() : true;

  return (
    <div className="fixed inset-0 z-[88] bg-[#0B0B0C] overflow-y-auto p-6 animate-lane-in">
      <div className="max-w-2xl mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 text-white"><RelayMark size={28} /><span className="eyebrow text-clay">Build your folder</span></div>
          <button onClick={close} className="text-white/50 hover:text-white text-[14px]">✕ Close</button>
        </div>

        {/* progress */}
        <div className="flex gap-1.5 mb-7">
          {["Your business", "Your clients", "What clears vs escalates", "Download"].map((label, i) => (
            <div key={label} className="flex-1">
              <div className="h-1 rounded-full transition-all" style={{ background: i <= step ? "var(--clay)" : "rgba(255,255,255,0.15)" }} />
              <div className={`text-[10.5px] mt-1.5 ${i === step ? "text-white" : "text-white/40"}`}>{label}</div>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4 animate-lane-in">
            <h2 className="text-white text-2xl font-light tracking-tight">Tell me about your business.</h2>
            <Field label="Business name"><Inp value={biz} onChange={setBiz} placeholder="e.g. Northwind HVAC, my design studio…" /></Field>
            <Field label="What you do (one line)"><Inp value={what} onChange={setWhat} placeholder="e.g. We design and run websites for local trades." /></Field>
            <Field label="Your voice (a few words)"><Inp value={voice} onChange={setVoice} placeholder="e.g. Plain, warm, no jargon. Confident, never salesy." /></Field>
            <div className="flex gap-2">
              {[{ k: true, l: "Solo operator" }, { k: false, l: "Small team" }].map((o) => (
                <button key={o.l} onClick={() => setSolo(o.k)} className={`text-[13px] rounded-md border px-4 py-2 ${solo === o.k ? "border-clay bg-clay/15 text-white" : "border-white/15 text-white/60 hover:text-white"}`}>{o.l}</button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3 animate-lane-in">
            <h2 className="text-white text-2xl font-light tracking-tight">Who do you do the work for?</h2>
            <p className="text-white/55 text-[13.5px]">Each becomes a folder with its own context, goals, and requests. Add a couple — or skip if it's just you.</p>
            {clients.map((c, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Inp value={c.name} onChange={(v) => setClients((cs) => cs.map((x, j) => j === i ? { ...x, name: v } : x))} placeholder="Client / project name" />
                <Inp value={c.work} onChange={(v) => setClients((cs) => cs.map((x, j) => j === i ? { ...x, work: v } : x))} placeholder="what you do for them" />
                {clients.length > 1 && <button onClick={() => setClients((cs) => cs.filter((_, j) => j !== i))} className="text-white/40 hover:text-white text-[18px] px-1">×</button>}
              </div>
            ))}
            <button onClick={() => setClients((cs) => [...cs, { name: "", work: "" }])} className="text-[13px] text-clay hover:underline">+ Add another</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-lane-in">
            <h2 className="text-white text-2xl font-light tracking-tight">What should clear itself — and what never should?</h2>
            <p className="text-white/55 text-[13.5px]">This becomes your <span className="text-white">rules.md</span> — the lane protocol. Edit freely.</p>
            <Lane title="🟢 Clear automatically" tone="ok" items={clears} setItems={setClears} add={addClear} setAdd={setAddClear} />
            <Lane title="🔴 Always escalate to a human" tone="crit" items={escalates} setItems={setEscalates} add={addEsc} setAdd={setAddEsc} />
          </div>
        )}

        {step === 3 && (
          <div className="animate-lane-in">
            {done ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4 text-white"><RelayMark size={40} /></div>
                <h2 className="text-white text-2xl font-light tracking-tight mb-2">Your folder is downloading.</h2>
                <p className="text-white/65 text-[14px] max-w-md mx-auto mb-6">That's your operator. Two ways to use it — both in <span className="text-white font-mono text-[12.5px]">START-HERE.md</span>:</p>
                <div className="grid sm:grid-cols-2 gap-3 text-left mb-6">
                  <div className="rounded-xl border border-white/12 p-4"><div className="eyebrow text-clay mb-1.5">Instant</div><div className="text-white/75 text-[13px] leading-snug">Drop the folder into a Claude Project. It reads the rules and becomes your operator — no install.</div></div>
                  <div className="rounded-xl border border-white/12 p-4"><div className="eyebrow text-clay mb-1.5">Your own app</div><div className="text-white/75 text-[13px] leading-snug">Clone the repo, put the folder in <span className="font-mono text-[11.5px]">studio/</span>, <span className="font-mono text-[11.5px]">npm run dev</span>, connect your key — the same UI, your data.</div></div>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button onClick={download} className="text-white/75 px-5 py-2.5 rounded-lg text-[14px] border border-white/20 hover:text-white">Download again</button>
                  <button onClick={() => dispatch({ type: "beta", on: true })} className="bg-clay text-white px-5 py-2.5 rounded-lg text-[14px] font-medium">Join the beta for onboarding help →</button>
                </div>
                <p className="text-white/45 text-[12px] mt-5">The structure's done. The quality is what you put in it — <a href={SCHOOL.url} target="_blank" rel="noreferrer" className="text-clay hover:underline">that craft is ICM</a>.</p>
              </div>
            ) : (
              <>
                <h2 className="text-white text-2xl font-light tracking-tight mb-1">Here's your folder.</h2>
                <p className="text-white/55 text-[13.5px] mb-4">{files.length} files, scaffolded from your answers. Download it, fill in the depth, and it's your operator.</p>
                <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4 max-h-[300px] overflow-y-auto font-mono text-[12px] text-white/70 mb-5">
                  {files.map((f) => <div key={f.path} className="py-0.5">📄 {slug(biz || "my")}-relay/{f.path}</div>)}
                </div>
                <button onClick={download} className="bg-clay text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:opacity-90">↓ Download your folder (.zip)</button>
              </>
            )}
          </div>
        )}

        {/* nav */}
        {!(step === 3 && done) && (
          <div className="flex items-center gap-3 mt-8 pt-5 border-t border-white/10">
            {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="text-white/60 hover:text-white text-[14px]">← Back</button>}
            {step < 3 && <button onClick={() => can && setStep((s) => s + 1)} disabled={!can} className="bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-lg text-[14px] disabled:opacity-40 ml-auto">{step === 2 ? "Generate my folder →" : "Next →"}</button>}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-[12px] text-white/50 mb-1.5 font-mono">{label}</div>{children}</label>;
}
function Inp({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white/[0.05] border border-white/12 rounded-md px-3 py-2 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-clay/60" />;
}
function Lane({ title, tone, items, setItems, add, setAdd }: { title: string; tone: "ok" | "crit"; items: string[]; setItems: (f: (x: string[]) => string[]) => void; add: string; setAdd: (v: string) => void }) {
  const color = tone === "ok" ? "#3FB36B" : "#D9544D";
  const commit = () => { if (add.trim()) { setItems((x) => [...x, add.trim()]); setAdd(""); } };
  return (
    <div className="rounded-xl border border-white/12 p-4">
      <div className="text-[13px] font-medium mb-2.5" style={{ color }}>{title}</div>
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-[12px] rounded-full border border-white/15 text-white/75 pl-2.5 pr-1.5 py-1">
            {it}<button onClick={() => setItems((x) => x.filter((_, j) => j !== i))} className="text-white/40 hover:text-white">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={add} onChange={(e) => setAdd(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commit()} placeholder="add your own…" className="flex-1 bg-white/[0.05] border border-white/12 rounded-md px-3 py-1.5 text-[13px] text-white placeholder:text-white/30 outline-none" />
        <button onClick={commit} className="text-[13px] text-white/70 border border-white/15 rounded-md px-3 hover:text-white">Add</button>
      </div>
    </div>
  );
}

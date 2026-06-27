"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { SPACES, ENGAGEMENTS, engagementFor } from "@/lib/studio";
import { taskToMarkdown } from "@/lib/serialize";
import type { Task } from "@/lib/types";

interface Node { name: string; path: string; type: "dir" | "file"; children?: Node[]; content?: string }

function clientTree(slug: string, name: string, tasks: Task[]): Node {
  const eng = engagementFor(slug);
  const reqs = tasks.filter((t) => t.spaceSlug === slug);
  const base = `clients/${slug}`;
  const file = (n: string, content: string): Node => ({ name: n, path: `${base}/${n}`, type: "file", content });
  const kids: Node[] = [
    file("account.md", `# ${name} — account\n- contact: ${eng?.contact ?? "—"}\n- login: client (external tier)\n- access: this workspace only — enforced by RLS\n- plan: ${eng?.tier ?? "—"}`),
    file("_ENGAGEMENT.md", eng ? `# ${name}\n- tier: ${eng.tier}\n- fee: ${eng.feeUpfront ? "$" + eng.feeUpfront : "—"}${eng.mrr ? " + $" + eng.mrr + "/mo" : ""}\n- phase: ${eng.phase}\n- status: ${eng.status}\n- started: ${eng.startedAt}\n- next meeting: ${eng.nextMeeting ?? "—"}` : "# engagement"),
    file("CONTEXT.md", `# Context — ${name}\n## Voice\n${(SPACES.find((s) => s.slug === slug)?.ctx.voice ?? []).map((v) => "- " + v).join("\n")}\n## Constraints\n${(SPACES.find((s) => s.slug === slug)?.ctx.constraints ?? []).map((v) => "- " + v).join("\n")}`),
    file("GOALS.md", eng ? `# Goals (the ISA)\n## Problem\n${eng.isa.problem}\n## Vision\n${eng.isa.vision}\n## Goal\n${eng.isa.goal}\n## Guardrails\n${eng.isa.constraints.map((c) => "- " + c).join("\n")}` : "# goals"),
    file("PLAN.md", eng ? `# Plan\n- tier: ${eng.tier}\n${eng.scope ? "## Monthly scope\n" + eng.scope.map((s) => `- ${s.label}: ${s.used}/${s.total}`).join("\n") : "- scope: fixed build"}` : "# plan"),
    file("STATE.md", `# State — ${name}\n${reqs.map((t) => `- [${t.status === "complete" ? "x" : " "}] ${t.id} — ${t.title} (${t.status})`).join("\n") || "- (empty)"}`),
    { name: "requests", path: `${base}/requests`, type: "dir", children: reqs.map((t) => ({ name: `${t.id}.md`, path: `${base}/requests/${t.id}.md`, type: "file" as const, content: taskToMarkdown(t) })) },
  ];
  if (eng) {
    kids.push({ name: "deliverables", path: `${base}/deliverables`, type: "dir", children: eng.deliverables.map((d) => ({ name: `${d.id}.md`, path: `${base}/deliverables/${d.id}.md`, type: "file" as const, content: `# ${d.title}\n- status: ${d.status}\n- client: ${d.ack}\n${d.isc ? "- verifies: " + d.isc : ""}` })) });
    kids.push({ name: "files", path: `${base}/files`, type: "dir", children: eng.files.map((f) => ({ name: f.name, path: `${base}/files/${f.name}`, type: "file" as const, content: `(binary asset · ${f.kind} · from ${f.from})` })) });
    kids.push({ name: "meetings", path: `${base}/meetings`, type: "dir", children: eng.meetings.map((m, i) => ({ name: `meeting-${i + 1}.md`, path: `${base}/meetings/${i}.md`, type: "file" as const, content: `# ${m.title}\n- when: ${m.when}\n- link: ${m.link}\n- kind: ${m.kind}` })) });
  }
  return { name: slug, path: base, type: "dir", children: kids };
}

const ICM: Node = {
  name: "relay  (the brain)", path: "relay", type: "dir", children: [
    { name: "CLAUDE.md", path: "relay/CLAUDE.md", type: "file", content: "# The Map (Layer 1)\nAlways loaded. Routes the agent: when X, read Y, then Z. Holds directions, not knowledge." },
    { name: "identity.md", path: "relay/identity.md", type: "file", content: "# Identity\nMost tools track. You finish. Relay completes the routine work and escalates what needs a human." },
    { name: "rules.md", path: "relay/rules.md", type: "file", content: "# The Lane Protocol\nSort every request: 🟢 clear / 🟡 hold / 🔴 escalate. A refusal list. This file is the engine." },
    { name: "reference", path: "relay/reference", type: "dir", children: [
      { name: "playbook.md", path: "relay/reference/playbook.md", type: "file", content: "# Playbook\nThe request types Relay may CLEAR. Not listed → escalate." },
      { name: "lane-protocol.md", path: "relay/reference/lane-protocol.md", type: "file", content: "# Lane Protocol\nThe full decision tree behind clear / hold / escalate." },
    ] },
    { name: "rooms", path: "relay/rooms", type: "dir", children: ["intake", "delivery", "escalations"].map((r) => ({ name: `${r}/CONTEXT.md`, path: `relay/rooms/${r}`, type: "file" as const, content: `# Room — ${r}\nLoaded when the agent enters this stage of work.` })) },
    { name: "skills", path: "relay/skills", type: "dir", children: ["copy-edit", "content-update", "seo-meta"].map((s) => ({ name: `${s}/SKILL.md`, path: `relay/skills/${s}`, type: "file" as const, content: `# Skill — ${s}\nLoaded only when a task needs it.` })) },
  ],
};

export function FolderView() {
  const { state } = useStore();
  const studio: Node = {
    name: "studio", path: "studio", type: "dir", children: [
      { name: "STATE.md", path: "studio/STATE.md", type: "file", content: `# Studio board\n${state.tasks.length} tasks across ${SPACES.length} spaces.` },
      { name: "team/people.md", path: "studio/team/people.md", type: "file", content: "# Team\n- @alex — lead\n- @sam — build\n- @relay — the AI operator" },
      { name: "clients", path: "studio/clients", type: "dir", children: SPACES.filter((s) => s.kind === "client").map((s) => clientTree(s.slug, s.name, state.tasks)) },
    ],
  };
  const roots = [studio, ICM];
  const [open, setOpen] = useState<Set<string>>(new Set(["studio", "studio/clients", "clients/northwind", "clients/northwind/requests"]));
  const [sel, setSel] = useState<Node | null>(null);
  const toggle = (p: string) => setOpen((o) => { const n = new Set(o); n.has(p) ? n.delete(p) : n.add(p); return n; });

  const Row = ({ node, depth }: { node: Node; depth: number }) => {
    const isOpen = open.has(node.path);
    return (
      <>
        <button
          onClick={() => (node.type === "dir" ? toggle(node.path) : setSel(node))}
          className={`w-full text-left flex items-center gap-1.5 py-1 px-2 rounded text-[12.5px] hover:bg-soft ${sel?.path === node.path ? "bg-soft text-ink" : "text-ink-2"}`}
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          <span className="text-muted w-3">{node.type === "dir" ? (isOpen ? "▾" : "▸") : ""}</span>
          <span>{node.type === "dir" ? "📁" : "📄"}</span>
          <span className={node.type === "dir" ? "font-medium text-ink" : "font-mono"}>{node.name}</span>
        </button>
        {node.type === "dir" && isOpen && node.children?.map((c) => <Row key={c.path} node={c} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="px-6 pt-6 pb-3 shrink-0">
        <h2 className="text-[22px] font-light tracking-tight text-ink mb-1">It's all folders.</h2>
        <p className="text-[13.5px] text-ink-2 max-w-2xl">Every single thing you've used — every request, deliverable, goal, message, invoice, meeting, and the AI itself — is a markdown file in a folder you own. No database is the source of truth. <span className="text-ink">This is the entire product, as files.</span> Click any file.</p>
      </div>
      <div className="flex-1 flex overflow-hidden border-t border-line">
        <div className="w-[300px] shrink-0 border-r border-line overflow-y-auto py-2 bg-soft/30">
          {roots.map((r) => <Row key={r.path} node={r} depth={0} />)}
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {sel ? (
            <>
              <div className="font-mono text-[11.5px] text-muted mb-3 flex items-center gap-1.5"><span>📄</span>{sel.path}{sel.name.endsWith(".md") || sel.name.includes("/") ? "" : ""}</div>
              <pre className="text-[12.5px] font-mono text-ink-2 whitespace-pre-wrap leading-relaxed">{sel.content}</pre>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-sm">
                <div className="text-4xl mb-3">📁</div>
                <div className="text-[14px] text-ink-2">Pick any file on the left. A request, a goal, a deliverable, the rules the AI runs on — all of it is just text in a folder. That's the whole methodology.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

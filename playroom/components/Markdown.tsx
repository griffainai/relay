/**
 * A tiny, dependency-free markdown renderer — enough for deliverables,
 * notes, and the brain panel (bold, blockquote, lists, headings, code).
 */
function inline(s: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**"))
      parts.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`"))
      parts.push(
        <code key={k++} className="font-mono text-[12.5px] bg-soft px-1 py-0.5 rounded">
          {tok.slice(1, -1)}
        </code>
      );
    else parts.push(<span key={k++} className="text-clay">{tok.slice(1, -1)}</span>);
    last = m.index + tok.length;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}

export function Markdown({ children }: { children: string }) {
  const lines = (children || "").split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (k: number) => {
    if (list.length) {
      out.push(
        <ul key={`ul${k}`} className="my-1.5 space-y-1 pl-4">
          {list.map((li, i) => (
            <li key={i} className="list-disc text-ink-2 text-[13.5px] leading-relaxed">
              {inline(li)}
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.replace(/\s+$/, "");
    if (/^\s*[-*]\s+/.test(line)) {
      list.push(line.replace(/^\s*[-*]\s+/, ""));
      return;
    }
    flush(i);
    if (!line.trim()) {
      out.push(<div key={i} className="h-2" />);
    } else if (line.startsWith("> ")) {
      out.push(
        <blockquote
          key={i}
          className="border-l-2 border-clay/50 pl-3 my-1.5 text-ink italic text-[14px]"
        >
          {inline(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith("### ")) {
      out.push(<h4 key={i} className="eyebrow text-muted mt-3 mb-1">{line.slice(4)}</h4>);
    } else if (line.startsWith("## ")) {
      out.push(<h3 key={i} className="font-medium text-ink mt-3 mb-1 text-[14px]">{line.slice(3)}</h3>);
    } else if (line.startsWith("# ")) {
      out.push(<h2 key={i} className="font-medium text-ink text-[15px] mt-2 mb-1">{line.slice(2)}</h2>);
    } else {
      out.push(
        <p key={i} className="text-ink-2 text-[13.5px] leading-relaxed">
          {inline(line)}
        </p>
      );
    }
  });
  flush(9999);
  return <div className="space-y-0.5">{out}</div>;
}

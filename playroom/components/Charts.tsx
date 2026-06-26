"use client";

export function Sparkline({ data, color = "var(--clay)", w = 72, h = 22 }: { data: number[]; color?: string; w?: number; h?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / span) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AreaChart({ data, color = "var(--clay)", w = 420, h = 130 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const max = Math.max(...data, 1);
  const pad = 6;
  const iw = w - pad * 2;
  const ih = h - pad * 2;
  const pt = (d: number, i: number) => [pad + (i / (data.length - 1)) * iw, pad + ih - (d / max) * ih];
  const line = data.map((d, i) => pt(d, i).join(",")).join(" ");
  const first = pt(data[0], 0);
  const last = pt(data[data.length - 1], data.length - 1);
  const area = `${pad},${pad + ih} ${line} ${last[0]},${pad + ih}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#areaFill)" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={first[0]} cy={first[1]} r="2.5" fill={color} opacity="0.5" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

export function Donut({ segments, size = 132, thickness = 16 }: { segments: { value: number; color: string; label: string }[]; size?: number; thickness?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="shrink-0">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={thickness} />
          {segments.map((s, i) => {
            const len = (s.value / total) * C;
            const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
            offset += len;
            return el;
          })}
        </g>
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="fill-ink" style={{ fontSize: 22, fontWeight: 300 }}>{total}</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-[12px]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-ink-2 w-24">{s.label}</span>
            <span className="text-ink font-medium">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The Relay mark — a new glyph in the Onyx geometric-mono language
 * (NOT the Routed Route mark; Relay needs its own).
 *
 * Concept: an open ring (incoming request) → a short path →
 * a filled node with a check-arc (relayed to done).
 * Monochrome, currentColor, stroke-width 3 at 40u.
 */
export function RelayMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      {/* incoming request — open ring */}
      <circle cx="11" cy="11" r="4.6" stroke="currentColor" strokeWidth="3" />
      {/* the relay path — one decisive turn */}
      <path
        d="M11 15.6V29h13.4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* done — filled node */}
      <circle cx="29" cy="29" r="4.6" fill="currentColor" />
      {/* the check — work completed */}
      <path
        d="M26.7 29l1.6 1.6 2.8-3.1"
        stroke="var(--paper)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RelayWordmark({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5 text-ink">
      <RelayMark size={size} />
      <span className="wordmark text-[15px]">
        REL<span className="text-clay">A</span>Y<span className="text-[8px] align-super ml-0.5 text-muted tracking-normal">™</span>
      </span>
    </div>
  );
}

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        muted: "var(--muted)",
        line: "var(--line)",
        soft: "var(--soft)",
        paper: "var(--paper)",
        clay: {
          DEFAULT: "var(--clay)",
          soft: "var(--clay-soft)",
          deep: "var(--clay-deep)",
        },
        ok: "var(--ok)",
        warn: "var(--warn)",
        crit: "var(--crit)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: { DEFAULT: "6px" },
      maxWidth: { shell: "1480px" },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(11,11,12,0.05)",
        md: "0 4px 6px -1px rgba(11,11,12,0.08), 0 2px 4px -1px rgba(11,11,12,0.05)",
        lg: "0 10px 15px -3px rgba(11,11,12,0.10)",
        xl: "0 12px 48px rgba(11,11,12,0.14)",
      },
      transitionTimingFunction: { snap: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
      keyframes: {
        "lane-in": {
          "0%": { opacity: "0", transform: "translateY(6px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pulse-clay": {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(164,86,31,0.0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(164,86,31,0.12)" },
        },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
      },
      animation: {
        "lane-in": "lane-in 280ms cubic-bezier(0.2,0.8,0.2,1)",
        "pulse-clay": "pulse-clay 1.6s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;

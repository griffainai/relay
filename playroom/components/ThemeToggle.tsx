"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("relay-theme", next ? "dark" : "light");
    } catch {}
  };
  return (
    <button
      onClick={toggle}
      title="Toggle theme"
      aria-label="Toggle light/dark theme"
      className="w-9 h-9 rounded-md border border-line text-ink-2 flex items-center justify-center hover:border-ink-2/50 transition text-[13px]"
    >
      {dark ? "☾" : "☀"}
    </button>
  );
}

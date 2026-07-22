"use client";

import { useEffect, useState } from "react";
import { CommandPalette } from "./CommandPalette";

// Owns the palette's open state so both triggers (the header button and the
// Cmd/Ctrl+K keydown) stay in sync without a separate context module — a plain
// lifted `useState` here is enough for two siblings (YAGNI per task-12-brief.md).
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {children}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir busca (Cmd+K)"
        className="fixed right-5 top-5 z-40 flex items-center gap-2 rounded-md border border-border bg-surface2 px-3 py-1.5 text-xs text-muted transition hover:text-text"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
          <path
            d="M9 16A7 7 0 1 0 9 2a7 7 0 0 0 0 14ZM18 18l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        Pesquisar
        <kbd className="rounded border border-dim bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">
          ⌘K
        </kbd>
      </button>
      {/* Esc-to-close comes for free from Radix Dialog inside Command.Dialog. */}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}

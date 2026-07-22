"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { createEngine } from "./search-engine";
import type { SearchRecord } from "@/lib/search-record";

type Engine = { search(q: string): SearchRecord[] };

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const engineRef = useRef<Engine | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchRecord[]>([]);

  // Build the FlexSearch engine once on mount. `public/search-index.json` is `[]`
  // until Tasks 13-18 populate real content — `createEngine([])` still returns a
  // working (always-empty) engine, so the palette never crashes on a fetch of `[]`,
  // and a fetch failure falls back to the same empty engine instead of hard-failing.
  useEffect(() => {
    let cancelled = false;
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((records: SearchRecord[]) => {
        if (cancelled) return;
        engineRef.current = createEngine(records);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        engineRef.current = createEngine([]);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-run on `ready` too, so a query typed before the index finishes loading
  // still resolves once `engineRef.current` becomes available.
  useEffect(() => {
    setResults(engineRef.current ? engineRef.current.search(query) : []);
  }, [query, ready]);

  function onSelect(record: SearchRecord) {
    onOpenChange(false);
    setQuery("");
    router.push(`/concepts/${record.slug}#${record.anchor}`);
  }

  // Group the flat, already-ranked result list by source module so the palette
  // reads like a mini table-of-contents instead of a flat list.
  const groups: { title: string; items: SearchRecord[] }[] = [];
  for (const r of results) {
    const existing = groups.find((g) => g.title === r.title);
    if (existing) existing.items.push(r);
    else groups.push({ title: r.title, items: [r] });
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Busca no hub"
      shouldFilter={false}
      overlayClassName="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-[12%] z-50 w-full max-w-xl -translate-x-1/2 px-4"
      className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
    >
      <Command.Input
        autoFocus
        value={query}
        onValueChange={setQuery}
        placeholder="Buscar conceitos, seções, tags…"
        className="w-full border-b border-border bg-transparent px-4 py-3.5 text-sm text-text outline-none placeholder:text-muted"
      />
      <Command.List className="max-h-[60vh] overflow-y-auto p-2">
        {!ready && (
          <Command.Loading className="block px-3 py-8 text-center text-sm text-muted">
            Carregando índice de busca…
          </Command.Loading>
        )}
        {ready && query.trim() === "" && (
          <div className="px-3 py-8 text-center text-sm text-muted">
            Digite para buscar em todo o hub.
          </div>
        )}
        {ready && query.trim() !== "" && (
          <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
            Nenhum resultado encontrado.
          </Command.Empty>
        )}
        {groups.map((g) => (
          <Command.Group
            key={g.title}
            heading={g.title}
            className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted"
          >
            {g.items.map((r) => (
              <Command.Item
                key={r.id}
                value={r.id}
                onSelect={() => onSelect(r)}
                className="cursor-pointer rounded-md px-3 py-2 text-sm text-text data-[selected=true]:bg-surface2"
              >
                {r.section}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}

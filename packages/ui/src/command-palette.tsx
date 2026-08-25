"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { PowerChainIcon } from "./icons";
import type { AppNavGroup } from "./app-shell";

export function CommandPalette({ open, onClose, nav, product }: { open: boolean; onClose: () => void; nav: AppNavGroup[]; product: string }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const items = useMemo(() => nav.flatMap(group => group.items.map(item => ({ ...item, group: group.label }))).filter(item => item.href && !item.disabled), [nav]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter(item => `${item.label} ${item.group}`.toLowerCase().includes(normalized));
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 20);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(timeout); window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  if (!open) return null;

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => filtered.length ? (current + 1) % filtered.length : 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => filtered.length ? (current - 1 + filtered.length) % filtered.length : 0);
    } else if (event.key === "Enter" && filtered[activeIndex]?.href) {
      event.preventDefault();
      window.location.assign(filtered[activeIndex]!.href!);
      onClose();
    }
  };

  return <div className="pc-command-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="pc-command" role="dialog" aria-modal="true" aria-label={`Search ${product}`}>
      <div className="pc-command-input-row">
        <PowerChainIcon name="search" />
        <input
          ref={inputRef}
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder={`Search ${product}…`}
          aria-label="Search navigation"
          aria-activedescendant={filtered[activeIndex] ? `pc-command-${activeIndex}` : undefined}
        />
        <kbd>ESC</kbd>
      </div>
      <div className="pc-command-results" role="listbox" aria-label="Navigation results">
        {filtered.length ? filtered.map((item, index) => <a
          id={`pc-command-${index}`}
          key={`${item.group}:${item.label}`}
          className={`pc-command-result ${index === activeIndex ? "is-active" : ""}`}
          href={item.href}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={onClose}
          role="option"
          aria-selected={index === activeIndex}
        >
          <span className="pc-command-result-icon"><PowerChainIcon name={item.icon} /></span>
          <span><strong>{item.label}</strong><small>{item.group}</small></span>
          <PowerChainIcon name="arrow" />
        </a>) : <div className="pc-command-empty">No matching PowerChain destinations.</div>}
      </div>
      <div className="pc-command-hint"><span>Search or use ↑ ↓ to select</span><span><kbd>↵</kbd> open · <kbd>esc</kbd> close</span></div>
    </section>
  </div>;
}

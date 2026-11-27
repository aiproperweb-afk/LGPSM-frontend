"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { matchOptions, type SearchOption } from "@/utils/searchOptions";

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SearchOption[];
  placeholder?: string;
  ariaLabel: string;
  /** Shown on the left of the box */
  icon?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

// One box that both searches and chooses: it shows the chosen option; typing narrows the list, and picking from it chooses.
export default function SearchSelect({ value, onChange, options, placeholder = "Search…", ariaLabel, icon, emptyMessage = "No matches", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  // null: nothing typed yet, so the box shows the chosen option and the list shows everything
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const shown = matchOptions(options, query ?? "");
  const current = Math.min(active, Math.max(0, shown.length - 1));
  const close = () => { setOpen(false); setQuery(null); };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) close(); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (option: SearchOption) => {
    onChange(option.value);
    close();
    input.current?.blur();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      setActive((current + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % Math.max(1, shown.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && shown[current]) pick(shown[current]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") close();
  };

  return (
    <div ref={root} className={`relative ${className}`}>
      <div className="bg-[#FAFAFA] border border-[#E0E0E0] rounded-md h-[47px] px-4 flex items-center gap-2.5 focus-within:border-black transition-colors">
        {icon}
        <input
          ref={input}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && shown[current] ? `${listId}-${current}` : undefined}
          aria-label={ariaLabel}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={query ?? selected?.label ?? ""}
          onFocus={(e) => { setOpen(true); setActive(0); e.target.select(); }}
          onClick={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onKeyDown={onKeyDown}
          className="flex-1 min-w-0 bg-transparent text-xs font-medium text-[#15191C] placeholder-[#828282] focus:outline-none"
        />
        <svg className={`size-4 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <ul id={listId} role="listbox" aria-label={ariaLabel} className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-xl">
          {shown.length === 0 && <li className="px-3.5 py-3 text-center text-sm text-gray-500">{emptyMessage}</li>}
          {shown.map((option, i) => (
            <li
              key={option.value || "all"}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={option.value === value}
              onMouseDown={(e) => { e.preventDefault(); pick(option); }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3.5 py-2.5 text-sm break-words ${option.value === value ? "font-medium text-[#1F65FF]" : "text-gray-700"} ${i === current ? "bg-blue-50" : ""}`}
            >
              {option.label}
              {option.hint && <span className="block text-xs font-normal text-gray-500">{option.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useDashboardCopy } from "@/components/cms/DashboardCopyProvider";

import React, { useEffect, useRef, useState } from "react";
import Icon from "@/components/icons/Icon";

export interface ActionItem {
  key: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  /** the item is not offered at all (for example Resend on an event that is not sent digitally) */
  hidden?: boolean;
  /** a small icon in front of the label */
  icon?: React.ReactNode;
}

/** The "Action" dropdown of the invitee list (Figma 195:1145): the working tools that sit beside the main button, only the ones that apply */
export default function InviteeActionMenu({ items, disabled }: { items: ActionItem[]; disabled?: boolean }) {
  const cmsText = useDashboardCopy();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  const shown = items.filter((i) => !i.hidden);
  return (
    <div ref={box} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={() => setOpen((o) => !o)} className="inline-flex items-center justify-center gap-2 px-6 py-[11px] bg-white border border-[#E0E0E0] rounded-lg text-base font-medium text-[#1E2939] hover:bg-gray-50 cursor-pointer disabled:opacity-50">{cmsText("action", "Action")}<Icon name="events/inv-action-chevron" width={8} height={5} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[240px] bg-white border border-[#E0E0E0] rounded-lg shadow-lg py-1.5">
          {shown.map((i) => (
              <button
                key={i.key}
                type="button"
                role="menuitem"
                disabled={i.disabled}
                title={i.title}
                onClick={() => { setOpen(false); i.onClick(); }}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-[#15191C] hover:bg-gray-50 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  {i.icon && <span className="shrink-0 w-4 h-4 flex items-center justify-center text-[#4B4F52]">{i.icon}</span>}
                  <span className="truncate">{i.label}</span>
                </span>
              </button>
          ))}
        </div>
      )}
    </div>
  );
}

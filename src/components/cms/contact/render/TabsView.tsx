"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export default function TabsView({ id, labels, panels }: { id: string; labels: string[]; panels: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const current = Math.min(active, labels.length - 1);
  const onKeyDown = (event: KeyboardEvent) => {
    const next = event.key === "ArrowRight" ? current + 1 : event.key === "ArrowLeft" ? current - 1 : event.key === "Home" ? 0 : event.key === "End" ? labels.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    const index = (next + labels.length) % labels.length;
    setActive(index);
    list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[index]?.focus();
  };
  return (
    <>
      <div ref={list} role="tablist" onKeyDown={onKeyDown}>
        {labels.map((label, index) => (
          <button key={index} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={index === current} tabIndex={index === current ? 0 : -1} className="cb-tab" data-cb-part={`${id}:tab`} onClick={() => setActive(index)}>
            {label}
          </button>
        ))}
      </div>
      {panels.map((panel, index) => (
        <div key={index} role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={index !== current}>{panel}</div>
      ))}
    </>
  );
}

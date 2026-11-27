"use client";

import { useState } from "react";
import type { CustomFieldRender } from "@puckeditor/core";

type Labels = Record<string, string>;
const label = (key: string) => key.replace(/([A-Z])/g, " $1").replaceAll("_", " ").replace(/^./, first => first.toUpperCase());

export default function DashboardLabelsField({ id, value, onChange, readOnly }: Parameters<CustomFieldRender<Labels>>[0]) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(40);
  const search = query.trim().toLowerCase();
  const visible = Object.entries(value ?? {}).filter(([key, text]) =>
    label(key).toLowerCase().includes(search) || text.toLowerCase().includes(search)
  );
  return (
    <div className="grid gap-3">
      <label htmlFor={id + "-search"} className="grid gap-1">
        Search text fields
        <input id={id + "-search"} type="search" value={query} onChange={event => { setQuery(event.target.value); setLimit(40); }}
          className="rounded border border-gray-300 px-2 py-1" />
      </label>
      {visible.slice(0, limit).map(([key, text]) => (
        <label htmlFor={id + "-" + key} key={key} className="grid gap-1 text-sm">
          {label(key)}
          <textarea id={id + "-" + key} value={text} readOnly={readOnly} rows={text.length > 100 ? 3 : 1}
            className="rounded border border-gray-300 px-2 py-1"
            onChange={event => onChange({ ...value, [key]: event.currentTarget.value })} />
        </label>
      ))}
      {visible.length === 0 && <p>No text fields match your search.</p>}
      {visible.length > limit && <button type="button" onClick={() => setLimit(current => current + 40)}>Show more text fields</button>}
    </div>
  );
}

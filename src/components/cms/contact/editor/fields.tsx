"use client";

import type { CustomField, Field, Fields } from "@puckeditor/core";
import { imageReferenceField } from "../../fields";
import { STYLE_SPEC, HOVER_KEYS, isStyleValue, type StyleKind, type StyleSet, type PropRule, type Breakpoint } from "../schema.ts";
import { PRESETS } from "../defaults.ts";
import { useState } from "react";
import { usePuck } from "@puckeditor/core";
import { breakpointForWidth } from "../schema.ts";

export const fieldLabel = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
const options = (values: readonly string[]) => values.map(value => ({ label: fieldLabel(value), value }));
const groups: [string, RegExp][] = [
  ["Typography", /^(font|lineHeight|letterSpacing|wordSpacing|text|whiteSpace|overflowWrap|wordBreak|color|verticalAlign)/],
  ["Dimensions", /^(width|height|minWidth|maxWidth|minHeight|maxHeight|aspectRatio)/],
  ["Spacing", /^(margin|padding|gap|rowGap|columnGap)/],
  ["Background", /^(background|overlay)/],
  ["Border", /^border/],
  ["Layout", /^(display|flex|grid|align|justify|order)/],
  ["Position and effects", /.*/],
];

function CssValue({ name, value, kind, onChange, disabled }: {
  name: string; value: unknown; kind: StyleKind; onChange: (value: unknown) => void; disabled?: boolean;
}) {
  const [draft, setDraft] = useState<{ source: unknown; text: string }>();
  const raw = draft && draft.source === value ? draft.text : String(value ?? "");
  const update = (next: string) => {
    setDraft({ source: value, text: next });
    if (!next) onChange(undefined);
    else if (kind.kind === "number" && isStyleValue(name, Number(next))) onChange(Number(next));
    else if (kind.kind !== "number" && isStyleValue(name, next)) onChange(next);
  };
  if (kind.kind === "enum") return <select aria-label={fieldLabel(name)} disabled={disabled} value={String(value ?? "")} onChange={e => onChange(e.target.value || undefined)}>
    <option value="">Inherit</option>{options(kind.values).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>;
  if (kind.kind === "bool") return <select aria-label={fieldLabel(name)} disabled={disabled} value={value === undefined ? "" : String(value)} onChange={e => onChange(e.target.value ? e.target.value === "true" : undefined)}>
    <option value="">Inherit</option><option value="true">Yes</option><option value="false">No</option>
  </select>;
  if (kind.kind === "shadow" || kind.kind === "textShadow" || kind.kind === "gradient") {
    const gradient = kind.kind === "gradient";
    const defaults: Record<string, string | number> = gradient
      ? { type: "linear", angle: 90, from: "#FFFFFF", to: "#EAF1FF" }
      : { x: 0, y: 4, blur: 12, color: "#000000", ...(kind.kind === "shadow" ? { spread: 0 } : {}) };
    const current = { ...defaults, ...(value as Record<string, string | number> | undefined) };
    return <div className="grid gap-1">
      {Object.entries(defaults).map(([key, initial]) => <label key={key} className="flex items-center justify-between gap-2">
        {fieldLabel(key)}
        {key === "type" ? <select disabled={disabled} value={current[key]} onChange={e => onChange({ ...current, [key]: e.target.value })}><option>linear</option><option>radial</option></select>
         : <input disabled={disabled} type={typeof initial === "number" ? "number" : "color"} value={current[key]} onChange={e => {
            const next = { ...current, [key]: typeof initial === "number" ? Number(e.target.value) : e.target.value };
            if (isStyleValue(name, next)) onChange(next);
          }} />}
      </label>)}
      {value !== undefined && <button type="button" disabled={disabled} onClick={() => onChange(undefined)}>Reset</button>}
    </div>;
  }
  return <div className="flex min-w-0 gap-1">
    {kind.kind === "color" && <input aria-label={fieldLabel(name) + " picker"} type="color" disabled={disabled} value={/^#[\da-f]{6}$/i.test(raw) ? raw : "#000000"} onChange={e => update(e.target.value)} />}
    <input aria-label={fieldLabel(name)} className="w-full min-w-0 rounded border px-1" disabled={disabled} type={kind.kind === "number" ? "number" : "text"} placeholder={kind.kind === "length" ? "Inherit (e.g. 16px)" : "Inherit"} value={raw} onChange={e => update(e.target.value)} />
    {value !== undefined && <button type="button" title="Reset property" disabled={disabled} onClick={() => update("")}>?</button>}
  </div>;
}

export function StyleControls({ value = {}, onChange, readOnly }: { value?: StyleSet; onChange: (value: StyleSet) => void; readOnly?: boolean }) {
  const { appState } = usePuck();
  const width = appState.ui.viewports.current.width;
  const viewport = breakpointForWidth(typeof width === "number" ? width : 1280);
  const [override, setOverride] = useState<Breakpoint | "hover">();
  const layer = override ?? viewport;
  const update = (name: string, next: unknown) => {
    const properties = { ...value[layer] };
    if (next === undefined) delete properties[name]; else properties[name] = next;
    onChange({ ...value, [layer]: properties });
  };
  return <div className="grid gap-2 text-sm">
    <label>Style layer <select value={override ?? ""} onChange={e => setOverride((e.target.value || undefined) as typeof override)}>
      <option value="">Current viewport ({viewport})</option>{["desktop", "tablet", "mobile", "hover"].map(name => <option key={name}>{name}</option>)}
    </select></label>
    <label>Style preset <select value="" disabled={readOnly} onChange={e => {
      const preset = PRESETS.find(p => p.name === e.target.value);
      if (preset) onChange({ ...value, ...preset.style, desktop: { ...value.desktop, ...preset.style.desktop } });
    }}><option value="">Choose a preset</option>{PRESETS.map(p => <option key={p.name}>{p.name}</option>)}</select></label>
    {groups.map(([group, matcher], index) => {
      const keys = Object.keys(STYLE_SPEC).filter(key => matcher.test(key) && !groups.slice(0, index).some(([, earlier]) => earlier.test(key)) && (layer !== "hover" || HOVER_KEYS.includes(key)));
      return keys.length > 0 && <details key={group} className="rounded border p-2">
        <summary className="cursor-pointer font-medium">{group}</summary>
        <div className="mt-2 grid gap-2">{keys.map(name => <div key={name} className="grid gap-1">
          <span>{fieldLabel(name)}</span>
          <CssValue name={name} kind={STYLE_SPEC[name]} value={value[layer]?.[name]} onChange={next => update(name, next)} disabled={readOnly} />
        </div>)}</div>
      </details>;
    })}
    <button type="button" disabled={readOnly} onClick={() => onChange({ ...value, [layer]: {} })}>Reset {layer} overrides</button>
  </div>;
}

export const styleField: CustomField<StyleSet> = { type: "custom", label: "Design", render: props => <StyleControls {...props} /> };

export function builderFields(rules: Record<string, PropRule>): Fields {
  return Object.fromEntries(Object.entries(rules).map(([name, rule]): [string, Field] => {
    const label = fieldLabel(name);
    switch (rule.kind) {
      case "slot": return [name, { type: "slot", allow: [...rule.allow] }];
      case "array": return [name, { type: "array", label, max: rule.max, arrayFields: builderFields(rule.item) }];
      case "style": return [name, { ...styleField, label }];
      case "enum": return [name, { type: "select", label, options: options(rule.values) }];
      case "bool": return [name, { type: "radio", label, options: [{ label: "Yes", value: true }, { label: "No", value: false }] }];
      case "number": return [name, { type: "number", label, min: rule.min, max: rule.max }];
      case "image": return [name, { ...imageReferenceField, label }];
      case "richtext": return [name, { type: "richtext", label, contentEditable: true }];
      case "text": return [name, { type: rule.multiline ? "textarea" : "text", label, contentEditable: name === "text" }];
      default: return [name, { type: "text", label }];
    }
  }));
}

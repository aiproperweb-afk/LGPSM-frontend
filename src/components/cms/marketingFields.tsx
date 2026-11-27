import type { CustomField, Field } from "@puckeditor/core";
import ImageReference from "./ImageReference";

type CopyValue = string | CopyValue[] | { [key: string]: CopyValue };

function isImage(key: string) {
  return key === "image" || key.endsWith("Image");
}

function fieldLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, first => first.toUpperCase());
}

function CopyInput({ value, name, id, readOnly, onChange }: {
  value: CopyValue; name: string; id: string; readOnly?: boolean; onChange: (value: CopyValue) => void;
}) {
  if (typeof value === "string") {
    if (isImage(name)) return <ImageReference {...{ id, name, value, readOnly, onChange }} field={{ type: "custom", render: () => <></> }} />;
    return <label htmlFor={id} className="grid gap-1 text-sm">
      {fieldLabel(name)}
      <textarea id={id} value={value} readOnly={readOnly} rows={value.length > 100 ? 3 : 1}
        className="w-full rounded border border-gray-300 px-2 py-1"
        onChange={event => onChange(event.currentTarget.value)} />
    </label>;
  }
  if (Array.isArray(value)) return (
    <div className="grid gap-2">
      {value.map((item, index) => {
        const itemLabel = typeof item === "object" && !Array.isArray(item)
          ? item.title || item.label || item.name || item.chip || item.eyebrow : undefined;
        const label = typeof itemLabel === "string" ? itemLabel : fieldLabel(name) + " " + (index + 1);
        return <details key={index} className="rounded border border-gray-200 p-2">
          <summary className="cursor-pointer text-sm">{label}</summary>
          <div className="mt-2">
            <CopyInput value={item} name={label} id={id + "-" + index} readOnly={readOnly}
              onChange={updated => onChange(value.map((entry, i) => i === index ? updated : entry))} />
          </div>
        </details>;
      })}
    </div>
  );
  return <div className="grid gap-3">
    {Object.entries(value).map(([key, item]) =>
      <CopyInput key={key} value={item} name={key} id={id + "-" + key} readOnly={readOnly}
        onChange={updated => onChange({ ...value, [key]: updated })} />
    )}
  </div>;
}

export function marketingFields<T extends Record<string, CopyValue>>(defaults: T) {
  const entries = Object.entries(defaults).map(([key, sample]): [string, Field] => {
    const label = fieldLabel(key);
    if (typeof sample === "string" && !isImage(key)) return [key, { type: sample.length > 100 ? "textarea" : "text", label }];
    const field: CustomField<CopyValue> = {
      type: "custom", label,
      render: ({ value, id, readOnly, onChange }) =>
        <CopyInput value={value ?? sample} name={key} id={id} readOnly={readOnly} onChange={onChange} />,
    };
    return [key, field];
  });
  return Object.fromEntries(entries) as { [K in keyof T]: Field<T[K]> };
}

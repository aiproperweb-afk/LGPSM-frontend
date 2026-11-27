import type { CustomField } from "@puckeditor/core";
import ImageReference from "./ImageReference";

export const imageReferenceField: CustomField<string> = {
  type: "custom", label: "Image reference", render: props => <ImageReference {...props} />,
};

export const bulletField: CustomField<string[]> = {
  type: "custom",
  label: "Bullets",
  render: ({ id, name, value, onChange, readOnly }) => (
    <div className="grid gap-1">
      <label htmlFor={id}>Bullets (one per line)</label>
      <textarea
        id={id}
        name={name}
        value={value?.join("\n") ?? ""}
        disabled={readOnly}
        rows={5}
        onChange={(event) => onChange(event.currentTarget.value.split("\n"))}
        className="w-full rounded border border-gray-300 px-2 py-1"
      />
    </div>
  ),
};

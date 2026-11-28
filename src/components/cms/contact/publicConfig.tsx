// The Contact page's component registry. It contains only what is needed to render a page, so the public bundle
// carries no editor code. The editor adds its fields on top of this (editor/editorConfig.tsx).
import type { Config, Fields } from "@puckeditor/core";
import { COMPONENTS } from "./schema.ts";
import { renderComponent, type RenderProps } from "./render/components";

/** Puck needs to know where nested components live; no other field is required for rendering. */
function slotFields(type: string): Fields {
  const fields: Record<string, unknown> = {};
  for (const [name, rule] of Object.entries(COMPONENTS[type].props)) {
    if (rule.kind === "slot") fields[name] = { type: "slot", allow: [...rule.allow] };
    if (rule.kind === "array") {
      const nested = Object.entries(rule.item).filter(([, item]) => item.kind === "slot");
      if (nested.length) {
        fields[name] = { type: "array", arrayFields: Object.fromEntries(nested.map(([key, item]) => [key, { type: "slot", allow: item.kind === "slot" ? [...item.allow] : [] }])) };
      }
    }
  }
  return fields as Fields;
}

export const contactPublicConfig: Config = {
  components: Object.fromEntries(Object.keys(COMPONENTS).map(type => [type, {
    fields: slotFields(type),
    render: (props: unknown) => <>{renderComponent(type, props as RenderProps)}</>,
  }])),
};

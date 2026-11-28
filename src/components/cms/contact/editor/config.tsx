"use client";

import type { Config } from "@puckeditor/core";
import { contactPublicConfig } from "../publicConfig";
import { CATEGORY_LABELS, COMPONENTS, GENERAL_CHILDREN } from "../schema.ts";
import { componentDefaults } from "../defaults.ts";
import { builderFields, styleField } from "./fields";

export const contactEditorConfig: Config = {
  root: { fields: { style: styleField } },
  categories: Object.fromEntries(Object.entries(CATEGORY_LABELS).map(([key, title]) => [
    key, { title, components: Object.keys(COMPONENTS).filter(type => COMPONENTS[type].category === key && type !== "ExistingSection" && type !== "StatCard") },
  ])),
  components: Object.fromEntries(Object.entries(COMPONENTS).map(([type, spec]) => [type, {
    ...contactPublicConfig.components[type],
    label: spec.label,
    defaultProps: componentDefaults(type),
    fields: {
      ...builderFields(spec.props),
      ...(type === "StatCard" ? { value: { type: "text", label: "Value", contentEditable: true }, label: { type: "text", label: "Label", contentEditable: true } } : {}),
      name: { type: "text", label: "Layer name" },
      anchorId: { type: "text", label: "Anchor ID" },
      ariaLabel: { type: "text", label: "Accessible label" },
      ariaLabelledBy: { type: "text", label: "Labelled by ID" },
      hidden: { type: "radio", label: "Hidden", options: [{ label: "No", value: false }, { label: "Yes", value: true }] },
      locked: { type: "radio", label: "Locked", options: [{ label: "No", value: false }, { label: "Yes", value: true }] },
      style: styleField,
    },
    resolvePermissions: ({ props }) => props.locked ? { drag: false, delete: false, duplicate: false } : {},
  }])),
};

export const allowedTopLevel = [...GENERAL_CHILDREN];

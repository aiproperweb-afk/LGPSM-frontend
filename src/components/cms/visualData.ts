import { initialPageData } from "./initialData";
import { clientPages } from "./marketingContent";
import { upgradePageData, validatePageData } from "./validatePageData";
import type { CmsPageData, CmsSlug } from "./types";
import { BUILDER_SCHEMA_VERSION, toPublicData, validateBuilderData, visitNodes, type BuilderData } from "./contact/schema";

export type VisualSlug = Extract<CmsSlug, "home" | "features" | "how-it-works" | "clients" | "navbar" | "footer">;

export function validateVisualData(value: unknown, slug: VisualSlug) {
  const defaults = initialPageData[slug];
  return validateBuilderData(value, (source, copy) => {
    const index = defaults.content.findIndex(section => section.props.id === source);
    if (index < 0) return false;
    const content = defaults.content.map((section, i) => i === index ? { ...section, props: copy } : section);
    return validatePageData({ ...defaults, content }, slug) ? [] : false;
  });
}

export function convertVisualDraft(value: unknown, slug: VisualSlug): BuilderData | null {
  const result = validateVisualData(value, slug);
  if (result.ok) return result.data;
  const classic = upgradePageData(value, slug);
  if (!validatePageData(classic, slug)) return null;
  return {
    root: { props: { builder: "visual", schemaVersion: BUILDER_SCHEMA_VERSION } },
    content: classic.content.map(section => ({
      type: "ExistingSection",
      props: { id: section.props.id, source: section.props.id, copy: section.props, name: clientPages.find(page => page.slug === section.props.id)?.name ?? section.type },
    })),
  };
}

export function classicSections(data: BuilderData, slug: VisualSlug): CmsPageData {
  const defaults = initialPageData[slug];
  const copies = new Map<unknown, unknown>();
  visitNodes(toPublicData(data).content, node => {
    if (node.type === "ExistingSection" && !copies.has(node.props.source)) {
      copies.set(node.props.source, node.props.copy);
    }
  });
  const content = defaults.content.map(section => {
    const copy = copies.get(section.props.id);
    return copy ? { ...section, props: copy } as typeof section : section;
  });
  return { ...defaults, content };
}

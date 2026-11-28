import { initialPageData } from "./initialData";
import { clientPages } from "./marketingContent";
import { heroBlocks } from "./heroBlocks";
import { elementKey, type ElementOverride } from "./SiteElement";
import { upgradePageData, validatePageData } from "./validatePageData";
import type { CmsPageData, CmsSlug } from "./types";
import { BUILDER_SCHEMA_VERSION, childSlots, toPublicData, validateBuilderData, visitNodes, type BuilderData, type BuilderNode } from "./contact/schema";

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
  if (result.ok) return expandHeroes(result.data, slug);
  const classic = upgradePageData(value, slug);
  if (!validatePageData(classic, slug)) return null;
  return expandHeroes({
    root: { props: { builder: "visual", schemaVersion: BUILDER_SCHEMA_VERSION } },
    content: classic.content.map(section => ({
      type: "ExistingSection",
      props: { id: section.props.id, source: section.props.id, copy: section.props, name: clientPages.find(page => page.slug === section.props.id)?.name ?? section.type },
    })),
  }, slug);
}

function expandHeroes(data: BuilderData, slug: VisualSlug): BuilderData {
  const originals = initialPageData[slug].content;
  const expand = (node: BuilderNode): BuilderNode => {
    const props = { ...node.props };
    for (const slot of childSlots(node)) {
      // Puck slots can live either on the component or in a repeated item's properties.
      if (!slot.path.includes(".")) props[slot.path] = slot.nodes.map(expand);
    }
    const original = node.type === "ExistingSection" && originals.find(section => section.props.id === props.source);
    if (original && !Array.isArray(props.hero)) {
      const hero = heroBlocks({ ...original, props: props.copy } as typeof original, props.id);
      if (hero) { props.hero = hero; props.visualHero = true; }
    }
    if (original && original.type === "StatsClients" && !props.visualStats) {
      const copy = props.copy as typeof original.props;
      const edits = (props.elements ?? []) as ElementOverride[];
      const cards = copy.stats.map((stat, index): BuilderNode => {
        const prefix = "/StatsClients-6/ui-1/StatsClients-7:" + index;
        const value = edits.find(edit => edit.key === elementKey(prefix + "/StatsClients-8"));
        const label = edits.find(edit => edit.key === elementKey(prefix + "/StatsClients-9"));
        return {
          type: "StatCard",
          props: {
            id: props.id.slice(0, 55) + "-stat-" + (index + 1),
            value: value?.text ?? stat.value,
            label: label?.text ?? stat.label,
            ...(value?.style ? { valueStyle: value.style } : {}),
            ...(label?.style ? { labelStyle: label.style } : {}),
          },
        };
      });
      props.statCards = cards;
      props.visualStats = true;
    }
    return { ...node, props };
  };
  return { ...data, content: data.content.map(expand) };
}

export function classicSections(data: BuilderData, slug: VisualSlug): CmsPageData {
  const defaults = initialPageData[slug];
  const copies = new Map<unknown, unknown>();
  visitNodes(toPublicData(data).content, node => {
    if (node.type === "ExistingSection" && !copies.has(node.props.source)) {
      const stats = node.props.source === "StatsClients" && node.props.visualStats && Array.isArray(node.props.statCards)
        ? (node.props.statCards as BuilderNode[]).map(({ props }) => ({ value: String(props.value ?? ""), label: String(props.label ?? "") }))
        : undefined;
      copies.set(node.props.source, stats ? { ...(node.props.copy as object), stats } : node.props.copy);
    }
  });
  const content = defaults.content.map(section => {
    const copy = copies.get(section.props.id);
    return copy ? { ...section, props: copy } as typeof section : section;
  });
  return { ...defaults, content };
}

// Immutable operations on a builder document, used by paste, templates, the layer list and the resize tools.
import {
  childSlots, CORE_BINDINGS, COMPONENTS, FIELD_TYPES, GENERAL_CHILDREN, visitNodes,
  type BuilderData, type BuilderNode,
} from "./schema.ts";
import { componentDefaults } from "./defaults.ts";

export type Location = { parentId: string | null; slot: string; index: number };
export type Found = Location & { node: BuilderNode; ancestors: BuilderNode[]; siblings: number };

export const randomId = (type: string) => `${type}-${globalThis.crypto.randomUUID()}`;

export function findNode(data: BuilderData, id: string): Found | null {
  const search = (nodes: BuilderNode[], parentId: string | null, slot: string, ancestors: BuilderNode[]): Found | null => {
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (node.props.id === id) return { node, parentId, slot, index, ancestors, siblings: nodes.length };
      for (const child of childSlots(node)) {
        const result = search(child.nodes, node.props.id, child.path, [...ancestors, node]);
        if (result) return result;
      }
    }
    return null;
  };
  return search(data.content, null, "content", []);
}

function setPath(target: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const [head, ...rest] = path.split(".");
  if (!rest.length) return { ...target, [head]: value };
  const current = target[head];
  const child = setPath((current ?? {}) as Record<string, unknown>, rest.join("."), value);
  return { ...target, [head]: Array.isArray(current) ? Object.assign([...current], child) : child };
}

/** Rebuilds the tree, replacing every list of nodes with the result of `transform`. */
function mapLists(data: BuilderData, transform: (nodes: BuilderNode[], parentId: string | null, slot: string) => BuilderNode[]): BuilderData {
  const walk = (nodes: BuilderNode[], parentId: string | null, slot: string): BuilderNode[] =>
    transform(nodes, parentId, slot).map(node => {
      let props: Record<string, unknown> = node.props;
      for (const child of childSlots(node)) props = setPath(props, child.path, walk(child.nodes, node.props.id, child.path));
      return props === node.props ? node : { type: node.type, props: props as BuilderNode["props"] };
    });
  return { ...data, content: walk(data.content, null, "content") };
}

export function updateNode(data: BuilderData, id: string, update: (node: BuilderNode) => BuilderNode): BuilderData {
  return mapLists(data, nodes => nodes.map(node => node.props.id === id ? update(node) : node));
}

export function removeNode(data: BuilderData, id: string): BuilderData {
  return mapLists(data, nodes => nodes.filter(node => node.props.id !== id));
}

export function insertNodes(data: BuilderData, at: Location, added: BuilderNode[]): BuilderData {
  return mapLists(data, (nodes, parentId, slot) => {
    if (parentId !== at.parentId || slot !== at.slot) return nodes;
    const copy = [...nodes];
    copy.splice(at.index, 0, ...added);
    return copy;
  });
}

/** The component types a slot accepts. */
export function allowedIn(data: BuilderData, parentId: string | null, slot: string): readonly string[] {
  if (parentId === null) return GENERAL_CHILDREN;
  const parent = findNode(data, parentId)?.node;
  return childSlots(parent ?? { type: "", props: { id: "" } }).find(child => child.path === slot)?.allow ?? [];
}

/** Copies nodes giving every one (and every descendant) a new id. */
export function cloneWithNewIds(nodes: BuilderNode[], nextId: (type: string) => string = randomId): BuilderNode[] {
  return nodes.map(node => {
    let props: Record<string, unknown> = { ...structuredClone(node.props), id: nextId(node.type) };
    for (const child of childSlots(node)) props = setPath(props, child.path, cloneWithNewIds(child.nodes, nextId));
    // Anchors must stay unique on a page, so a copy does not keep the original's.
    delete props.anchorId;
    delete props.ariaLabelledBy;
    return { type: node.type, props: props as BuilderNode["props"] };
  });
}

/**
 * A form may connect only one field to each server value. When a copy would add a second one, the copied field becomes a
 * custom field. `added` lists the ids that were just inserted.
 */
export function releaseDuplicateBindings(data: BuilderData, added: Set<string>): BuilderData {
  const demote = new Set<string>();
  visitNodes(data.content, form => {
    if (form.type !== "ContactForm") return;
    const fields: BuilderNode[] = [];
    visitNodes(childSlots(form).flatMap(child => child.nodes), node => {
      if ((FIELD_TYPES as readonly string[]).includes(node.type)) fields.push(node);
    });
    for (const binding of [...CORE_BINDINGS, "phone"]) {
      const bound = fields.filter(node => node.props.binding === binding);
      const keep = bound.find(node => !added.has(node.props.id)) ?? bound[0];
      for (const node of bound) if (node !== keep && added.has(node.props.id)) demote.add(node.props.id);
    }
  });
  if (!demote.size) return data;
  return mapLists(data, nodes => nodes.map(node => demote.has(node.props.id) ? { ...node, props: { ...node.props, binding: "custom" } } : node));
}

/**
 * Where copied nodes land for the current selection: inside an empty container, otherwise after the selection, otherwise
 * after the nearest ancestor that may hold them. Null when nothing on that path accepts them.
 */
export function pasteLocation(data: BuilderData, selectedId: string | null, nodes: BuilderNode[]): Location | null {
  const types = nodes.map(node => node.type);
  const accepts = (allow: readonly string[]) => types.every(type => allow.includes(type));
  const selected = selectedId ? findNode(data, selectedId) : null;
  if (!selected) return accepts(GENERAL_CHILDREN) ? { parentId: null, slot: "content", index: data.content.length } : null;
  const slots = childSlots(selected.node);
  const empty = slots.length === 1 && slots[0].nodes.length === 0;
  if (empty && accepts(slots[0].allow)) return { parentId: selected.node.props.id, slot: slots[0].path, index: 0 };
  let current: Found | null = selected;
  while (current) {
    if (accepts(allowedIn(data, current.parentId, current.slot))) return { parentId: current.parentId, slot: current.slot, index: current.index + 1 };
    current = current.parentId ? findNode(data, current.parentId) : null;
  }
  const inside = slots.find(child => accepts(child.allow));
  return inside ? { parentId: selected.node.props.id, slot: inside.path, index: inside.nodes.length } : null;
}

export function pasteNodes(data: BuilderData, selectedId: string | null, source: BuilderNode[], nextId: (type: string) => string = randomId) {
  const at = pasteLocation(data, selectedId, source);
  if (!at) return null;
  const copies = cloneWithNewIds(source, nextId);
  const added = new Set<string>();
  visitNodes(copies, node => added.add(node.props.id));
  return { data: releaseDuplicateBindings(insertNodes(data, at, copies), added), ids: copies.map(node => node.props.id) };
}

/** Restores a component's own default settings while keeping its identity, name, children and form connection. */
export function resetNode(node: BuilderNode): BuilderNode {
  const props: Record<string, unknown> = { ...componentDefaults(node.type), id: node.props.id };
  const spec = COMPONENTS[node.type];
  for (const [name, rule] of Object.entries(spec.props)) {
    if (rule.kind === "slot" || name === "binding" || (name === "tabs" && node.props.tabs)) props[name] = node.props[name];
  }
  for (const keep of ["name", "anchorId", "ariaLabelledBy"]) if (node.props[keep] !== undefined) props[keep] = node.props[keep];
  if (spec.props.content?.kind === "slot" && node.props.content === undefined) props.content = [];
  return { type: node.type, props: props as BuilderNode["props"] };
}

export function containsId(node: BuilderNode, id: string): boolean {
  let found = false;
  visitNodes([node], current => { if (current.props.id === id) found = true; });
  return found;
}

export function displayName(node: { type: string; props: Record<string, unknown> }): string {
  const name = node.props.name;
  if (typeof name === "string" && name.trim()) return name;
  const label = COMPONENTS[node.type]?.label ?? node.type;
  const own = node.props.label ?? node.props.text ?? node.props.question;
  return typeof own === "string" && own.trim() ? `${label}: ${own.length > 28 ? own.slice(0, 28) + "…" : own}` : label;
}

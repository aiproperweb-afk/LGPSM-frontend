"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createUsePuck } from "@puckeditor/core";
import type { BuilderData } from "../schema";
import { findNode, updateNode } from "../tree";
import { StyleControls } from "./fields";
import type { ElementOverride } from "../../SiteElement";

export type ElementSelection = {
  owner: string; key: string; tag: string;
  element: Element;
  reorderable: boolean; text?: string; href?: string; src?: string; alt?: string; placeholder?: string;
};

export const ElementSelectionContext = createContext<{
  selected: ElementSelection | null;
  select: (item: ElementSelection | null) => void;
}>({ selected: null, select: () => undefined });

export function elementSelection(target: Element): ElementSelection | null {
  const key = target.getAttribute("data-cms-element");
  const owner = target.getAttribute("data-cms-owner");
  if (!key || !owner) return null;
  const get = (name: string) => target.getAttribute("data-cms-" + name) ?? undefined;
  return { key, owner, element: target, reorderable: target.hasAttribute("data-cms-reorderable"), tag: target.tagName.toLowerCase(), text: get("text"), href: get("link"), src: get("image"), alt: get("alt"), placeholder: get("placeholder") };
}

export function elementSiblings(element: Element, owner: string) {
  return [...(element.parentElement?.children ?? [])].filter(child =>
    child.hasAttribute("data-cms-reorderable") && child.getAttribute("data-cms-owner") === owner);
}

export function saveSiblingOrder(data: BuilderData, owner: string, siblings: Element[]): BuilderData {
  return updateNode(data, owner, node => {
    const edits = new Map(((node.props.elements ?? []) as ElementOverride[]).map(item => [item.key, item]));
    siblings.forEach((child, rank) => {
      const key = child.getAttribute("data-cms-element");
      if (key) edits.set(key, { ...edits.get(key), key, rank });
    });
    return { ...node, props: { ...node.props, elements: [...edits.values()] } };
  });
}

const useEditor = createUsePuck();

export default function ElementInspector({ children }: { children: ReactNode }) {
  const { selected, select } = useContext(ElementSelectionContext);
  const selectedId = useEditor(state => state.selectedItem?.props.id);
  const data = useEditor(state => state.appState.data) as BuilderData;
  const dispatch = useEditor(state => state.dispatch);
  if (!selected || selected.owner !== selectedId) return children;
  const site = findNode(data, selected.owner)?.node;
  if (!site) return children;
  const edits = (site.props.elements ?? []) as ElementOverride[];
  const current = edits.find(item => item.key === selected.key) ?? { key: selected.key };
  const siblings = elementSiblings(selected.element, selected.owner);
  const index = siblings.indexOf(selected.element);
  function move(step: number) {
    if (!selected || index < 0 || !siblings[index + step]) return;
    const order = [...siblings];
    [order[index], order[index + step]] = [order[index + step], order[index]];
    dispatch({ type: "setData", data: previous => saveSiblingOrder(previous as BuilderData, selected.owner, order) });
  }
  function change(value?: Partial<ElementOverride>) {
    if (!selected) return;
    dispatch({ type: "setData", data: previous => updateNode(previous as BuilderData, selected.owner, node => {
      const existing = (node.props.elements ?? []) as ElementOverride[];
      const entries = existing.filter(item => item.key !== selected.key);
      if (value) entries.push({ ...existing.find(item => item.key === selected.key), ...value, key: selected.key });
      return { ...node, props: { ...node.props, elements: entries } };
    }) });
  }
  return (
    <div className="grid gap-3 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Selected element · {selected.tag}</h2>
        <button type="button" onClick={() => select(null)}>Section settings</button>
      </div>
      {selected.text !== undefined && <label className="grid gap-1">Text
        <textarea className="rounded border p-2" rows={3} maxLength={4000} value={current.text ?? selected.text} onChange={event => change({ text: event.target.value })} />
      </label>}
      {selected.src !== undefined && <label className="grid gap-1">Image source
        <input className="rounded border p-2" value={current.src ?? selected.src} onChange={event => change({ src: event.target.value })} />
      </label>}
      {selected.alt !== undefined && <label className="grid gap-1">Alternative text
        <input className="rounded border p-2" maxLength={300} value={current.alt ?? selected.alt} onChange={event => change({ alt: event.target.value })} />
      </label>}
      {selected.href !== undefined && <label className="grid gap-1">Link destination
        <input className="rounded border p-2" value={current.href ?? selected.href} onChange={event => change({ href: event.target.value })} />
      </label>}
      {selected.placeholder !== undefined && <label className="grid gap-1">Placeholder
        <input className="rounded border p-2" maxLength={300} value={current.placeholder ?? selected.placeholder} onChange={event => change({ placeholder: event.target.value })} />
      </label>}
      {selected.reorderable && <div className="flex flex-wrap gap-2">
        <button type="button" disabled={index <= 0} onClick={() => move(-1)}>Move earlier</button>
        <button type="button" disabled={index < 0 || index >= siblings.length - 1} onClick={() => move(1)}>Move later</button>
      </div>}
      <StyleControls value={current.style} onChange={style => change({ style })} />
      <button type="button" onClick={() => change()}>Reset element changes</button>
    </div>
  );
}

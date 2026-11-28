"use client";

import { Children, cloneElement, createContext, isValidElement, useContext, type ReactElement, type ReactNode } from "react";
import { resolveImageUrl } from "@/utils/mediaUrl";
import { isSafeImage, isSafeLink, isStyleValue, type StyleSet } from "./contact/schema";
import { declarations } from "./contact/styleCss";

export type ElementOverride = { key: string; rank?: number; text?: string; src?: string; alt?: string; placeholder?: string; href?: string; style?: StyleSet };
type Scope = { owner: string; path: string; edits: ReadonlyMap<string, ElementOverride>; editing: boolean };

const SiteScope = createContext<Scope | null>(null);

function elementKey(value: string) {
  let high = 0x811c9dc5;
  let low = 0x9e3779b9;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    high = Math.imul(high ^ code, 0x01000193);
    low = Math.imul(low ^ code, 0x85ebca6b);
  }
  return "e" + (high >>> 0).toString(16).padStart(8, "0") + (low >>> 0).toString(16).padStart(8, "0");
}

export function SiteElementScope({ owner, edits, editing, children }: {
  owner: string; edits?: ElementOverride[]; editing: boolean; children: ReactNode;
}) {
  const values = new Map(edits?.map(item => [item.key, item]));
  return <>
    {edits?.some(item => item.style) && <style>{edits.map(item => {
      if (!/^e[0-9a-f]{16}$/.test(item.key) || !/^[A-Za-z0-9_-]{1,80}$/.test(owner)) return "";
      const selector = '[data-cms-owner="' + owner + '"][data-cms-element="' + item.key + '"]';
      const clean = (values: Record<string, unknown> = {}) => Object.fromEntries(Object.entries(values).filter(([key, value]) => isStyleValue(key, value)));
      const desktop = clean(item.style?.desktop), tablet = clean(item.style?.tablet), mobile = clean(item.style?.mobile), hover = clean(item.style?.hover);
      const rule = (target: string, own: typeof desktop, merged = own) => {
        const values = declarations(own, merged, value => isSafeImage(value) ? resolveImageUrl(value) : null);
        return values.length ? target + "{" + values.join(";") + "}" : "";
      };
      return rule(selector, desktop)
        + (Object.keys(tablet).length ? "@media(max-width:1023.98px){" + rule(selector, tablet, { ...desktop, ...tablet }) + "}" : "")
        + (Object.keys(mobile).length ? "@media(max-width:639.98px){" + rule(selector, mobile, { ...desktop, ...tablet, ...mobile }) + "}" : "")
        + rule(selector + ":hover", hover, { ...desktop, ...hover });
    }).join("")}</style>}
    <SiteScope.Provider value={{ owner, path: "", edits: values, editing }}>{children}</SiteScope.Provider>
  </>;
}

function simpleText(value: ReactNode): string | undefined {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!Array.isArray(value)) return;
  if (value.every(child => typeof child === "string" || typeof child === "number" || child == null || typeof child === "boolean")) {
    return value.filter(child => typeof child === "string" || typeof child === "number").join("");
  }
}

export function SiteElement({ site, item, selectable = true, reorderable, children }: {
  site: string; item?: string | number; selectable?: boolean; reorderable?: boolean; children: ReactElement<Record<string, unknown>>;
}) {
  const scope = useContext(SiteScope);
  if (!scope) return children;
  const path = scope.path + "/" + site + (item === undefined ? "" : ":" + item);
  if (!selectable) return <SiteScope.Provider value={{ ...scope, path }}>{children}</SiteScope.Provider>;
  const key = elementKey(path);
  const previous = scope.edits.get(key);
  const props = children.props;
  const text = simpleText(props.children as ReactNode);
  const source = typeof props.src === "string" ? props.src : undefined;
  const href = typeof props.href === "string" ? props.href : undefined;
  const alternate = typeof props.alt === "string" ? props.alt : undefined;
  const edit: Record<string, unknown> = {};
  if (text !== undefined && previous?.text !== undefined) edit.children = previous.text;
  if (source !== undefined && previous?.src && isSafeImage(previous.src)) { edit.src = resolveImageUrl(previous.src) ?? source; if (typeof children.type !== "string") edit.unoptimized = true; }
  if (typeof props.placeholder === "string" && previous?.placeholder !== undefined) edit.placeholder = previous.placeholder;
  if (alternate !== undefined && previous?.alt !== undefined) edit.alt = previous.alt;
  if (href !== undefined && previous?.href && isSafeLink(previous.href)) edit.href = previous.href;
  if (scope.editing || previous?.style) {
    edit["data-cms-element"] = key;
    edit["data-cms-owner"] = scope.owner;
  }
  if (scope.editing) {
    if (reorderable) edit["data-cms-reorderable"] = "";
    if (typeof props.placeholder === "string") edit["data-cms-placeholder"] = props.placeholder;
    if (text !== undefined) edit["data-cms-text"] = text;
    if (source !== undefined) edit["data-cms-image"] = source;
    if (alternate !== undefined) edit["data-cms-alt"] = alternate;
    if (href !== undefined) edit["data-cms-link"] = href;
  }
  if (text === undefined && props.children) {
    const childrenArray = Children.toArray(props.children as ReactNode);
    const siblings = childrenArray.flatMap((child, index) => {
      if (!isValidElement<Parameters<typeof SiteElement>[0]>(child) || child.type !== SiteElement || child.props.selectable === false) return [];
      const { site, item } = child.props;
      const id = elementKey(path + "/" + site + (item === undefined ? "" : ":" + item));
      return [{ child, index, rank: scope.edits.get(id)?.rank }];
    });
    if (siblings.length > 1 && (scope.editing || siblings.some(sibling => sibling.rank !== undefined))) {
      const sorted = [...siblings].sort((a, b) => (a.rank ?? a.index) - (b.rank ?? b.index));
      siblings.forEach((sibling, index) => { childrenArray[sibling.index] = cloneElement(sorted[index].child, { reorderable: true }); });
      edit.children = childrenArray;
    }
  }
  const element = Object.keys(edit).length ? cloneElement(children, edit) : children;
  return <SiteScope.Provider value={{ ...scope, path }}>{element}</SiteScope.Provider>;
}

// Mixed-content expressions retain their inline formatting and expose only the text node.
export function SiteText({ site, children }: { site: string; children: ReactNode }) {
  const scope = useContext(SiteScope);
  if (!scope || (typeof children !== "string" && typeof children !== "number")) return children;
  return <SiteElement site={site}><span>{children}</span></SiteElement>;
}

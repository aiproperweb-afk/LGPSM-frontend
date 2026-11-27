"use client";

import { createContext, useContext, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { usePuck } from "@puckeditor/core";
import { breakpointForWidth, type Breakpoint, type BuilderData, type StyleSet } from "../schema.ts";
import { computeResize, HANDLES, type Handle, type ResizeResult } from "../resizeMath.ts";
import { findNode, updateNode } from "../tree.ts";

export const ResizeGrid = createContext(0);
const positions: Record<Handle, string> = {
  n: "left-1/2 top-0", s: "left-1/2 top-full", e: "left-full top-1/2", w: "left-0 top-1/2",
  ne: "left-full top-0", nw: "left-0 top-0", se: "left-full top-full", sw: "left-0 top-full",
};
type Gesture = {
  pointer: number; handle: Handle; x: number; y: number; target: HTMLElement; previousCss: string;
  width: number; height: number; scale: number; layer: Breakpoint; aspect: boolean;
  min: { width: number; height: number }; max: { width: number; height: number }; snapWidths: number[]; snapHeights: number[];
  flexRow: boolean; next?: ResizeResult;
};

function elementFor(id: string, owner: Document): HTMLElement | null {
  const selector = '[data-cb="' + CSS.escape(id) + '"]';
  const candidate = owner.querySelector<HTMLElement>(selector);
  if (candidate) return candidate;
  for (const frame of owner.querySelectorAll("iframe")) {
    const element = frame.contentDocument?.querySelector<HTMLElement>(selector);
    if (element) return element;
  }
  return null;
}

export default function ResizeOverlay({ children, isSelected, componentId, componentType }: {
  children: ReactNode; isSelected: boolean; componentId: string; componentType: string;
}) {
  const { appState, dispatch } = usePuck();
  const grid = useContext(ResizeGrid);
  const gesture = useRef<Gesture>(null);
  const [size, setSize] = useState<ResizeResult>();
  const data = appState.data as BuilderData;
  const item = findNode(data, componentId)?.node;
  useEffect(() => () => {
    const current = gesture.current;
    if (current) current.target.style.cssText = current.previousCss;
  }, []);

  function start(event: PointerEvent<HTMLButtonElement>, handle: Handle) {
    if (event.button !== 0 || item?.props.locked) return;
    const target = elementFor(componentId, event.currentTarget.ownerDocument);
    if (!target || !target.parentElement || !target.offsetWidth || !target.offsetHeight) return;
    event.preventDefault();
    event.stopPropagation();
    const parent = target.parentElement;
    const root = target.ownerDocument.defaultView;
    const viewport = appState.ui.viewports.current.width;
    const scale = event.currentTarget.getBoundingClientRect().width / (event.currentTarget.offsetWidth || 1) || 1;
    const style = root?.getComputedStyle(target);
    const container = root?.getComputedStyle(parent);
    const limit = (value: string | undefined, fallback: number) => value?.endsWith("px") ? Number.parseFloat(value) : fallback;
    const siblings = [...parent.children].filter(child => child !== target) as HTMLElement[];
    gesture.current = {
      pointer: event.pointerId, handle, x: event.clientX, y: event.clientY, target, previousCss: target.style.cssText,
      width: target.offsetWidth, height: target.offsetHeight, scale,
      layer: breakpointForWidth(typeof viewport === "number" ? viewport : (root?.innerWidth ?? 1280)),
      aspect: item?.props.lockAspect === true || (item?.props.lockAspect === undefined && /^(Image|Logo|Video)$/.test(componentType)),
      min: { width: Math.max(12, limit(style?.minWidth, 12)), height: Math.max(12, limit(style?.minHeight, 12)) },
      max: { width: Math.min(limit(style?.maxWidth, 3000), parent.clientWidth || 3000), height: limit(style?.maxHeight, 3000) },
      snapWidths: [parent.clientWidth, ...siblings.map(child => child.offsetWidth)],
      snapHeights: siblings.map(child => child.offsetHeight),
      flexRow: !!(container?.display.includes("flex") && container.flexDirection.startsWith("row")),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || current.pointer !== event.pointerId) return;
    event.stopPropagation();
    const next = computeResize({
      handle: current.handle, start: current, min: current.min, max: current.max,
      delta: { x: (event.clientX - current.x) / current.scale, y: (event.clientY - current.y) / current.scale },
      lockAspect: current.aspect || event.shiftKey, grid,
      snapWidths: current.snapWidths, snapHeights: current.snapHeights,
    });
    if (next.horizontal) {
      current.target.style.width = next.width + "px";
      if (current.flexRow) current.target.style.flexBasis = next.width + "px";
    }
    if (next.vertical) current.target.style.height = next.height + "px";
    current.next = next;
    setSize(next);
  }

  function finish(event: PointerEvent<HTMLButtonElement>, apply: boolean) {
    const current = gesture.current;
    if (!current || current.pointer !== event.pointerId) return;
    gesture.current = null;
    current.target.style.cssText = current.previousCss;
    setSize(undefined);
    event.stopPropagation();
    const next = current.next;
    if (!apply || !next) return;
    dispatch({ type: "setData", data: previous => updateNode(previous as BuilderData, componentId, node => {
      const style = (node.props.style ?? {}) as StyleSet;
      const layer = { ...style[current.layer] };
      if (next.horizontal) { layer.width = next.width + "px"; if (current.flexRow) layer.flexBasis = layer.width; }
      if (next.vertical) layer.height = next.height + "px";
      return { ...node, props: { ...node.props, style: { ...style, [current.layer]: layer } } };
    }) });
  }

  return <>
    {children}
    {isSelected && item?.props.locked !== true && !["Icon", "Divider"].includes(componentType) && (
      <div className="pointer-events-none absolute inset-0 z-10">
        {HANDLES.map(handle => <button key={handle} type="button" aria-label={"Resize " + handle}
          data-puck-overlay-portal data-contact-resize={handle}
          className={"pointer-events-auto absolute size-3 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-blue-600 bg-white " + positions[handle]}
          style={{ cursor: handle + "-resize" }}
          onPointerDown={e => start(e, handle)} onPointerMove={move}
          onPointerUp={e => finish(e, true)} onPointerCancel={e => finish(e, false)} onLostPointerCapture={e => finish(e, false)}
          onClick={e => { e.preventDefault(); e.stopPropagation(); }} />)}
        {size && <output className="absolute bottom-full left-0 rounded bg-blue-700 px-1.5 text-xs text-white">{size.width} ? {size.height}</output>}
      </div>
    )}
  </>;
}

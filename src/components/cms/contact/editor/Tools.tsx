"use client";

import { useEffect, useRef } from "react";
import { usePuck } from "@puckeditor/core";
import { buildBlankPage, buildDefaultPage, PRESETS, TEMPLATES, withIds } from "../defaults.ts";
import { visitNodes, type BuilderData, type BuilderNode, type StyleSet } from "../schema.ts";
import { displayName, findNode, insertNodes, pasteNodes, randomId, removeNode, resetNode, updateNode } from "../tree.ts";

export default function Tools({ save, disabled, contact }: { save: () => void; disabled: boolean; contact: boolean }) {
  const { appState, dispatch, selectedItem, getSelectorForId, history } = usePuck();
  const clipboard = useRef<BuilderNode>(null);
  const copiedStyle = useRef<StyleSet>(null);
  const data = appState.data as BuilderData;
  const selected = selectedItem?.props.id;
  const current = selected ? findNode(data, selected) : null;
  const locked = !!current?.node.props.locked;
  const layers: { id: string; label: string }[] = [];
  visitNodes(data.content, (node, ancestors) => {
    layers.push({ id: node.props.id, label: [...ancestors, node].map(displayName).join(" / ") });
  });
  const apply = (next: BuilderData) => dispatch({ type: "setData", data: next });
  const update = (props: Record<string, unknown>) => {
    if (selected) apply(updateNode(data, selected, node => ({ ...node, props: { ...node.props, ...props } })));
  };
  const paste = (nodes: BuilderNode[]) => {
    const result = pasteNodes(data, selected ?? null, nodes);
    if (result) apply(result.data);
  };
  const selectParent = () => {
    const selector = current?.parentId ? getSelectorForId(current.parentId) : null;
    dispatch({ type: "setUi", ui: { itemSelector: selector ?? null } });
  };
  const move = (step: number) => {
    if (!current || locked || current.index + step < 0 || current.index + step >= current.siblings) return;
    apply(insertNodes(removeNode(data, current.node.props.id), { ...current, index: current.index + step }, [current.node]));
  };

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      const element = event.target as Element | null;
      if (disabled || element?.closest?.("input,textarea,select,[contenteditable=true]")) return;
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && key === "s") { event.preventDefault(); save(); }
      if (modifier && key === "c" && current) { event.preventDefault(); clipboard.current = current.node; }
      if (modifier && key === "v" && clipboard.current) { event.preventDefault(); paste([clipboard.current]); }
      if (modifier && key === "d" && current && !locked) { event.preventDefault(); paste([current.node]); }
      if ((key === "backspace" || key === "delete") && selected && !locked) { event.preventDefault(); apply(removeNode(data, selected)); selectParent(); }
    };
    const docs = [document, ...Array.from(document.querySelectorAll("iframe")).map(frame => frame.contentDocument).filter((doc): doc is Document => !!doc)];
    docs.forEach(doc => doc.addEventListener("keydown", keyboard));
    return () => docs.forEach(doc => doc.removeEventListener("keydown", keyboard));
  });

  return <div className="contact-builder-actions flex flex-wrap items-center gap-2 text-xs" aria-label="Contact editor actions">
    <label>Layers <select className="max-w-64" value={selected ?? ""} disabled={disabled} onChange={event => {
      const selector = event.target.value ? getSelectorForId(event.target.value) : null;
      dispatch({ type: "setUi", ui: { itemSelector: selector ?? null, previewMode: "edit", rightSideBarVisible: true } });
    }}>
      <option value="">Select a section or element</option>
      {layers.map(layer => <option key={layer.id} value={layer.id}>{layer.label}</option>)}
    </select></label>
    <button type="button" disabled={!history.hasPast || disabled} onClick={history.back}>Undo</button>
    <button type="button" disabled={!history.hasFuture || disabled} onClick={history.forward}>Redo</button>
    <button type="button" disabled={disabled} onClick={() => dispatch({
      type: "setUi", ui: { previewMode: appState.ui.previewMode === "edit" ? "interactive" : "edit" },
    })}>{appState.ui.previewMode === "edit" ? "Preview" : "Edit"}</button>
    {contact && <><label>Template <select value="" disabled={disabled} onChange={event => {
      const template = TEMPLATES.find(item => item.id === event.target.value);
      if (template) apply({ ...data, content: [...data.content, ...withIds([template.build()], randomId)] });
    }}><option value="">Insert?</option>{TEMPLATES.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <button type="button" disabled={disabled} onClick={() => { if (window.confirm("Reset the draft to the original design?")) apply(buildDefaultPage()); }}>Reset page</button>
    <button type="button" disabled={disabled} onClick={() => { if (window.confirm("Start a blank draft?")) apply(buildBlankPage()); }}>Blank page</button></>}
    {current && <>
      <span className="max-w-64 truncate" title={[...current.ancestors, current.node].map(displayName).join(" / ")}>{[...current.ancestors, current.node].map(displayName).join(" / ")}</span>
      <button type="button" disabled={disabled} onClick={selectParent}>Parent</button>
      <button type="button" disabled={disabled || locked || current.index === 0} onClick={() => move(-1)}>Move up</button>
      <button type="button" disabled={disabled || locked || current.index === current.siblings - 1} onClick={() => move(1)}>Move down</button>
      <button type="button" disabled={disabled || locked} onClick={() => paste([current.node])}>Duplicate</button>
      <button type="button" disabled={disabled || locked} onClick={() => { apply(removeNode(data, current.node.props.id)); selectParent(); }}>Delete</button>
      <button type="button" disabled={disabled} onClick={() => update({ hidden: !current.node.props.hidden })}>{current.node.props.hidden ? "Show" : "Hide"}</button>
      <button type="button" disabled={disabled} onClick={() => update({ locked: !locked })}>{locked ? "Unlock" : "Lock"}</button>
      <button type="button" disabled={disabled || locked || current.node.type === "ExistingSection"} onClick={() => apply(updateNode(data, current.node.props.id, resetNode))}>Reset element</button>
      <button type="button" disabled={disabled} onClick={() => { copiedStyle.current = (current.node.props.style ?? {}) as StyleSet; }}>Copy style</button>
      <button type="button" disabled={disabled || locked} onClick={() => { if (copiedStyle.current) update({ style: structuredClone(copiedStyle.current) }); }}>Paste style</button>
      <label>Preset <select value="" disabled={disabled || locked} onChange={event => {
        const preset = PRESETS.find(item => item.name === event.target.value);
        if (preset) update({ style: { ...(current.node.props.style as StyleSet), ...preset.style } });
      }}><option value="">Apply?</option>{PRESETS.map(item => <option key={item.name}>{item.name}</option>)}</select></label>
    </>}
  </div>;
}

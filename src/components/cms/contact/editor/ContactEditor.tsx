"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createUsePuck, Puck, type Overrides } from "@puckeditor/core";
import "@puckeditor/core/no-external.css";
import "./workspace.css";
import { cmsService } from "@/services/cmsService";
import { resolveImageUrl } from "@/utils/mediaUrl";
import type { CmsPageDetail } from "../../types";
import { UploadActivity } from "../../UploadActivity";
import { validatePageData } from "../../validatePageData";
import { BASE_CSS } from "../baseCss.ts";
import { migrateLegacyContact } from "../defaults.ts";
import { buildCss } from "../styleCss.ts";
import { isBuilderData, validateBuilderData, publishProblems, type BuilderData } from "../schema.ts";
import { contactEditorConfig } from "./config";
import ResizeOverlay, { ResizeGrid } from "./ResizeOverlay";
import Tools from "./Tools";
import { convertVisualDraft, validateVisualData, type VisualSlug } from "../../visualData";
import { createVisualEditorConfig } from "./visualConfig";

const useCanvasState = createUsePuck();
const Canvas = ({ children }: { children: ReactNode }) => {
  const data = useCanvasState(state => state.appState.data) as BuilderData;
  const dispatch = useCanvasState(state => state.dispatch);
  const getSelectorForId = useCanvasState(state => state.getSelectorForId);
  const previewMode = useCanvasState(state => state.appState.ui.previewMode);
  const fonts = typeof document === "undefined" ? undefined : Object.fromEntries(
    ["--font-dm-sans", "--font-inter", "--font-space-grotesk", "--font-caveat"].map(name => [name, getComputedStyle(document.documentElement).getPropertyValue(name)])
  );
  function selectElement(event: MouseEvent<HTMLDivElement>) {
    if (previewMode !== "edit") return;
    const target = event.target as Element;
    if (target.closest?.("[data-contact-resize], [data-puck-overlay]")) return;
    if (target.closest?.("a[href]")) event.preventDefault();
    const id = target.closest?.("[data-cb]")?.getAttribute("data-cb");
    const selector = id ? getSelectorForId(id) : undefined;
    if (!selector) return;
    // Resolve the actual Contact element after Puck's preview and inline controls handle the click.
    queueMicrotask(() => dispatch({ type: "setUi", ui: { itemSelector: selector, rightSideBarVisible: true } }));
  }
  return <div className="cb-root cb-page" style={fonts} onClickCapture={selectElement} onSubmitCapture={event => { event.preventDefault(); event.stopPropagation(); }}>
    <style>{BASE_CSS + buildCss(data, resolveImageUrl, true)}</style>{children}
  </div>;
};

function readDraft(value: unknown) {
  if (isBuilderData(value)) {
    const result = validateBuilderData(value);
    return result.ok ? result.data : null;
  }
  return validatePageData(value, "contact") ? migrateLegacyContact(value) : null;
}

type EditorSlug = VisualSlug | "contact";
const checkData = (data: unknown, slug: EditorSlug) => slug === "contact" ? validateBuilderData(data) : validateVisualData(data, slug);
const fingerprint = (data: BuilderData, slug: EditorSlug) => {
  const checked = checkData(data, slug);
  return JSON.stringify(checked.ok ? checked.data : data);
};

export default function ContactEditor({ slug = "contact" }: { slug?: EditorSlug }) {
  const [config] = useState(() => slug === "contact" ? contactEditorConfig : createVisualEditorConfig(slug));
  const load = (data: unknown) => slug === "contact" ? readDraft(data) : convertVisualDraft(data, slug);
  const [page, setPage] = useState<CmsPageDetail>();
  const [initial, setInitial] = useState<BuilderData>();
  const [generation, remount] = useState(0);
  const [attempt, retry] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [grid, setGrid] = useState(0);
  const [message, setMessage] = useState("");
  const latest = useRef<BuilderData>(null);
  const saved = useRef("");
  const busy = useRef(false);
  const uploading = useRef(0);

  const loadDraft = useCallback((data: BuilderData) => {
    latest.current = data;
    saved.current = fingerprint(data, slug);
    setInitial(data);
    setDirty(false);
    remount(n => n + 1);
  }, [slug]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const listing = await cmsService.listPages();
      if (!active) return;
      const selected = listing.data?.find(entry => entry.slug === slug);
      if (!selected) { setMessage(listing.message || "Could not load the CMS page."); return; }
      const result = await cmsService.getEditorPage(selected._id);
      if (!active) return;
      const data = result.data && (slug === "contact" ? readDraft(result.data.draftData) : convertVisualDraft(result.data.draftData, slug));
      if (!data || !result.data) { setMessage(result.message || "Could not read the saved draft."); return; }
      loadDraft(data);
      setPage(result.data);
      setConflict(false);
      setMessage("");
    })();
    return () => { active = false; };
  }, [attempt, slug, loadDraft]);

  useEffect(() => {
    if (!dirty && !uploads && !pending) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploads, pending]);

  async function save(action: "draft" | "publish" | "discard-draft") {
    if (!page || !latest.current || busy.current || uploading.current || conflict) return;
    if (action === "discard-draft" && !window.confirm("Discard the draft and restore the published page?")) return;
    const validation = checkData(latest.current, slug);
    if (!validation.ok && action !== "discard-draft") { setMessage(validation.path + ": " + validation.message); return; }
    if (validation.ok && action === "publish") {
      const problem = slug === "contact" ? publishProblems(validation.data)[0] : validation.data.content.length ? undefined : "Add content before publishing.";
      if (problem) { setMessage(problem); return; }
    }
    busy.current = true;
    setPending(true);
    setMessage("");
    try {
      const result = await cmsService.mutate(page._id, action, page.editVersion, validation.ok ? validation.data : latest.current);
      if (!result.success || !result.data) {
        setConflict(result.status === 409 && result.code === "CMS_EDIT_CONFLICT");
        setMessage(result.message || "The CMS operation failed.");
        return;
      }
      setPage(result.data);
      const data = load(result.data.draftData);
      if (data) {
        if (action === "discard-draft") loadDraft(data);
        else { saved.current = fingerprint(data, slug); setDirty(latest.current !== null && fingerprint(latest.current, slug) !== saved.current); }
      }
      setMessage(action === "publish" ? "Page published." : action === "draft" ? "Draft saved." : "Draft discarded.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  // The tools are defined inside Puck but call save using the current version and edit state.
  const saveDraft = useRef<() => void>(() => undefined);
  useEffect(() => { saveDraft.current = () => void save("draft"); });
  const [overrides] = useState<Partial<Overrides>>(() => ({
    iframe: Canvas, componentOverlay: ResizeOverlay,
    headerActions: () => <Tools save={() => saveDraft.current()} disabled={false} contact={slug === "contact"} />,
  }));
  const disabled = pending || uploads > 0 || conflict;
  return <div className="contact-builder flex h-full min-h-0 flex-col">
    <div className="contact-builder-toolbar flex flex-wrap items-center gap-2 px-4 py-2 text-sm">
      <Link href="/admin/pages" onClick={event => {
        if ((dirty || pending || uploads) && !window.confirm("Leave the editor with unsaved changes?")) event.preventDefault();
      }}>Back to Pages</Link>
      <h1 className="mr-auto text-base font-semibold">{page?.name ?? "Page"} builder</h1>
      {page && <>
        <button type="button" disabled={disabled} onClick={() => void save("draft")}>Save Draft</button>
        <button type="button" className="contact-builder-publish font-semibold" disabled={disabled} onClick={() => void save("publish")}>Publish</button>
        <button type="button" disabled={disabled || !page.publishedAt} onClick={() => void save("discard-draft")}>Discard Draft</button>
        <Link href={page.route} target="_blank" rel="noopener">View Live Page</Link>
        <label>Resize grid <select value={grid} onChange={event => setGrid(Number(event.target.value))}><option value="0">Off</option><option value="4">4 px</option><option value="8">8 px</option><option value="16">16 px</option></select></label>
        <button type="button" onClick={() => {
          if (!latest.current) return;
          const url = URL.createObjectURL(new Blob([JSON.stringify(latest.current, null, 2)], { type: "application/json" }));
          Object.assign(document.createElement("a"), { href: url, download: slug + ".json" }).click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}>Download JSON</button>
      </>}
      {(conflict || (!initial && message)) && <button type="button" onClick={() => {
        if (dirty && !window.confirm("Reload the saved draft and lose unsaved edits?")) return;
        setInitial(undefined);
        setMessage("");
        retry(n => n + 1);
      }}>Reload saved draft</button>}
      <p role="status" className="text-xs text-slate-300">{pending ? "Saving…" : uploads ? "Uploading image…" : message || (dirty ? "Unsaved changes" : !initial ? "Loading Contact page…" : "")}</p>
    </div>
    {initial && <ResizeGrid.Provider value={grid}>
      <UploadActivity.Provider value={delta => { uploading.current += delta; setUploads(uploading.current); }}>
        <div className="min-h-0 flex-1" inert={pending || uploads > 0}>
          <Puck key={generation} config={config} data={initial} height="100%" headerTitle={page?.name ?? "Page"}
            viewports={[{ width: 390, label: "Mobile", icon: "Smartphone" }, { width: 768, label: "Tablet", icon: "Tablet" }, { width: 1280, label: "Desktop", icon: "Monitor" }]}
            overrides={overrides}
            onChange={data => { latest.current = data as BuilderData; setDirty(fingerprint(data as BuilderData, slug) !== saved.current); }} />
        </div>
      </UploadActivity.Provider>
    </ResizeGrid.Provider>}
  </div>;
}

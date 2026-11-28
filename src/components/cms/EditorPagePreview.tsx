"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createUsePuck } from "@puckeditor/core";
import { CMS_PREVIEW_PARAM, PREVIEW_DRAFT, PREVIEW_READY } from "./PreviewBridge";
import { clientPages } from "./marketingContent";
import type { CmsPageData, CmsSlug } from "./types";

type Preview = { slug: CmsSlug; route: string; data: CmsPageData };
export const EditorPreviewContext = createContext<Preview | null>(null);
const usePuckSelector = createUsePuck();

const footerRoutes = [
  { label: "Home", route: "/#footer" },
  { label: "Contact", route: "/contact#footer" },
  { label: "Features", route: "/features#footer" },
  { label: "How it works", route: "/how-it-works#footer" },
  { label: "Client page", route: "/clients/business-corporate#footer" },
];

function PreviewFrame({ preview }: { preview: Preview }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [footerRoute, setFooterRoute] = useState(preview.route);
  const clientId = usePuckSelector(state => state.selectedItem?.props.id);
  const getSelectorForId = usePuckSelector(state => state.getSelectorForId);
  const dispatch = usePuckSelector(state => state.dispatch);
  const [viewport, setViewport] = useState("desktop");
  const client = clientPages.find(page => page.slug === clientId) ?? clientPages[0];
  const route = preview.slug === "footer" ? footerRoute : preview.slug === "clients" ? client.route : preview.route;
  const [path, hash] = route.split("#");
  const src = path + "?" + new URLSearchParams({ [CMS_PREVIEW_PARAM]: preview.slug }) + (hash ? "#" + hash : "");
  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: PREVIEW_DRAFT, slug: preview.slug, data: preview.data }, window.location.origin);
  }, [preview.data, preview.slug]);
  useEffect(() => {
    const ready = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frame.current?.contentWindow
        && event.data?.type === PREVIEW_READY && event.data.slug === preview.slug) send();
    };
    window.addEventListener("message", ready);
    send();
    return () => window.removeEventListener("message", ready);
  }, [preview.slug, send]);

  return (
    <div className="flex h-full min-h-[25rem] flex-col bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-3 py-2 text-xs text-slate-600">
        <span>Draft preview</span>
        <label className="flex items-center gap-2">
          Viewport
          <select value={viewport} onChange={event => setViewport(event.target.value)} className="rounded border px-2 py-1">
            <option value="desktop">Desktop</option>
            <option value="768px">Tablet</option>
            <option value="390px">Mobile</option>
          </select>
        </label>
        {preview.slug === "footer" && (
          <label className="flex items-center gap-2">
            Footer on
            <select value={footerRoute} onChange={event => setFooterRoute(event.target.value)} className="rounded border px-2 py-1">
              {footerRoutes.map(option => <option key={option.route} value={option.route}>{option.label}</option>)}
            </select>
          </label>
        )}
        {preview.slug === "clients" && (
          <label className="flex items-center gap-2">
            Client category
            <select value={client.slug} onChange={event => {
              const itemSelector = getSelectorForId(event.target.value);
              if (itemSelector) dispatch({ type: "setUi", ui: { itemSelector, rightSideBarVisible: true } });
            }} className="rounded border px-2 py-1">
              {clientPages.map(page => <option key={page.slug} value={page.slug}>{page.name}</option>)}
            </select>
          </label>
        )}
      </div>
        <iframe key={src} ref={frame} src={src} title="Styled draft preview" onLoad={send}
          sandbox="allow-scripts allow-same-origin" style={{ maxWidth: viewport === "desktop" ? undefined : viewport }}
          className="block min-h-0 w-full flex-1 self-center border-0" />
    </div>
  );
}

export default function EditorPagePreview({ children }: { children: ReactNode }) {
  const preview = useContext(EditorPreviewContext);
  return preview ? <PreviewFrame key={preview.slug} preview={preview} /> : <>{children}</>;
}

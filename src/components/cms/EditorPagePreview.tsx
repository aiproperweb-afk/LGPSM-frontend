"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { eventService } from "@/services/eventService";
import { userService } from "@/services/userService";
import { CMS_PREVIEW_PARAM, PREVIEW_DRAFT, PREVIEW_READY } from "./PreviewBridge";
import type { CmsPageData, CmsSlug } from "./types";

type Preview = { slug: CmsSlug; route: string; data: CmsPageData };
type RecordOption = { id: string; name: string };
export const EditorPreviewContext = createContext<Preview | null>(null);

const footerRoutes = [
  { label: "Home", route: "/#footer" },
  { label: "Contact", route: "/contact#footer" },
  { label: "Features", route: "/features#footer" },
  { label: "How it works", route: "/how-it-works#footer" },
  { label: "Client page", route: "/clients/business-corporate#footer" },
];

function PreviewFrame({ preview }: { preview: Preview }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const inviteePicker = preview.route === "/events/[id]/invitees";
  const [selected, setSelected] = useState(inviteePicker ? "select" : "");
  const [viewport, setViewport] = useState("desktop");
  const [footerRoute, setFooterRoute] = useState(preview.route);
  const [records, setRecords] = useState<RecordOption[]>();
  const [recordsError, setRecordsError] = useState(false);
  const recordBased = preview.route.includes("[id]");
  const organizer = preview.route.startsWith("/event-organizer/");
  useEffect(() => {
    if (!recordBased) return;
    let active = true;
    async function load() {
      const result = organizer ? await userService.getUsers("ORGANIZER") : await eventService.getEvents({ page: 1, limit: 100 });
      if (!active) return;
      if (!result.success) { setRecordsError(true); return; }
      const options = Array.isArray(result.data)
        ? result.data.map(user => ({ id: user._id, name: user.fullName }))
        : (result.data?.events ?? []).map(event => ({ id: event._id ?? event.id, name: event.title }));
      setRecords(options.filter(option => /^[a-f0-9]{24}$/i.test(option.id)));
    }
    void load();
    return () => { active = false; };
  }, [organizer, recordBased]);

  const route = preview.slug === "footer" ? footerRoute : preview.route.replace("[id]", selected);
  const [path, hash] = route.split("#");
  const src = (!recordBased || selected)
    ? path + "?" + new URLSearchParams({ [CMS_PREVIEW_PARAM]: preview.slug }) + (hash ? "#" + hash : "")
    : undefined;
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
        {recordBased && (
          <label className="flex items-center gap-2">
            {organizer ? "Organizer" : "Event"}
            <select value={selected} onChange={event => setSelected(event.target.value)} className="max-w-64 rounded border px-2 py-1">
              {inviteePicker ? <option value="select">Event picker</option> : <option value="">Choose a record</option>}
              {records?.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </label>
        )}
      </div>
      {src ? (
        <iframe key={src} ref={frame} src={src} title="Styled draft preview" onLoad={send}
          sandbox="allow-scripts allow-same-origin" style={{ maxWidth: viewport === "desktop" ? undefined : viewport }}
          className="block min-h-0 w-full flex-1 self-center border-0" />
      ) : (
        <p className="px-5 py-6 text-sm text-slate-600">{recordsError ? "Could not load preview records." : !records
          ? "Loading preview records?" : records.length ? "Choose a record to preview this screen." : "No records are available to preview this screen."}</p>
      )}
    </div>
  );
}

export default function EditorPagePreview({ children }: { children: ReactNode }) {
  const preview = useContext(EditorPreviewContext);
  return preview ? <PreviewFrame key={preview.slug} preview={preview} /> : <>{children}</>;
}

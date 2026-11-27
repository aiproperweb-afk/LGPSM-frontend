"use client";

import { Puck, type Overrides } from "@puckeditor/core";
import "@puckeditor/core/no-external.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cmsService } from "@/services/cmsService";
import { cmsConfig } from "./config";
import { UploadActivity } from "./UploadActivity";
import { upgradePageData, validatePageData } from "./validatePageData";
import type { CmsPageDetail, CmsPageData, CmsSlug } from "./types";

const overrides: Partial<Overrides<typeof cmsConfig>> = {
  drawer: () => <></>,
  headerActions: () => <></>,
  iframe: ({ children }) => (
    <div onSubmitCapture={event => { event.preventDefault(); event.stopPropagation(); }} onClickCapture={event => {
      if ((event.target as Element).closest?.("a[href], button[type=submit]")) event.preventDefault();
    }}>
      <style>{".reveal,.hero-anim{opacity:1!important;transform:none!important;animation:none!important}"}</style>
      {children}
    </div>
  ),
};

function fingerprint(data: CmsPageData) {
  return JSON.stringify({ root: data.root, content: data.content, zones: data.zones ?? {} });
}

export default function PageEditor({ slug }: { slug: CmsSlug }) {
  const [page, setPage] = useState<CmsPageDetail>();
  const [initial, setInitial] = useState<CmsPageData>();
  const [generation, remount] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [message, setMessage] = useState("");
  const [conflict, setConflict] = useState(false);
  const [attempt, retry] = useState(0);
  const latest = useRef<CmsPageData>(null);
  const saved = useRef("");
  const busy = useRef(false);
  const uploadCount = useRef(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      const listing = await cmsService.listPages();
      if (!active) return;
      const selected = listing.data?.find(item => item.slug === slug);
      if (!selected) {
        setMessage(listing.success ? "Page is missing from the CMS database." : listing.message || "Could not load pages.");
        return;
      }
      const result = await cmsService.getEditorPage(selected._id);
      if (!active) return;
      if (!result.success || !result.data) { setMessage(result.message || "Could not load page."); return; }
      const document = result.data;
      const draft = upgradePageData(document.draftData, slug);
      if (document.schemaVersion !== 1 || !validatePageData(draft, slug)) {
        setMessage("This page uses an unsupported CMS document.");
        return;
      }
      latest.current = draft;
      saved.current = fingerprint(draft);
      setInitial(draft);
      setPage(document);
      setDirty(false);
      setConflict(false);
      setMessage("");
      remount(n => n + 1);
    })();
    return () => { active = false; };
  }, [slug, attempt]);

  useEffect(() => {
    if (!dirty && !uploads && !pending) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploads, pending]);

  async function save(action: "draft" | "publish" | "discard-draft", data = latest.current) {
    if (!page || !data || busy.current || uploadCount.current || conflict) return;
    if (action === "discard-draft" && !window.confirm("Discard the draft and restore the published version?")) return;
    if (action !== "discard-draft" && !validatePageData(data, slug)) {
      setMessage("Check image references and content fields before continuing.");
      return;
    }
    busy.current = true;
    setPending(true);
    setMessage("");
    try {
      const result = await cmsService.mutate(page._id, action, page.editVersion, data);
      if (!result.success || !result.data) {
        const stale = result.status === 409 && result.code === "CMS_EDIT_CONFLICT";
        setConflict(stale);
        setMessage(stale ? "Another administrator changed this page. Download your changes before reloading to reconcile them." : result.message || "The CMS operation failed.");
        return;
      }
      setPage(result.data);
      const draft = upgradePageData(result.data.draftData, slug);
      if (validatePageData(draft, slug)) {
        saved.current = fingerprint(draft);
        if (action === "discard-draft") {
          latest.current = draft;
          setInitial(draft);
          remount(n => n + 1);
        }
        setDirty(latest.current !== null && fingerprint(latest.current) !== saved.current);
      }
      setMessage(action === "publish" ? "Page published." : action === "draft" ? "Draft saved." : "Draft discarded.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ schemaVersion: 1, data: latest.current }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = slug + ".json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function reload() {
    if (dirty && !window.confirm("Reload the saved draft and discard local changes?")) return;
    setPage(undefined);
    setInitial(undefined);
    setMessage("");
    retry(n => n + 1);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 px-4 py-2 text-sm [&_button]:font-semibold [&_button]:text-blue-700 [&_button:disabled]:opacity-50 [&_a]:text-blue-700">
        <Link href="/admin/pages" onClick={event => {
          if ((pending || uploads || dirty) && !window.confirm("Leave the editor and lose unsaved changes?")) event.preventDefault();
        }}>Back to Pages</Link>
        {page && <>
          <button disabled={pending || !!uploads || conflict} onClick={() => void save("draft")}>Save Draft</button>
          <button disabled={pending || !!uploads || conflict} onClick={() => void save("publish")}>Publish</button>
          <button disabled={pending || !!uploads || conflict || !page.publishedAt} onClick={() => void save("discard-draft")}>Discard Draft</button>
          <button onClick={download}>Download JSON</button>
          {page.publishedAt && <Link href={page.route} target="_blank" rel="noopener">View Live Page</Link>}
        </>}
        {(conflict || (!page && message)) && <button onClick={reload}>Reload saved draft</button>}
        <p role="status">{pending ? "Saving…" : uploads ? "Uploading image…" : message || (!page ? "Loading page…" : dirty ? "Unsaved changes" : "")}</p>
      </div>
      {page && initial && (
        <UploadActivity.Provider value={delta => {
          uploadCount.current += delta;
          setUploads(uploadCount.current);
        }}>
          <div className="min-h-0 flex-1" inert={pending || uploads > 0} aria-busy={pending || uploads > 0}>
            <Puck key={generation}
              config={cmsConfig}
              data={initial}
              headerTitle={page.name}
              height="100%"
              permissions={{ insert: false, delete: false, duplicate: false, drag: false, edit: true }}
              overrides={overrides}
              onChange={data => {
                latest.current = data;
                setDirty(fingerprint(data) !== saved.current);
              }}
            />
          </div>
        </UploadActivity.Provider>
      )}
    </div>
  );
}

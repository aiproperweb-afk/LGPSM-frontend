"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const CMS_PREVIEW_PARAM = "cms-preview";
export const PREVIEW_READY = "cms:preview-ready";
export const PREVIEW_DRAFT = "cms:preview-draft";

export function isCmsPreviewWindow() {
  return typeof window !== "undefined" && window.parent !== window
    && new URLSearchParams(window.location.search).has(CMS_PREVIEW_PARAM);
}

const Draft = createContext<{ slug: string; data: unknown } | null>(null);

export function PreviewBridge({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<{ slug: string; data: unknown } | null>(null);
  useEffect(() => {
    if (!isCmsPreviewWindow()) return;
    const slug = new URLSearchParams(window.location.search).get(CMS_PREVIEW_PARAM);
    if (!slug) return;
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent
        || event.data?.type !== PREVIEW_DRAFT || event.data.slug !== slug) return;
      setDraft({ slug, data: event.data.data });
    };
    const blockSubmit = (event: Event) => { event.preventDefault(); event.stopImmediatePropagation(); };
    const blockControl = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a, button, input, select, textarea, label, [role=button]")
        && !event.target.closest("[data-cms-preview-toggle]")) blockSubmit(event);
    };
    document.documentElement.dataset.cmsPreview = "true";
    window.addEventListener("message", receive);
    document.addEventListener("submit", blockSubmit, true);
    document.addEventListener("click", blockControl, true);
    window.parent.postMessage({ type: PREVIEW_READY, slug }, window.location.origin);
    return () => {
      delete document.documentElement.dataset.cmsPreview;
      window.removeEventListener("message", receive);
      document.removeEventListener("submit", blockSubmit, true);
      document.removeEventListener("click", blockControl, true);
    };
  }, []);

  return <Draft.Provider value={draft}>{children}</Draft.Provider>;
}

export function useCmsPreviewDraft(slug?: string) {
  const draft = useContext(Draft);
  return draft && draft.slug === slug ? draft.data : undefined;
}

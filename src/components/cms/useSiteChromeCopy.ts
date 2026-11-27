"use client";

import { useEffect, useState } from "react";
import { useCmsPreviewDraft } from "./PreviewBridge";
import { publicCmsUrl } from "@/services/cmsService";
import { validatePageData } from "./validatePageData";

type SiteChromeSlug = "navbar" | "footer";
export type SiteChromeText = (key: string, fallback: string) => string;

export function useSiteChromeCopy(slug: SiteChromeSlug): SiteChromeText {
  const draft = useCmsPreviewDraft(slug);
  const [labels, setLabels] = useState<Record<string, string>>();
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    async function load() {
      try {
        const response = await fetch(publicCmsUrl(slug), { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json();
        if (controller.signal.aborted || !payload.success || payload.data?.schemaVersion !== 1) return;
        const data: unknown = payload.data.content;
        if (validatePageData(data, slug) && data.content[0]?.type === "SiteChromeCopy") {
          setLabels(data.content[0].props.labels);
        }
      } catch {
        // The navbar and footer render their bundled copy when the CMS is unavailable.
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [slug]);
  const section = validatePageData(draft, slug) ? draft.content[0] : undefined;
  const copy = section?.type === "SiteChromeCopy" ? section.props.labels : labels;
  return (key, fallback) => copy && Object.hasOwn(copy, key) ? copy[key] : fallback;
}

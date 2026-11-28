import { publicCmsUrl } from "@/services/cmsService";
import { initialPageData } from "./initialData";
import { upgradePageData, validatePageData } from "./validatePageData";

import { classicSections, validateVisualData, type VisualSlug } from "./visualData";
import type { CmsSlug } from "./types";

export async function getPublishedDocument(slug: CmsSlug) {
  try {
    const response = await fetch(publicCmsUrl(slug), { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (payload.success === true && payload.data?.schemaVersion === 1 && slug !== "contact" && !slug.startsWith("clients-")) {
      const visual = validateVisualData(payload.data?.content, slug as VisualSlug);
      if (visual.ok) return { visual: visual.data, classic: classicSections(visual.data, slug as VisualSlug) };
    }
    const content = upgradePageData(payload.data?.content, slug);
    if (payload.success === true && payload.data?.schemaVersion === 1 && validatePageData(content, slug)) {
      return { classic: content };
    }
    throw new Error("Invalid or unsupported CMS document");
  } catch (error) {
    console.warn(`[CMS] Serving bundled page (${slug}):`, error instanceof Error ? error.message : "Request failed");
    return { classic: initialPageData[slug] };
  }
}

export async function getPublishedPage(slug: CmsSlug) {
  return (await getPublishedDocument(slug)).classic;
}

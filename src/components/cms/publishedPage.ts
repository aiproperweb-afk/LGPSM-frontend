import { publicCmsUrl } from "@/services/cmsService";
import { initialPageData } from "./initialData";
import { upgradePageData, validatePageData } from "./validatePageData";

import type { CmsSlug } from "./types";

export async function getPublishedPage(slug: CmsSlug) {
  try {
    const response = await fetch(publicCmsUrl(slug), { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const content = upgradePageData(payload.data?.content, slug);
    if (payload.success === true && payload.data?.schemaVersion === 1 && validatePageData(content, slug)) {
      return content;
    }
    throw new Error("Invalid or unsupported CMS document");
  } catch (error) {
    console.warn(`[CMS] Serving bundled page (${slug}):`, error instanceof Error ? error.message : "Request failed");
    return initialPageData[slug];
  }
}

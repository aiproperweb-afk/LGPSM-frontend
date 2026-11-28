import { publicCmsUrl } from "@/services/cmsService";
import { initialPageData } from "../initialData";
import { validatePageData } from "../validatePageData";
import type { CmsPageData } from "../types";
import { isBuilderData, validateBuilderData, type BuilderData } from "./schema.ts";

export type PublishedContact = { kind: "builder"; data: BuilderData } | { kind: "classic"; data: CmsPageData };

/**
 * The published Contact page: a visual builder document, or the earlier single-section document (shown exactly as
 * before). Anything missing or invalid falls back to the bundled page.
 */
export async function getPublishedContact(): Promise<PublishedContact> {
  try {
    const response = await fetch(publicCmsUrl("contact"), { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const content: unknown = payload.data?.content;
    if (payload.success === true && payload.data?.schemaVersion === 1) {
      if (isBuilderData(content)) {
        const result = validateBuilderData(content);
        if (result.ok) return { kind: "builder", data: result.data };
        throw new Error(`Invalid Contact builder document at ${result.path}: ${result.message}`);
      }
      if (validatePageData(content, "contact")) return { kind: "classic", data: content };
    }
    throw new Error("Invalid or unsupported CMS document");
  } catch (error) {
    console.warn("[CMS] Serving bundled page (contact):", error instanceof Error ? error.message : "Request failed");
    return { kind: "classic", data: initialPageData.contact };
  }
}

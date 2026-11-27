import type { Data } from "@puckeditor/core";
import type { HomeContent } from "./homeContent";

import type { ContactCopy } from "./contactContent";

type TextCopy = { labels: Record<string, string> };

export type CmsComponents = HomeContent & { ContactContent: ContactCopy; DashboardCopy: TextCopy; SiteChromeCopy: TextCopy };
export type CmsPageData = Data<CmsComponents>;
export type CmsSlug = "home" | "contact" | "navbar" | "footer" | `workspace-${string}`;

export interface CmsPageSummary {
  _id: string;
  slug: string;
  name: string;
  route: string;
  status: "PUBLISHED" | "DRAFT";
  schemaVersion: number;
  version: number;
  editVersion: number;
  publishedAt?: string;
  updatedAt?: string;
}

export interface CmsPageDetail extends CmsPageSummary {
  draftData: unknown;
  publishedData?: unknown;
}

import type { Data } from "@puckeditor/core";
import type { HomeContent } from "./homeContent";

import type { ContactCopy } from "./contactContent";

export type CmsComponents = HomeContent & { ContactContent: ContactCopy; DashboardCopy: { labels: Record<string, string> } };
export type CmsPageData = Data<CmsComponents>;
export type CmsSlug = "home" | "contact" | `workspace-${string}`;

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

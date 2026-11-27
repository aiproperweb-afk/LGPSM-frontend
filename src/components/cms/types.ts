import type { Data } from "@puckeditor/core";
import type { HomeContent } from "./homeContent";

import type { ContactCopy } from "./contactContent";

type TextCopy = { labels: Record<string, string> };

import type { ClientCopy, TestimonialsCopy, featuresCopy, howItWorksCopy } from "./marketingContent";

export type CmsComponents = HomeContent & { ContactContent: ContactCopy; SiteChromeCopy: TextCopy;
  FeaturesContent: typeof featuresCopy;
  HowItWorksContent: typeof howItWorksCopy;
  ClientContent: ClientCopy;
  Testimonials: TestimonialsCopy };
export type CmsPageData = Data<CmsComponents>;
export type PublicPageSlug = "home" | "contact" | "features" | "how-it-works" | `clients-${string}`;
export type CmsSlug = PublicPageSlug | "navbar" | "footer";

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

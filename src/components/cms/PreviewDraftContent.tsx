"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useCmsPreviewDraft } from "./PreviewBridge";
import type { ClientSharedContent } from "./PreviewRenderer";
import type { PublicPageSlug } from "./types";
import { validatePageData } from "./validatePageData";

const DraftRenderer = dynamic(() => import("./PreviewRenderer"));

export default function PreviewDraftContent({ slug, children, clientShared }: { slug: PublicPageSlug; children: ReactNode; clientShared?: ClientSharedContent }) {
  const draft = useCmsPreviewDraft(slug);
  return validatePageData(draft, slug) ? <DraftRenderer data={draft} clientShared={clientShared} /> : children;
}

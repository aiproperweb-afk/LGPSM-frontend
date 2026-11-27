"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useCmsPreviewDraft } from "./PreviewBridge";
import { validatePageData } from "./validatePageData";

const DraftRenderer = dynamic(() => import("./PreviewRenderer"));

export default function PreviewDraftContent({ slug, children }: { slug: "home" | "contact"; children: ReactNode }) {
  const draft = useCmsPreviewDraft(slug);
  return validatePageData(draft, slug) ? <DraftRenderer data={draft} /> : children;
}

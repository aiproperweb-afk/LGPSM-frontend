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
  const clients = useCmsPreviewDraft("clients");
  if (slug.startsWith("clients-") && validatePageData(clients, "clients")) {
    const section = clients.content.find(item => item.type === "ClientContent" && item.props.id === slug);
    if (section) return <DraftRenderer data={{ root: { props: {} }, content: [section] }} clientShared={clientShared} />;
  }
  return validatePageData(draft, slug) ? <DraftRenderer data={draft} clientShared={clientShared} /> : children;
}

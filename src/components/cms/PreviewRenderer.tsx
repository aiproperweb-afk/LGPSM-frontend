"use client";

import ClientPage from "@/components/clients/ClientPage";
import { getClientCategory } from "@/constants/clients";
import type { ComponentProps } from "react";
import { Render } from "@puckeditor/core";
import { publicConfig } from "./publicConfig";
import type { CmsPageData } from "./types";

export type ClientSharedContent = Pick<ComponentProps<typeof ClientPage>, "testimonials" | "faq" | "stats">;

export default function PreviewRenderer({ data, clientShared }: { data: CmsPageData; clientShared?: ClientSharedContent }) {
  const section = data.content[0];
  if (section?.type === "ClientContent") {
    const category = getClientCategory(section.props.id.replace(/^clients-/, ""));
    if (category) return <ClientPage category={category} copy={section.props} {...clientShared} />;
  }
  return <Render config={publicConfig} data={data} />;
}

"use client";

import { Render } from "@puckeditor/core";
import { publicConfig } from "./publicConfig";
import type { CmsPageData } from "./types";

export default function PreviewRenderer({ data }: { data: CmsPageData }) {
  return <Render config={publicConfig} data={data} />;
}

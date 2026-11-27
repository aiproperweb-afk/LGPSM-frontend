import { Render } from "@puckeditor/core/rsc";
import PreviewDraftContent from "./PreviewDraftContent";
import { publicConfig } from "./publicConfig";
import type { CmsPageData } from "./types";

export default function PublicPageRenderer({ data, slug }: { data: CmsPageData; slug: "home" | "contact" }) {
  return <PreviewDraftContent slug={slug}><Render config={publicConfig} data={data} /></PreviewDraftContent>;
}

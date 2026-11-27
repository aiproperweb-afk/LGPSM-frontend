import { Render } from "@puckeditor/core/rsc";
import { cmsConfig } from "./config";
import type { CmsPageData } from "./types";

export default function PublicPageRenderer({ data }: { data: CmsPageData }) {
  return <Render config={cmsConfig} data={data} />;
}

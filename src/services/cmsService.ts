import { apiClient, API_BASE_URL } from "./apiClient";
import type { CmsPageDetail, CmsPageSummary, CmsPageData } from "@/components/cms/types";

const base = API_BASE_URL.replace(/\/api\/v1$/, "") + "/api/v1";
const pages = base + "/admin/pages";

export const cmsService = {
  getDashboardCopy: (slug: string) => apiClient<{ content: unknown }>(base + '/workspace/pages/' + encodeURIComponent(slug), { cache: 'no-store' }, true),
  listPages: () => apiClient<CmsPageSummary[]>(pages, { cache: "no-store" }, true),
  getEditorPage: (id: string) => apiClient<CmsPageDetail>(pages + "/" + encodeURIComponent(id), { cache: "no-store" }, true),
  mutate(id: string, action: "draft" | "publish" | "discard-draft", version: number, data: CmsPageData) {
    return apiClient<CmsPageDetail>(pages + "/" + encodeURIComponent(id) + "/" + action, {
      method: action === "draft" ? "PATCH" : "POST",
      headers: { "If-Match": `"${version}"` },
      body: action === "discard-draft" ? undefined : JSON.stringify({ data }),
    }, true);
  },
};

export const publicCmsUrl = (slug: string) => base + "/public/pages/" + encodeURIComponent(slug);

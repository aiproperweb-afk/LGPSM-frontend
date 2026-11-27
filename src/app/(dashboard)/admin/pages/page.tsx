"use client";

import { useDashboardCopy } from "@/components/cms/DashboardCopyProvider";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cmsService } from "@/services/cmsService";
import type { CmsPageSummary } from "@/components/cms/types";

export default function PagesListing() {
  const cmsText = useDashboardCopy();
  const [pages, setPages] = useState<CmsPageSummary[]>();
  const [error, setError] = useState("");
  const [attempt, retry] = useState(0);
  useEffect(() => {
    let active = true;
    void cmsService.listPages().then(result => {
      if (!active) return;
      if (result.success && result.data) setPages(result.data);
      else setError(result.message || "Could not load pages.");
    });
    return () => { active = false; };
  }, [attempt]);

  return (
    <section className="w-full px-4 py-6 sm:px-8">
      <h1 className="mb-5 text-2xl font-semibold">{cmsText("pages", "Pages")}</h1>
      {error ? (
        <p role="alert">{error} <button className="text-blue-700 underline" onClick={() => { setError(""); retry(n => n + 1); }}>{cmsText("retry", "Retry")}</button></p>
      ) : !pages ? <p role="status">{cmsText("loadingPages", "Loading pages…")}</p> : pages.length === 0 ? <p>{cmsText("noPagesHaveBeenSeeded", "No pages have been seeded.")}</p> : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-gray-50"><tr>
              {["Page", "Route", "Status", "Last updated", "Actions"].map(header => (
                <th key={header} scope="col" className="px-4 py-3">{cmsText("column" + header.replaceAll(" ", ""), header)}</th>
              ))}
            </tr></thead>
            <tbody>{pages.map(page => (
              <tr key={page._id} className="border-t border-gray-200">
                <th scope="row" className="px-4 py-3 font-medium">{page.name}</th>
                <td className="px-4 py-3"><code>{page.route}</code></td>
                <td className="px-4 py-3">{page.status === "PUBLISHED" ? cmsText("published", "Published") : page.publishedAt ? cmsText("publishedWithDraft", "Published with draft") : cmsText("draft", "Draft")}</td>
                <td className="px-4 py-3">{page.updatedAt ? <time dateTime={page.updatedAt}>{new Date(page.updatedAt).toLocaleString()}</time> : cmsText("unavailable", "Unavailable")}</td>
                <td className="px-4 py-3"><div className="flex gap-4 font-semibold text-blue-700">
                  <Link href={`/admin/pages/${encodeURIComponent(page.slug)}/edit`}>{cmsText("edit", "Edit")}</Link>
                  {page.publishedAt && !page.route.includes("[id]") && <Link href={page.route}>{cmsText("viewLivePage", "View live page")}</Link>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

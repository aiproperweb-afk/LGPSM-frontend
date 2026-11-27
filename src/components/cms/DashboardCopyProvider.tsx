"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useCmsPreviewDraft } from "./PreviewBridge";
import { cmsService } from "@/services/cmsService";
import { dashboardPageAt, dashboardSlug } from "./dashboardCatalog";
import { validatePageData } from "./validatePageData";
import type { CmsSlug } from "./types";

type Translate = (key: string, fallback: string) => string;
const fallback: Translate = (_key, text) => text;
const ScreenCopy = createContext<Translate>(fallback);
const NavigationCopy = createContext<Translate>(fallback);

function usePublishedCopy(slug?: CmsSlug): Translate {
  const draft = useCmsPreviewDraft(slug);
  const [revision, refresh] = useState(0);
  useEffect(() => {
    const onPublish = () => refresh(value => value + 1);
    window.addEventListener("cms:published", onPublish);
    return () => window.removeEventListener("cms:published", onPublish);
  }, []);
  const [published, setPublished] = useState<{ slug: CmsSlug; labels: Record<string, string> }>();
  useEffect(() => {
    if (!slug) return;
    let active = true;
    void cmsService.getDashboardCopy(slug).then(result => {
      const data = result.data?.content;
      if (!active || !result.success || !validatePageData(data, slug)) return;
      const section = data.content[0];
      if (section?.type === "DashboardCopy") setPublished({ slug, labels: section.props.labels });
    });
    return () => { active = false; };
  }, [slug, revision]);
  const section = slug && validatePageData(draft, slug) ? draft.content[0] : undefined;
  const labels = section?.type === "DashboardCopy" ? section.props.labels : published && published.slug === slug ? published.labels : undefined;
  return labels ? (key, text) => Object.hasOwn(labels, key) ? labels[key] : text : fallback;
}

export function DashboardCopyProvider({ pathname, children }: { pathname: string; children: ReactNode }) {
  const slug = dashboardPageAt(pathname)?.slug;
  const navigation = usePublishedCopy(dashboardSlug);
  const screen = usePublishedCopy(slug === dashboardSlug ? undefined : slug);
  return (
    <NavigationCopy.Provider value={navigation}>
      <ScreenCopy.Provider value={slug === dashboardSlug ? navigation : screen}>{children}</ScreenCopy.Provider>
    </NavigationCopy.Provider>
  );
}

export const useDashboardCopy = () => useContext(ScreenCopy);
export const useNavigationCopy = () => useContext(NavigationCopy);

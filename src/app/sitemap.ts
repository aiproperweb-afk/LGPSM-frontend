import type { MetadataRoute } from "next";
import { CLIENT_CATEGORIES } from "@/constants/clients";
import { PUBLIC_ROUTES, SITE_URL } from "@/constants/site";

// Canonical, indexable public pages only. Private dashboard, token-based and recovery routes are excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: string[] = [...PUBLIC_ROUTES, "/features", "/how-it-works", ...CLIENT_CATEGORIES.map((c) => `/clients/${c.slug}`)];
  return routes.map((route) => ({
    url: route === "/" ? SITE_URL : `${SITE_URL}${route}`,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/signin" || route === "/signup" ? 0.5 : 0.7,
  }));
}

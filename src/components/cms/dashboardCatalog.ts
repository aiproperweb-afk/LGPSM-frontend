import rows from "./dashboardPages.json";
import { NAV_ENTRIES } from "../sidebar/navConfig";

export const dashboardSlug = "workspace-dashboard";
export const navigationKey = (key: string) => "navigation_" + key.replaceAll("-", "_");

const navigation = Object.fromEntries(
  NAV_ENTRIES.flatMap(entry => [entry, ...(entry.children ?? [])])
    .map(({ key, label }) => [navigationKey(key), label])
);
navigation.navigation_add_event_shortcut = "Add Event";

export const dashboardCatalog = rows.map(({ slug, name, route, labels }) => ({
  slug: slug as `workspace-${string}`, name, route,
  labels: { ...Object.fromEntries(Object.entries(labels).filter((entry): entry is [string, string] => typeof entry[1] === "string")), ...(slug === dashboardSlug ? navigation : {}) },
}));

const patterns = dashboardCatalog.filter(page => page.route.includes("[id]")).map(page => ({
  page, pattern: new RegExp("^" + page.route.replace("[id]", "[^/]+") + "$"),
}));

export function dashboardPageAt(pathname: string) {
  return dashboardCatalog.find(page => page.route === pathname)
    ?? patterns.find(({ pattern }) => pattern.test(pathname))?.page;
}

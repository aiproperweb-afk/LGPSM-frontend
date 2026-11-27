import { homeContent, type HomeContent } from "./homeContent";
import { dashboardCatalog } from "./dashboardCatalog";
import { contactCopy } from "./contactContent";
import type { CmsPageData, CmsSlug } from "./types";

function section<K extends keyof HomeContent>(type: K) {
  return { type, props: { ...homeContent[type], id: type } };
}

export const initialHomeData: CmsPageData = {
  root: { props: {} },
  content: [
    section("HeroSection"),
    section("StatsClients"),
    section("PainPoints"),
    section("StepsCarousel"),
    section("FeatureRows"),
    section("EventDay"),
    section("ReportsSection"),
    section("UseCases"),
    section("PricingLanding"),
    section("SecuritySection"),
    section("FaqLanding"),
  ],
};

export const initialPageData: Record<CmsSlug, CmsPageData> = {
  home: initialHomeData,
  ...Object.fromEntries(dashboardCatalog.map(({ slug, labels }) => [slug, {
    root: { props: {} },
    content: [{ type: "DashboardCopy", props: { id: slug, labels } }],
  }])),
  contact: {
    root: { props: {} },
    content: [{ type: "ContactContent", props: { ...contactCopy, id: "ContactContent" } }],
  },
};

export const cmsPageDescriptors = [
  { name: "Homepage", slug: "home", route: "/" },
  { name: "Contact", slug: "contact", route: "/contact" },
  ...dashboardCatalog.map(({ name, slug, route }) => ({ name, slug, route })),
];

export function isCmsSlug(value: string): value is CmsSlug {
  return Object.hasOwn(initialPageData, value);
}

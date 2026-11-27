import { homeContent, type HomeContent } from "./homeContent";
import { footerLabels, navbarLabels } from "./siteChromeContent";
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
  navbar: { root: { props: {} }, content: [{ type: "SiteChromeCopy", props: { id: "navbar", labels: navbarLabels } }] },
  footer: { root: { props: {} }, content: [{ type: "SiteChromeCopy", props: { id: "footer", labels: footerLabels } }] },
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
  { name: "Navbar", slug: "navbar", route: "/#navbar" },
  { name: "Footer", slug: "footer", route: "/#footer" },
  ...dashboardCatalog.map(({ name, slug, route }) => ({ name, slug, route })),
];

export function isCmsSlug(value: string): value is CmsSlug {
  return Object.hasOwn(initialPageData, value);
}

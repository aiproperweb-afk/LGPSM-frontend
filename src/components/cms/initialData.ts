import { homeContent, type HomeContent } from "./homeContent";
import { contactCopy } from "./contactContent";
import { clientPages, featuresCopy, howItWorksCopy, testimonialsCopy } from "./marketingContent";
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
    { type: "Testimonials", props: { ...testimonialsCopy, id: "Testimonials" } },
    section("FaqLanding"),
  ],
};

export const initialPageData: Record<CmsSlug, CmsPageData> = {
  home: initialHomeData,
  features: { root: { props: {} }, content: [{ type: "FeaturesContent", props: { ...featuresCopy, id: "FeaturesContent" } }] },
  "how-it-works": { root: { props: {} }, content: [{ type: "HowItWorksContent", props: { ...howItWorksCopy, id: "HowItWorksContent" } }] },
  ...Object.fromEntries(clientPages.map(({ slug, data }) => [slug, {
    root: { props: {} },
    content: [{ type: "ClientContent", props: { ...data, id: slug } }],
  }])),
  contact: {
    root: { props: {} },
    content: [{ type: "ContactContent", props: { ...contactCopy, id: "ContactContent" } }],
  },
};

export const cmsPageDescriptors = [
  { name: "Homepage", slug: "home", route: "/" },
  { name: "Contact", slug: "contact", route: "/contact" },
  { name: "Features", slug: "features", route: "/features" },
  { name: "How it works", slug: "how-it-works", route: "/how-it-works" },
  ...clientPages.map(({ name, slug, route }) => ({ name, slug, route })),
];

export function isCmsSlug(value: string): value is CmsSlug {
  return Object.hasOwn(initialPageData, value);
}

import { homeContent, type HomeContent } from "./homeContent";
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
  contact: {
    root: { props: {} },
    content: [{ type: "ContactContent", props: { ...contactCopy, id: "ContactContent" } }],
  },
};

export function isCmsSlug(value: string): value is CmsSlug {
  return Object.hasOwn(initialPageData, value);
}

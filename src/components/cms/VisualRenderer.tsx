"use client";

import { Render, type Config, type SlotComponent } from "@puckeditor/core";
import type { ReactNode, Ref } from "react";
import HeroSection from "@/components/HeroSection";
import FeaturesPage from "@/components/features/FeaturesPage";
import HowItWorksPage from "@/components/how-it-works/HowItWorksPage";
import ClientPage from "@/components/clients/ClientPage";
import { getClientCategory } from "@/constants/clients";
import { resolveImageUrl } from "@/utils/mediaUrl";
import { BASE_CSS } from "./contact/baseCss";
import { contactPublicConfig } from "./contact/publicConfig";
import { toPublicData, type BuilderData } from "./contact/schema";
import { buildCss } from "./contact/styleCss";
import { SiteElementScope, type ElementOverride } from "./SiteElement";
import { initialPageData } from "./initialData";
import { publicConfig } from "./publicConfig";
import type { ClientSharedContent } from "./PreviewRenderer";
import type { VisualSlug } from "./visualData";

type ExistingRenderer = (labels: Record<string, string>, branding?: ReactNode) => ReactNode;

export function visualPublicConfig(slug: VisualSlug, options: {
  category?: string; clientShared?: ClientSharedContent; renderChrome?: ExistingRenderer;
} = {}): Config {
  return {
    components: {
      ...contactPublicConfig.components,
      ExistingSection: {
        fields: contactPublicConfig.components.ExistingSection.fields,
        render: ({ id, source, copy, hero: Hero, visualHero, elements, puck }) => {
          const original = initialPageData[slug].content.find(item => item.props.id === source);
          if (!original || !copy) return <></>;
          const category = original.type === "ClientContent" ? getClientCategory(String(source).replace(/^clients-/, "")) : undefined;
          if (options.category && category?.slug !== options.category) return <></>;
          const HeroSlot = Hero as SlotComponent | undefined;
          const hero = visualHero && HeroSlot ? <HeroSlot as="div" className={original.type === "SiteChromeCopy" ? "flex shrink-0 flex-col items-start gap-4" : `relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-12 ${original.type === "HeroSection" ? "pt-10" : ""}`} minEmptyHeight={80} /> : undefined;
          const content = original.type === "SiteChromeCopy"
            ? options.renderChrome?.(copy.labels, hero)
            : original.type === "ClientContent" && category
              ? <ClientPage category={category} copy={copy} visualHero={hero} {...options.clientShared} />
              : original.type === "FeaturesContent" && hero ? <FeaturesPage copy={copy} visualHero={hero} />
              : original.type === "HowItWorksContent" && hero ? <HowItWorksPage copy={copy} visualHero={hero} />
              : original.type === "HeroSection" && hero ? <HeroSection {...copy} visualHero={hero} />
              : <Render config={publicConfig} data={{ root: { props: {} }, content: [{ ...original, props: copy }] }} />;
          return <div data-cb={id} data-cb-type="ExistingSection" ref={puck.dragRef as Ref<HTMLDivElement>}><SiteElementScope owner={id} edits={elements as ElementOverride[] | undefined} editing={puck.isEditing}>{content}</SiteElementScope></div>;
        },
      },
    },
  };
}

export default function VisualRenderer({ data, slug, category, clientShared, renderChrome }: {
  data: BuilderData; slug: VisualSlug; category?: string; clientShared?: ClientSharedContent; renderChrome?: ExistingRenderer;
}) {
  const visible = toPublicData(data);
  return <div className="cb-root cb-page">
    <style>{BASE_CSS + buildCss(visible, resolveImageUrl)}</style>
    <Render config={visualPublicConfig(slug, { category, clientShared, renderChrome })} data={visible} />
  </div>;
}

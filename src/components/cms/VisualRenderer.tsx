"use client";

import { Render, type Config } from "@puckeditor/core";
import type { ReactNode, Ref } from "react";
import ClientPage from "@/components/clients/ClientPage";
import { getClientCategory } from "@/constants/clients";
import { resolveImageUrl } from "@/utils/mediaUrl";
import { BASE_CSS } from "./contact/baseCss";
import { contactPublicConfig } from "./contact/publicConfig";
import { toPublicData, type BuilderData } from "./contact/schema";
import { buildCss } from "./contact/styleCss";
import { initialPageData } from "./initialData";
import { publicConfig } from "./publicConfig";
import type { ClientSharedContent } from "./PreviewRenderer";
import type { VisualSlug } from "./visualData";

type ExistingRenderer = (labels: Record<string, string>) => ReactNode;

export function visualPublicConfig(slug: VisualSlug, options: {
  category?: string; clientShared?: ClientSharedContent; renderChrome?: ExistingRenderer;
} = {}): Config {
  return {
    components: {
      ...contactPublicConfig.components,
      ExistingSection: {
        render: ({ id, source, copy, puck }) => {
          const original = initialPageData[slug].content.find(item => item.props.id === source);
          if (!original || !copy) return <></>;
          const category = original.type === "ClientContent" ? getClientCategory(String(source).replace(/^clients-/, "")) : undefined;
          if (options.category && category?.slug !== options.category) return <></>;
          const content = original.type === "SiteChromeCopy"
            ? options.renderChrome?.(copy.labels)
            : original.type === "ClientContent" && category
              ? <ClientPage category={category} copy={copy} {...options.clientShared} />
              : <Render config={publicConfig} data={{ root: { props: {} }, content: [{ ...original, props: copy }] }} />;
          return <div data-cb={id} data-cb-type="ExistingSection" ref={puck.dragRef as Ref<HTMLDivElement>}>{content}</div>;
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

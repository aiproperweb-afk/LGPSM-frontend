import type { Config, Fields } from "@puckeditor/core";
import Navbar from "@/app/navbar/Navbar";
import Footer from "@/components/Footer";
import { cmsConfig } from "../../config";
import { initialPageData } from "../../initialData";
import { visualPublicConfig } from "../../VisualRenderer";
import type { VisualSlug } from "../../visualData";
import { contactEditorConfig } from "./config";

export function createVisualEditorConfig(slug: VisualSlug): Config {
  const visual = visualPublicConfig(slug, {
    renderChrome: labels => slug === "navbar" ? <Navbar visualLabels={labels} /> : <Footer visualLabels={labels} />,
  });
  const components = { ...contactEditorConfig.components };
  delete components.ContactForm;
  return {
    ...contactEditorConfig,
    categories: Object.fromEntries(Object.entries(contactEditorConfig.categories ?? {}).map(([key, category]) => [
      key, { ...category, components: category.components?.filter(type => !["ContactForm", "ExistingSection"].includes(type)) },
    ])),
    components: {
      ...components,
      ExistingSection: {
        ...components.ExistingSection,
        ...visual.components.ExistingSection,
        resolveFields: ({ props }, { fields }) => {
          const legacy = initialPageData[slug].content.find(item => item.props.id === props.source);
          const editable = { ...fields };
          delete editable.source;
          if (!legacy) return editable;
          return {
            ...editable,
            copy: { type: "object", label: "Section content", objectFields: (cmsConfig.components[legacy.type].fields ?? {}) as Fields },
          };
        },
      },
    },
  };
}

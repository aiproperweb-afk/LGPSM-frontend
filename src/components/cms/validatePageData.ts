import { approvedLink, resolveCmsImage } from "./approvedContent";
import { initialHomeData, initialPageData } from "./initialData";
import type { CmsPageData, CmsSlug } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function matchesFields(value: unknown, seed: unknown, field = "", allowEmptyImage = false): boolean {
  if (typeof seed === "string") {
    if (typeof value !== "string" || value.length > 4000
      || /<\s*(?:\/?\s*[a-z][^>]*>|[!?])|javascript\s*:|vbscript\s*:|data\s*:/i.test(value)) return false;
    if (field.endsWith("Href")) return approvedLink(value, "") !== "";
    if (field === "image" || field.endsWith("Image")) return ((allowEmptyImage || seed === "") && value === "") || resolveCmsImage(value) !== null;
    return true;
  }

  if (Array.isArray(seed)) {
    if (!Array.isArray(value)) return false;
    if (field === "bullets") {
      return value.length <= 20 && value.every((item) => matchesFields(item, ""));
    }
    return value.length === seed.length && seed.every((entry, index) =>
      matchesFields(value[index], entry, "", field === "steps")
    );
  }

  if (!isObject(seed) || !isObject(value)) return false;
  return Object.keys(value).length === Object.keys(seed).length
    && Object.entries(seed).every(([key, entry]) =>
      matchesFields(value[key], entry, key, allowEmptyImage)
    );
}

export function upgradePageData(value: unknown, slug: CmsSlug): unknown {
  if (slug !== "home" || !isObject(value) || !Array.isArray(value.content)) return value;
  const sectionIndex = initialHomeData.content.findIndex(section => section.type === "Testimonials");
  if (value.content.length !== initialHomeData.content.length - 1 || value.content[sectionIndex]?.type !== "FaqLanding") return value;
  return { ...value, content: [...value.content.slice(0, sectionIndex), initialHomeData.content[sectionIndex], ...value.content.slice(sectionIndex)] };
}

export function validatePageData(value: unknown, slug: CmsSlug): value is CmsPageData {
  if (!isObject(value) || !Array.isArray(value.content)
    || Object.keys(value).some(key => !["root", "content", "zones"].includes(key))) return false;
  const { content, root, zones } = value;
  if (!isObject(root) || Object.keys(root).some((key) => key !== "props")
    || (!isObject(root.props) || Object.keys(root.props).length > 0)) return false;
  if (zones !== undefined && (!isObject(zones) || Object.keys(zones).length > 0)) return false;
  const seed = initialPageData[slug];
  return content.length === seed.content.length
    && seed.content.every((section, index) => {
      const item: unknown = content[index];
      return isObject(item) && Object.keys(item).length === 2 && item.type === section.type && isObject(item.props)
        && item.props.id === section.props.id && matchesFields(item.props, section.props);
    });
}

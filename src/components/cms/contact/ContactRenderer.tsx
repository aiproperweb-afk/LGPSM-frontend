import { Render } from "@puckeditor/core/rsc";
import { resolveImageUrl } from "@/utils/mediaUrl";
import { BASE_CSS } from "./baseCss.ts";
import { contactPublicConfig } from "./publicConfig";
import { toPublicData, type BuilderData } from "./schema.ts";
import { buildCss } from "./styleCss.ts";

/** The published Contact page: no editor, no drag and drop, hidden components removed. */
export default function ContactRenderer({ data }: { data: BuilderData }) {
  const visible = toPublicData(data);
  // The stylesheet is generated from validated values only (styleCss.ts), so it is safe to inline.
  const css = BASE_CSS + buildCss(visible, reference => resolveImageUrl(reference));
  return (
    <div className="cb-root cb-page">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Render config={contactPublicConfig} data={visible} />
    </div>
  );
}

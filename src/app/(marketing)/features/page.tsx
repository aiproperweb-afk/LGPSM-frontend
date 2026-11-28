import PublicPageRenderer from "@/components/cms/PublicPageRenderer";
import VisualRenderer from "@/components/cms/VisualRenderer";
import { getPublishedDocument } from "@/components/cms/publishedPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const page = await getPublishedDocument("features");
  return page.visual ? <VisualRenderer data={page.visual} slug="features" /> : <PublicPageRenderer slug="features" data={page.classic} />;
}

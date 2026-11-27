import PublicPageRenderer from "@/components/cms/PublicPageRenderer";
import { getPublishedPage } from "@/components/cms/publishedPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  return <PublicPageRenderer slug="features" data={await getPublishedPage("features")} />;
}

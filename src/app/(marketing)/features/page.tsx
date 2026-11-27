import PublicPageRenderer from "@/components/cms/PublicPageRenderer";
import { getPublishedPage } from "@/components/cms/publishedPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  return <PublicPageRenderer data={await getPublishedPage("features")} />;
}

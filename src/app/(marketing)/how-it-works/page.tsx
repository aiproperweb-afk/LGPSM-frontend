import type { Metadata } from "next";
import PublicPageRenderer from "@/components/cms/PublicPageRenderer";
import VisualRenderer from "@/components/cms/VisualRenderer";
import { getPublishedDocument } from "@/components/cms/publishedPage";
import { publicPageMetadata } from "@/utils/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = publicPageMetadata({
  title: "How it works",
  description: "How to create an event, send QR invitations and manage guest entry with EventQRapp, step by step from sign-up to attendance reports.",
  path: "/how-it-works",
});

export default async function Page() {
  const page = await getPublishedDocument("how-it-works");
  return page.visual ? <VisualRenderer data={page.visual} slug="how-it-works" /> : <PublicPageRenderer slug="how-it-works" data={page.classic} />;
}

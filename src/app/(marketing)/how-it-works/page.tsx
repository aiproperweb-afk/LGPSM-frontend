import type { Metadata } from "next";
import PublicPageRenderer from "@/components/cms/PublicPageRenderer";
import { getPublishedPage } from "@/components/cms/publishedPage";
import { publicPageMetadata } from "@/utils/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = publicPageMetadata({
  title: "How it works",
  description: "How to create an event, send QR invitations and manage guest entry with EventQRapp, step by step from sign-up to attendance reports.",
  path: "/how-it-works",
});

export default async function Page() {
  return <PublicPageRenderer data={await getPublishedPage("how-it-works")} />;
}

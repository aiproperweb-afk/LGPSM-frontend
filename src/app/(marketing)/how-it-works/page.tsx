import type { Metadata } from "next";
import HowItWorksPage from "@/components/how-it-works/HowItWorksPage";
import { publicPageMetadata } from "@/utils/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "How it works",
  description: "How to create an event, send QR invitations and manage guest entry with EventQRapp, step by step from sign-up to attendance reports.",
  path: "/how-it-works",
});

export default function Page() {
  return <HowItWorksPage />;
}

import type { Metadata } from "next";
import Navbar from "@/app/navbar/Navbar";
import PublicPageRenderer from "@/components/cms/PublicPageRenderer";
import { getPublishedPage } from "@/components/cms/publishedPage";
import LandingIntro from "@/components/landing/LandingIntro";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/constants/site";
import { publicPageMetadata } from "@/utils/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = publicPageMetadata({
  title: "EventQRapp · QR Invitations, RSVP & Event Entry",
  description: `EventQRapp - ${SITE_DESCRIPTION}`,
  path: "/",
  absolute: true,
});

// Only facts already shown on the site: no ratings, prices, addresses or contact details are invented.
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-512x512.png`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
];

export default async function Home() {
  const content = await getPublishedPage("home");
  return (
    <>
      {/* (the script that decides whether the opening animation plays is in the root layout's head) */}
      <noscript><style>{".reveal{opacity:1!important;transform:none!important}"}</style></noscript>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <SmoothScroll>
      <LandingIntro />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1">
          <PublicPageRenderer data={content} />
        </main>
        <Footer />
      </div>
      </SmoothScroll>
    </>
  );
}


import Navbar from "@/app/navbar/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import PublicPageRenderer from "@/components/cms/PublicPageRenderer";
import { getPublishedPage } from "@/components/cms/publishedPage";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const content = await getPublishedPage("contact");
  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 bg-white py-12 sm:py-16 lg:py-20">
          <PublicPageRenderer data={content} />
        </main>

        <Footer inner cta={{ title: "Prefer to try it yourself first?", body: "Set up your event, upload your guests and send QR invitations in minutes. You only pay for the guests you invite.", primary: "Create your first event", note: "No credit card needed to start · No subscription" }} />
      </div>
    </SmoothScroll>
  );
}

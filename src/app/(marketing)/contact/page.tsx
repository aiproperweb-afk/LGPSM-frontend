import Navbar from "@/app/navbar/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import PublicPageRenderer from "@/components/cms/PublicPageRenderer";
import ContactRenderer from "@/components/cms/contact/ContactRenderer";
import { getPublishedContact } from "@/components/cms/contact/publishedContact";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const page = await getPublishedContact();
  // A builder page sets its own vertical spacing (Page > Spacing in the editor).
  const spacing = page.kind === "builder" ? "" : " py-12 sm:py-16 lg:py-20";
  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className={"flex-1 bg-white" + spacing}>
          {page.kind === "builder" ? <ContactRenderer data={page.data} /> : <PublicPageRenderer data={page.data} slug="contact" />}
        </main>

        <Footer inner ctaVariant="contact" />
      </div>
    </SmoothScroll>
  );
}

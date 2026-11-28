import Navbar from "@/app/navbar/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import PublicPageRenderer from "@/components/cms/PublicPageRenderer";
import ContactRenderer from "@/components/cms/contact/ContactRenderer";
import { getPublishedContact } from "@/components/cms/contact/publishedContact";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const page = await getPublishedContact();
  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className={page.kind === "classic" ? "flex-1 bg-white py-12 sm:py-16 lg:py-20" : "flex-1 bg-white"}>
          {page.kind === "classic" ? <PublicPageRenderer data={page.data} slug="contact" /> : <ContactRenderer data={page.data} />}
        </main>

        <Footer inner ctaVariant="contact" />
      </div>
    </SmoothScroll>
  );
}

import { notFound } from "next/navigation";
import { isEditableCmsSlug } from "@/components/cms/initialData";
import PageEditor from "@/components/cms/PageEditor";
import ContactEditor from "@/components/cms/contact/editor/ContactEditor";

export default async function EditPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  if (!isEditableCmsSlug(pageId)) notFound();
  if (pageId === "contact") return <ContactEditor />;
  return <PageEditor slug={pageId} />;
}

import { notFound } from "next/navigation";
import { isEditableCmsSlug } from "@/components/cms/initialData";
import ContactEditor from "@/components/cms/contact/editor/ContactEditor";
import PageEditor from "@/components/cms/PageEditor";

export default async function EditPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  if (!isEditableCmsSlug(pageId)) notFound();
  if (pageId === "contact") return <ContactEditor />;
  return <PageEditor slug={pageId} />;
}

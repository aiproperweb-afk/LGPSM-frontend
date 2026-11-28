import { notFound } from "next/navigation";
import { isEditableCmsSlug } from "@/components/cms/initialData";
import ContactEditor from "@/components/cms/contact/editor/ContactEditor";
import type { VisualSlug } from "@/components/cms/visualData";

export default async function EditPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  if (!isEditableCmsSlug(pageId)) notFound();
  return <ContactEditor key={pageId} slug={pageId as VisualSlug | "contact"} />;
}

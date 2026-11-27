import { notFound } from "next/navigation";
import { isEditableCmsSlug } from "@/components/cms/initialData";
import PageEditor from "@/components/cms/PageEditor";

export default async function EditPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  if (!isEditableCmsSlug(pageId)) notFound();
  return <PageEditor slug={pageId} />;
}

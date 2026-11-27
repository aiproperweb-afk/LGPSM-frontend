import { notFound } from "next/navigation";
import { isCmsSlug } from "@/components/cms/initialData";
import PageEditor from "@/components/cms/PageEditor";

export default async function EditPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  if (!isCmsSlug(pageId)) notFound();
  return <PageEditor slug={pageId} />;
}

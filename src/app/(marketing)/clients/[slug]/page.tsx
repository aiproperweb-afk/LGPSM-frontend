import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientPage from "@/components/clients/ClientPage";
import { CLIENT_CATEGORIES, getClientCategory } from "@/constants/clients";
import { publicPageMetadata } from "@/utils/seo";

export function generateStaticParams() {
  return CLIENT_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getClientCategory((await params).slug);
  if (!c) return {};
  return publicPageMetadata({ title: `${c.name} events`, description: c.sub, path: `/clients/${c.slug}` });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const c = getClientCategory((await params).slug);
  if (!c) notFound();
  return <ClientPage c={c} />;
}

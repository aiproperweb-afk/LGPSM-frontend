import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PreviewDraftContent from "@/components/cms/PreviewDraftContent";
import ClientPage from "@/components/clients/ClientPage";
import VisualRenderer from "@/components/cms/VisualRenderer";
import { getPublishedDocument, getPublishedPage } from "@/components/cms/publishedPage";
import { clientCopy } from "@/components/cms/marketingContent";
import { getClientCategory } from "@/constants/clients";
import { publicPageMetadata } from "@/utils/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getClientCategory((await params).slug);
  if (!c) return {};
  return publicPageMetadata({ title: `${c.name} events`, description: c.sub, path: `/clients/${c.slug}` });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const c = getClientCategory((await params).slug);
  if (!c) notFound();
  const slug = `clients-${c.slug}` as const;
  const [data, home] = await Promise.all([getPublishedDocument("clients"), getPublishedPage("home")]);
  const section = data.classic.content.filter(item => item.type === "ClientContent").find(item => item.props.id === slug);
  const testimonials = home.content.find(item => item.type === "Testimonials");
  const faq = home.content.find(item => item.type === "FaqLanding");
  const stats = home.content.find(item => item.type === "StatsClients");
  const shared = { testimonials: testimonials?.props, faq: faq?.props, stats: stats?.props.stats };
  if (data.visual) return <VisualRenderer data={data.visual} slug="clients" category={c.slug} clientShared={shared} />;
  return <PreviewDraftContent slug={slug} clientShared={shared}>
    <ClientPage category={c} copy={section?.props ?? clientCopy(c)} {...shared} />
  </PreviewDraftContent>;
}

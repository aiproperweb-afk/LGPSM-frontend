import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientPage from "@/components/clients/ClientPage";
import { getPublishedPage } from "@/components/cms/publishedPage";
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
  const [data, home] = await Promise.all([getPublishedPage(`clients-${c.slug}`), getPublishedPage("home")]);
  const section = data.content.find(item => item.type === "ClientContent");
  const testimonials = home.content.find(item => item.type === "Testimonials");
  const faq = home.content.find(item => item.type === "FaqLanding");
  const stats = home.content.find(item => item.type === "StatsClients");
  return <ClientPage category={c} copy={section?.props ?? clientCopy(c)} testimonials={testimonials?.props} faq={faq?.props} stats={stats?.props.stats} />;
}

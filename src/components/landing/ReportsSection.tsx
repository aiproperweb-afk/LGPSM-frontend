import { SiteElement } from "@/components/cms/SiteElement";
import { homeContent, type HomeContent } from "@/components/cms/homeContent";
import { approvedLink, resolveCmsImage } from "@/components/cms/approvedContent";
import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { Container, Headline } from "./ui";

// Figma node 66:6261 — reports
const BULLETS = [
  "Totals at a glance: invitees, attendees, sessions and staff",
  "Invited vs. attended chart for each session",
  "Invitation delivery split: sent, received, failed",
  "Per-guest log: invitation status, RSVP, check-in status and last check-in time",
  "Session and access logs, downloadable as a list",
  "Billing history with invoices and downloadable statements by date range",
];

export default function ReportsSection({ heading, description, details, buttonLabel, buttonHref, image, imageAlt }: HomeContent["ReportsSection"]) {
  return (
    <SiteElement site="ReportsSection-1"><section className="bg-white py-14 sm:py-20">
      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal variant="left" className="flex flex-col gap-5">
          <Headline className="text-[#000B2C]">{heading}</Headline>
          <SiteElement site="ReportsSection-2"><p className="text-[16px] leading-[1.5] text-[#000B2C] sm:text-[17px]">{description}</p></SiteElement>
          <SiteElement site="ReportsSection-3"><p className="text-[16px] leading-[1.5] text-[#4A5470] sm:text-[17px]">{details}</p></SiteElement>
          <SiteElement site="ReportsSection-4"><ul className="flex flex-col gap-3">
            {BULLETS.map((b) => (
              <SiteElement site="ReportsSection-5" key={b} item={b}><li  className="flex items-start gap-3 text-[16px] leading-[1.45] text-[#4A5470]">
                <SiteElement site="ReportsSection-6"><Image src="/images/landing/report-tick.svg" alt="" width={24} height={24} className="shrink-0" /></SiteElement>
                <SiteElement site="ReportsSection-7"><span>{b}</span></SiteElement>
              </li></SiteElement>
            ))}
          </ul></SiteElement>
          <SiteElement site="ReportsSection-8"><div>
            <SiteElement site="ReportsSection-9"><Link href={approvedLink(buttonHref, homeContent.ReportsSection.buttonHref)} className="inline-flex h-11 items-center rounded-xl border border-[#000B2C] bg-white px-6 text-[15px] font-semibold text-[#000B2C] hover:bg-[#EAF1FF] transition-colors">{buttonLabel}</Link></SiteElement>
          </div></SiteElement>
        </Reveal>
        <Reveal variant="right" delay={120} className="overflow-hidden rounded-[20px]">
          <SiteElement site="ReportsSection-10"><Image src={resolveCmsImage(image) ?? homeContent.ReportsSection.image} alt={imageAlt} unoptimized={image !== homeContent.ReportsSection.image} width={560} height={654} sizes="(max-width:1024px) 92vw, 560px" className="h-auto w-full" /></SiteElement>
        </Reveal>
      </Container>
    </section></SiteElement>
  );
}

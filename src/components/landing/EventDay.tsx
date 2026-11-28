import { SiteElement } from "@/components/cms/SiteElement";
import { homeContent, type HomeContent } from "@/components/cms/homeContent";
import { approvedLink, resolveCmsImage } from "@/components/cms/approvedContent";
import Image from "next/image";
import Link from "next/link";
import { BLUE_GRADIENT } from "./BlueButton";
import Reveal from "./Reveal";
import { Container, Headline } from "./ui";

// Figma node 66:6047 — what the organiser sees on the day
const POINTS = [
  { title: "Live session health", body: "Currently logged-in guests, check-ins today and occupancy for each session, shown as simple rings.", icon: "/images/landing/day-1.svg" },
  { title: "Entry and exit logs", body: "Guest name, ID, entry time, exit time, gate (Main or VIP) and whether they are inside or have left.", icon: "/images/landing/day-2.svg" },
  { title: "Activity trail", body: "Every action your team takes, such as sending invites or changing access rules, is logged with who did it and when.", icon: "/images/landing/day-3.svg" },
];

export default function EventDay({ heading, description, details, buttonLabel, buttonHref, image, imageAlt }: HomeContent["EventDay"]) {
  return (
    <SiteElement site="EventDay-1"><section className="bg-white py-14 sm:py-20">
      <Container className="flex flex-col gap-12">
        <Reveal className="mx-auto flex max-w-[760px] flex-col items-center gap-4 text-center">
          <SiteElement site="EventDay-2"><span className="inline-flex items-center gap-1.5 rounded-full border border-[#E1E7F2] bg-white px-3 py-1 text-[13px] font-medium text-[#15803D]">
            <SiteElement site="EventDay-3"><span className="size-1.5 rounded-full bg-[#15803D]" /></SiteElement>On event day
          </span></SiteElement>
          <Headline className="text-[#000B2C]">{heading}</Headline>
          <SiteElement site="EventDay-4"><p className="text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{description}</p></SiteElement>
        </Reveal>
        <SiteElement site="EventDay-5"><div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[560px_1fr] lg:gap-12">
          <Reveal variant="left" className="overflow-hidden rounded-[20px]">
            <SiteElement site="EventDay-6"><Image src={resolveCmsImage(image) ?? homeContent.EventDay.image} alt={imageAlt} unoptimized={image !== homeContent.EventDay.image} width={560} height={593} sizes="(max-width:1024px) 92vw, 560px" className="h-auto w-full" /></SiteElement>
          </Reveal>
          <Reveal variant="right" delay={120} className="flex flex-col gap-0">
            <SiteElement site="EventDay-7"><p className="pb-5 text-[16px] leading-[1.55] text-[#4A5470] sm:text-[17px]">{details}</p></SiteElement>
            {POINTS.map((p) => (
              <SiteElement site="EventDay-8" key={p.title} item={p.title}><div  className="flex gap-3 border-t border-[#E1E7F2] py-4">
                <SiteElement site="EventDay-9"><Image src={p.icon} alt="" width={24} height={24} className="size-6 shrink-0" /></SiteElement>
                <SiteElement site="EventDay-10"><div>
                  <SiteElement site="EventDay-11"><h3 className="text-[17px] font-semibold text-[#000B2C]">{p.title}</h3></SiteElement>
                  <SiteElement site="EventDay-12"><p className="text-[16px] leading-[1.4] text-[#4A5470] sm:text-[17px]">{p.body}</p></SiteElement>
                </div></SiteElement>
              </div></SiteElement>
            ))}
            <SiteElement site="EventDay-13"><div className="border-t border-[#E1E7F2] pt-6">
              <SiteElement site="EventDay-14"><Link href={approvedLink(buttonHref, homeContent.EventDay.buttonHref)} style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-11 items-center rounded-xl px-6 text-[15px] font-semibold text-white hover:brightness-95 transition">{buttonLabel}</Link></SiteElement>
            </div></SiteElement>
          </Reveal>
        </div></SiteElement>
      </Container>
    </section></SiteElement>
  );
}

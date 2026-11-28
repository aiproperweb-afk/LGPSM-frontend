import { SiteElement } from "@/components/cms/SiteElement";
import Image from "next/image";
import { type HomeContent } from "@/components/cms/homeContent";
import { Container, Headline } from "./ui";
import Reveal from "./Reveal";

// Figma node 66:6997 (the icons are the design's own files)
const POINTS = [
  { title: "Unique QR per guest", body: "Each invitation carries its own code, so forwarded or copied cards can't let extra people in.", icon: "/images/landing/sec-1.svg" },
  { title: "Rules that hold at the door", body: "Guest limits on every pass and RSVP rules are applied at every scan.", icon: "/images/landing/sec-2.svg" },
  { title: "A safety lock before sending", body: "You get a clear warning before invites go out, and the event locks afterwards so nothing changes under your guests.", icon: "/images/landing/sec-3.svg" },
  { title: "Full audit trail", body: "Every invite sent and every access rule changed is logged with the person and time.", icon: "/images/landing/sec-4.svg" },
];

export default function SecuritySection({ heading, description }: HomeContent["SecuritySection"]) {
  return (
    <SiteElement site="SecuritySection-1"><section className="border-t border-[#E6EBF5] bg-white py-14 sm:py-20">
      <Container className="flex flex-col items-center gap-10 sm:gap-14">
        <Reveal className="flex w-full flex-col items-center gap-4 text-center">
          <Headline className="max-w-[900px] text-[#000B2C]">{heading}</Headline>
          <SiteElement site="SecuritySection-2"><p className="max-w-[640px] text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{description}</p></SiteElement>
        </Reveal>
        <SiteElement site="SecuritySection-3"><div className="grid w-full grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((p, i) => (
            <SiteElement site="SecuritySection-4" key={p.title} item={p.title} selectable={false}><Reveal  variant="up" delay={i * 90} className={`flex flex-col gap-3 ${i < 3 ? "lg:border-r lg:border-[rgba(60,60,67,0.18)] lg:pr-5" : ""}`}>
              <SiteElement site="SecuritySection-5"><Image src={p.icon} alt="" width={30} height={30} /></SiteElement>
              <SiteElement site="SecuritySection-6"><h3 className="text-[17px] font-semibold text-[#000B2C]">{p.title}</h3></SiteElement>
              <SiteElement site="SecuritySection-7"><p className="text-[16px] leading-[1.3] text-[#4A5470] sm:text-[17px]">{p.body}</p></SiteElement>
            </Reveal></SiteElement>
          ))}
        </div></SiteElement>
      </Container>
    </section></SiteElement>
  );
}

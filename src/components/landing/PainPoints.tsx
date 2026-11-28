import { SiteElement } from "@/components/cms/SiteElement";
import { type HomeContent } from "@/components/cms/homeContent";
import Image from "next/image";
import Reveal from "./Reveal";
import { Container, SectionHeading } from "./ui";

// Figma node 66:277 — the problem the product solves
const POINTS = [
  { icon: "/images/landing/pain-1.svg", title: "Invites go out blind.", body: "You send hundreds of messages and never know which ones arrived, which failed, or who will actually come." },
  { icon: "/images/landing/pain-2.svg", title: "The gate becomes a bottleneck.", body: "Staff check names against a printout, gate-crashers slip in, and guests wait in line." },
  { icon: "/images/landing/pain-3.svg", title: "Sessions blur together.", body: "The lunch, the after-party and the VIP dinner all need different guest lists, but nobody can enforce them." },
];

export default function PainPoints({ heading, description }: HomeContent["PainPoints"]) {
  return (
    <SiteElement site="PainPoints-1"><section className="bg-white py-14 sm:py-20">
      <Container className="flex flex-col gap-12">
        <Reveal><SectionHeading wide title={heading} subtitle={description} /></Reveal>
        <SiteElement site="PainPoints-2"><div className="grid grid-cols-1 border-y border-[#D3D3D3] md:grid-cols-3">
          {POINTS.map((p, i) => (
            <SiteElement site="PainPoints-3" key={p.title} item={p.title} selectable={false}><Reveal  variant="pop" delay={i * 110} className={`flex flex-col gap-3.5 py-9 ${i > 0 ? "border-t border-[#D3D3D3] md:border-l md:border-t-0 md:pl-8" : ""} ${i < 2 ? "md:pr-8" : ""}`}>
              <SiteElement site="PainPoints-4"><Image src={p.icon} alt="" width={32} height={32} /></SiteElement>
              <SiteElement site="PainPoints-5"><h3 className="text-[17px] font-semibold text-[#000B2C]">{p.title}</h3></SiteElement>
              <SiteElement site="PainPoints-6"><p className="text-[16px] leading-[1.4] text-[#4A5470] sm:text-[17px]">{p.body}</p></SiteElement>
            </Reveal></SiteElement>
          ))}
        </div></SiteElement>
        <Reveal as="p" className="mx-auto max-w-[820px] text-center text-[17px] font-semibold leading-[1.35] tracking-[-0.5px] text-[#000B2C]">
          EventQRapp replaces the spreadsheet, the printout and the guesswork with one system that runs from invitation to exit.
        </Reveal>
      </Container>
    </section></SiteElement>
  );
}

import { homeContent, type HomeContent } from "@/components/cms/homeContent";
import { resolveCmsImage } from "@/components/cms/approvedContent";
import Image from "next/image";
import Reveal from "./Reveal";
import { CheckList, Container, SectionHeading } from "./ui";

// Figma node 66:617 — six tools, alternating text and product panel

export default function FeatureRows({ heading, description, features }: HomeContent["FeatureRows"]) {
  return (
    <section id="features" className="scroll-mt-[69px] bg-white py-14 sm:py-20">
      <Container className="flex flex-col gap-16 lg:gap-24">
        <Reveal><SectionHeading title={heading} subtitle={description} /></Reveal>
        {features.map((f, i) => (
          <div key={i} className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <Reveal variant={i % 2 === 1 ? "right" : "left"} className={`flex flex-col gap-[18px] ${i % 2 === 1 ? "lg:order-2" : ""}`}>
              <div className="flex items-center gap-2">
                <Image src={`/images/landing/tag-${i + 1}.svg`} alt="" width={18} height={18} />
                <p className="text-[17px] font-semibold text-[#1F65FF]">{f.tag}</p>
              </div>
              <h3 className="text-[19px] font-bold leading-[1.15] tracking-[-0.5px] text-[#000B2C] sm:text-[20px]">{f.title}</h3>
              <p className="text-[16px] leading-[1.65] text-[#4A5470] sm:text-[17px]">{f.desc}</p>
              <CheckList items={[...f.bullets]} />
            </Reveal>
            <Reveal variant={i % 2 === 1 ? "left" : "right"} delay={120} className={`overflow-hidden rounded-[20px] ${i % 2 === 1 ? "lg:order-1" : ""}`}>
              <Image src={resolveCmsImage(f.image) ?? homeContent.FeatureRows.features[i].image} unoptimized={f.image !== homeContent.FeatureRows.features[i].image} alt={f.imageAlt} width={1140} height={910} sizes="(max-width:1024px) 92vw, 570px" className="h-auto w-full" />
            </Reveal>
          </div>
        ))}
      </Container>
    </section>
  );
}

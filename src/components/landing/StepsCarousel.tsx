"use client";

import { homeContent, type HomeContent } from "@/components/cms/homeContent";
import { approvedLink, resolveCmsImage } from "@/components/cms/approvedContent";
import Image from "next/image";
import { useRef, useState } from "react";
import { PrimaryLink } from "./BlueButton";
import { Container, Headline } from "./ui";
import Reveal from "./Reveal";

// Figma node 66:248 — five steps from a blank event to invitations sent

export default function StepsCarousel({ heading, description, buttonLabel, buttonHref, steps }: HomeContent["StepsCarousel"]) {
  const rail = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const go = (to: number) => {
    const i = Math.max(0, Math.min(steps.length - 1, to));
    setIndex(i);
    const card = rail.current?.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <section id="how-it-works" className="scroll-mt-[69px] relative overflow-hidden bg-[#000B2C] py-14 sm:py-20 text-white" style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 85% 10%, rgba(88,40,160,0.45), transparent 70%), radial-gradient(ellipse 70% 60% at 10% 100%, rgba(31,101,255,0.28), transparent 70%)" }}>
      <Container className="flex flex-col items-center gap-10">
        <div className="flex max-w-[760px] flex-col items-center gap-4 text-center">
          <Headline className="text-white">{heading}</Headline>
          <p className="text-[16px] text-[#C3CCE6] sm:text-[17px]">{description}</p>
        </div>

        <div ref={rail} className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-start" role="list" aria-label="The five steps">
          {steps.map((s, i) => {
            const image = resolveCmsImage(s.image);
            return (
              <Reveal as="article" role="listitem" key={i} variant="right" delay={i * 90} className="flex w-[84%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white p-[11px] text-left text-[#000B2C] sm:w-[46%] lg:w-[calc((100%-32px)/3)]">
                <div className="relative aspect-[325/200] w-full overflow-hidden rounded-lg bg-gradient-to-br from-[#EAF1FF] to-[#D6E4FF]">
                  {image ? (
                    <Image src={image} alt={s.imageAlt} unoptimized={s.image !== homeContent.StepsCarousel.steps[i]?.image} fill sizes="(max-width:1024px) 80vw, 360px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-dm-sans)] text-[72px] text-[#1F65FF]/70" aria-hidden>{i + 1}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2 px-2 pb-4 pt-4">
                  <h3 className="text-[17px] font-bold">{s.title}</h3>
                  <p className="text-[16px] leading-[1.45] text-[#4A5470] sm:text-[17px]">{s.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5" aria-hidden>
            {steps.map((_, i) => (
              <span key={i} className={`h-[7px] rounded-full transition-all ${i === index ? "w-6 bg-[#1F65FF]" : "w-[7px] bg-white/40"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous step" className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white transition disabled:opacity-40 enabled:hover:bg-white/30">‹</button>
            <button type="button" onClick={() => go(index + 1)} disabled={index === steps.length - 1} aria-label="Next step" className="flex size-10 items-center justify-center rounded-full bg-[#1F65FF] text-white transition disabled:opacity-40 enabled:hover:brightness-110">›</button>
          </div>
        </div>

        <PrimaryLink href={approvedLink(buttonHref, homeContent.StepsCarousel.buttonHref)} className="h-11 text-[15px]">{buttonLabel}</PrimaryLink>
      </Container>
    </section>
  );
}

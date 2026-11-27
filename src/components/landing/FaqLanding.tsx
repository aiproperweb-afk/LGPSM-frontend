"use client";

import { homeContent, type HomeContent } from "@/components/cms/homeContent";
import { approvedLink } from "@/components/cms/approvedContent";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container, Headline } from "./ui";
import Reveal from "./Reveal";

// Figma node 66:7062. The first answer is the design's own wording; the others are written from how the product works.

// Where on the screen a question counts as "reached" (a fraction of the window height from the top)
const FOCUS = 0.5;

export default function FaqLanding({
  heading = homeContent.FaqLanding.heading,
  buttonLabel = homeContent.FaqLanding.buttonLabel,
  buttonHref = homeContent.FaqLanding.buttonHref,
  questions = homeContent.FaqLanding.questions,
}: Partial<HomeContent["FaqLanding"]>) {
  const [open, setOpen] = useState(0);
  // large screens: the questions scroll past normally while the heading stays beside them, and the question at the middle of the screen
  // opens (the one that left it closes). Small screens, and people who ask for less motion, get the plain click-to-open list.
  const [follow, setFollow] = useState(false);
  const items = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setFollow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!follow) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * FOCUS;
      let active = 0;
      items.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        // the last question whose top has passed the line is the one being read (the first one before any has)
        if (r.top <= line) active = i;
      });
      setOpen(active);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [follow]);

  return (
    <section id="faq" className="scroll-mt-[69px] bg-white py-14 sm:py-20">
      <Container className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr] lg:gap-16">
        {/* the heading stays in view while the questions scroll past, and moves on with them to the footer */}
        <Reveal variant="left" className="flex flex-col gap-4 lg:sticky lg:top-[120px] lg:self-start">
          <Headline className="text-[#000B2C]">{heading}</Headline>
          <p className="text-[15px] leading-[1.6] text-[#4A5470]">Can&apos;t find what you need? <Link href={approvedLink(buttonHref, homeContent.FaqLanding.buttonHref)} className="font-semibold text-[#1F65FF] hover:underline">{buttonLabel}</Link> and we&apos;ll reply within a working day.</p>
        </Reveal>
        <Reveal variant="right" delay={100} className="border-b border-[#E1EAF8]">
          {questions.map((f, i) => {
            const isOpen = open === i;
            return (
              // on large screens every question has the same room (answer included), so opening one never moves the others
              <div key={i} ref={(el) => { items.current[i] = el; }} className="border-t border-[#E1EAF8] lg:min-h-[185px]">
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
                    <span className={`text-[15px] font-semibold transition-colors duration-300 ${isOpen ? "text-[#1F65FF]" : "text-[#000B2C]"}`}>{f.q}</span>
                    <span aria-hidden className={`flex size-6 shrink-0 items-center justify-center rounded-full text-lg leading-none transition-colors duration-300 ${isOpen ? "bg-[#EAF1FF] text-[#1F65FF]" : "text-[#000B2C]"}`}>{isOpen ? "−" : "+"}</span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-hidden={!isOpen} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"} ${follow ? "!grid-rows-[1fr]" : ""}`}>
                  <div className="overflow-hidden"><p className="pb-5 text-[15px] leading-[1.6] text-[#4A5470]">{f.a}</p></div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </Container>
    </section>
  );
}

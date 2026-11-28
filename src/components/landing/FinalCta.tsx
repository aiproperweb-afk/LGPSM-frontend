import { footerCtas } from "@/components/cms/siteChromeContent";
import Link from "next/link";
import { Container, Headline } from "./ui";
import Reveal from "./Reveal";

// The closing call to action (Figma 278:1175). It sits on the footer's own background (see Footer), so it has none of its own.
export interface CtaCopy { title: string; body: string; primary: string; note: string }
export const HOME_CTA: CtaCopy = footerCtas.home;

export default function FinalCta({ copy = HOME_CTA, demoLabel = "Book a demo" }: { copy?: CtaCopy; demoLabel?: string }) {
  return (
    <section className="relative pb-20 pt-16 text-center sm:pt-20">
      <Container className="flex flex-col items-center gap-6"><Reveal className="flex flex-col items-center gap-6">
        <Headline className="text-white lg:tracking-[-2.03px]">{copy.title}</Headline>
        <p className="max-w-[620px] text-[16px] leading-[1.6] text-white sm:text-[17px]">{copy.body}</p>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row">
          <Link href="/signup" className="inline-flex h-[50px] items-center justify-center rounded-md bg-white px-6 text-[16px] font-semibold text-black hover:bg-[#EAF1FF] transition-colors">{copy.primary}</Link>
          <Link href="/contact" className="inline-flex h-[50px] items-center justify-center rounded-md border border-white px-6 text-[16px] font-semibold text-white hover:bg-white/10 transition-colors">{demoLabel}</Link>
        </div>
        <p className="text-[16px] text-white sm:text-[17px]">{copy.note}</p>
      </Reveal></Container>
    </section>
  );
}

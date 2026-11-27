import Image from "next/image";
import { testimonialsCopy, type TestimonialsCopy } from "@/components/cms/marketingContent";
import Reveal from "./Reveal";
import { Container, Headline } from "./ui";

// Figma node 238:28697 (and 66:7029 on the home page): three cards, the middle one deep blue with soft swooshes. The quotes live in
// constants/testimonials.ts; with none, the section is left out.
const LIGHT = "linear-gradient(136deg, #E4F0FE 7%, #C3D5FB 40%, #82B6F6 81%)";

const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

function Bleed({ src, className, inset }: { src: string; className: string; inset: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`}>
      <div className="absolute" style={{ inset }}><Image src={src} alt="" fill sizes="420px" className="max-w-none" /></div>
    </div>
  );
}

export default function Testimonials({ copy = testimonialsCopy }: { copy?: TestimonialsCopy }) {
  const items = copy.quotes;
  if (items.length === 0) return null;
  return (
    <section className="bg-white py-14 sm:py-20">
      <Container className="flex flex-col gap-10 sm:gap-12">
        <Reveal className="w-full text-center">
          <Headline className="mx-auto max-w-[820px] text-[#000B2C]">{copy.heading}</Headline>
        </Reveal>
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((t, i) => {
            const dark = i === 1;
            const ink = dark ? "text-white" : "text-[#000B2C]";
            return (
              <Reveal key={`${t.name}-${i}`} variant="pop" delay={i * 90} className={`relative flex min-h-[218px] flex-col justify-center overflow-hidden rounded-[19px] ${dark ? "bg-[#0044A9]" : ""}`} style={dark ? undefined : { backgroundImage: LIGHT }}>
                {dark ? (
                  <>
                    <Bleed src="/images/testimonials/v1.svg" className="left-[-10.5px] top-[-6.5px] h-[229px] w-[140px]" inset="-17.47% -28.57%" />
                    <Bleed src="/images/testimonials/ellipse.svg" className="right-[-249px] top-[-31px] size-[263px]" inset="-15.21%" />
                    <Bleed src="/images/testimonials/v2.svg" className="left-[-4.5px] top-[92.5px] h-[214px] w-[410px]" inset="-28.04% -14.63%" />
                  </>
                ) : null}
                <div className="relative flex flex-col gap-6 p-8">
                  <p className={`text-[17px] leading-[1.35] ${ink}`}>“{t.quote}”</p>
                  <div className="flex items-center gap-3">
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-full text-[17px] font-bold ${dark ? "bg-[#1F65FF] text-white" : "bg-white text-[#1650D9]"}`}>{t.initials || initialsOf(t.name)}</span>
                    <div className={ink}>
                      <p className="text-[17px] font-semibold leading-tight">{t.name}</p>
                      {t.role ? <p className="text-[15px] leading-tight">{t.role}</p> : null}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

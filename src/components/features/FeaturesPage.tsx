import { SiteElement, SiteText } from "@/components/cms/SiteElement";
import type { ReactNode } from "react";
import { resolveCmsImage } from "@/components/cms/approvedContent";
import type { featuresCopy } from "@/components/cms/marketingContent";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/navbar/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/landing/Reveal";
import { Container } from "@/components/landing/ui";
import { OVERVIEW, SECURITY, STAGES, type FeatureRow } from "@/constants/featuresPage";

// The Features page (Figma 119:5): hero, a jump list of the four stages, then each stage's features, the security points and the price card.
const DM = "font-[family-name:var(--font-dm-sans)]";
const BLUE_GRADIENT = "linear-gradient(180deg, #1F65FF 0%, #2071FF 33%, #2181FF 69%, #1F65FF 100%)";
const IMG = "/images/features-page";

function Row({ r, panelLeft }: { r: FeatureRow; panelLeft: boolean }) {
  return (
    <Reveal as="article" variant={panelLeft ? "right" : "left"} className={`grid items-center gap-8 lg:gap-16 ${panelLeft ? "lg:grid-cols-[560px_1fr]" : "lg:grid-cols-[1fr_560px]"}`}>
      <SiteElement site="FeaturesPage-1"><div id={r.id} className={`flex scroll-mt-[90px] flex-col gap-5 ${panelLeft ? "lg:order-2" : ""}`}>
        <SiteElement site="FeaturesPage-2"><div className="flex items-center gap-2">
          <SiteElement site="FeaturesPage-3"><Image src={`${IMG}/${r.icon}`} alt="" width={18} height={18} /></SiteElement>
          <SiteElement site="FeaturesPage-4"><p className="text-[17px] font-semibold text-[#1F65FF]">{r.eyebrow}</p></SiteElement>
        </div></SiteElement>
        <SiteElement site="FeaturesPage-5"><h3 className={`${DM} text-[28px] leading-[1.15] tracking-[-0.6px] text-[#000B2C] sm:text-[36px]`}>{r.title}</h3></SiteElement>
        <SiteElement site="FeaturesPage-6"><p className="text-[16px] leading-[1.65] text-[#4A5470] sm:text-[17px]">{r.text}</p></SiteElement>
        <SiteElement site="FeaturesPage-7"><ul className="flex flex-col gap-[18px] pt-1">
          {r.items.map((it) => (
            <SiteElement site="FeaturesPage-8" key={it.title} item={it.title}><li  className="flex items-start gap-3">
              <SiteElement site="FeaturesPage-9"><Image src="/images/landing/tick.svg" alt="" width={20} height={20} className="mt-0.5 shrink-0" /></SiteElement>
              <SiteElement site="FeaturesPage-10"><div className="flex flex-col gap-1"><SiteElement site="FeaturesPage-11"><p className="text-[17px] font-semibold leading-[1.4] text-[#000B2C]">{it.title}</p></SiteElement><SiteElement site="FeaturesPage-12"><p className="text-[16px] leading-[1.6] text-[#4A5470]">{it.text}</p></SiteElement></div></SiteElement>
            </li></SiteElement>
          ))}
        </ul></SiteElement>
        {r.cta ? (
          <SiteElement site="FeaturesPage-13"><div className="pt-2">
            <SiteElement site="FeaturesPage-14"><Link href={r.cta.href} style={r.cta.outline ? undefined : { backgroundImage: BLUE_GRADIENT }} className={`inline-flex h-[50px] items-center justify-center rounded-xl px-6 text-[16px] font-semibold ${r.cta.outline ? "border border-[#000B2C] bg-white text-[#000B2C] hover:bg-[#EAF1FF]" : "text-white hover:brightness-95"}`}>{r.cta.label}</Link></SiteElement>
          </div></SiteElement>
        ) : null}
      </div></SiteElement>
      <SiteElement site="FeaturesPage-15"><div className={`overflow-hidden rounded-[19px] ${panelLeft ? "lg:order-1" : ""}`}>
        <SiteElement site="FeaturesPage-16"><Image src={resolveCmsImage(r.image) ?? "/images/features-page/f1-designer.png"} unoptimized={r.image.startsWith("media:")} alt={r.eyebrow} width={r.w} height={r.h} sizes="(min-width: 1024px) 560px, 100vw" className="h-auto w-full" /></SiteElement>
      </div></SiteElement>
    </Reveal>
  );
}

export default function FeaturesPage({ copy, visualHero }: { visualHero?: ReactNode; copy: typeof featuresCopy }) {
  return (
    <SiteElement site="FeaturesPage-17"><div className="min-h-screen bg-white font-[family-name:var(--font-inter)]">
      <Navbar />
      <SiteElement site="FeaturesPage-18"><main>
        <SiteElement site="FeaturesPage-19"><section className="relative overflow-hidden bg-[#F6F6FF] py-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute left-[-96px] top-0 hidden h-[681px] w-[1632px] lg:block"><SiteElement site="FeaturesPage-20"><Image src="/images/how-it-works/hero-lines.svg" alt="" fill priority sizes="1632px" className="max-w-none" /></SiteElement></div>
          {visualHero ?? (<Container className="relative flex flex-col items-center gap-6 text-center">
            <SiteElement site="FeaturesPage-21"><div className="flex items-center gap-2 rounded-full border border-[#E1E7F2] bg-white py-[7px] pl-2 pr-3.5">
              <SiteElement site="FeaturesPage-22"><span className="flex size-[22px] items-center justify-center rounded-full bg-[#EAF1FF]"><SiteElement site="FeaturesPage-23"><Image src={`${IMG}/hero-features.svg`} alt="" width={13} height={13} /></SiteElement></span></SiteElement>
              <SiteElement site="FeaturesPage-24"><span className="text-[15px] text-[#4A5470]">{copy.heroBadge}</span></SiteElement>
            </div></SiteElement>
            <SiteElement site="FeaturesPage-25"><h1 className={`${DM} max-w-[1000px] text-[34px] leading-[1.1] tracking-[-1.2px] text-[#000B2C] sm:text-[46px] lg:text-[58px] lg:leading-[64px] lg:tracking-[-2.24px]`}>{copy.heading}</h1></SiteElement>
            <SiteElement site="FeaturesPage-26"><p className="max-w-[860px] text-[16px] leading-[1.5] text-[#4A5470] sm:text-[17px]">{copy.introduction}</p></SiteElement>
            <SiteElement site="FeaturesPage-27"><Link href="/signup" style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-[54px] items-center justify-center rounded-xl px-6 text-[16px] font-semibold text-white hover:brightness-95">{copy.signupLabel}</Link></SiteElement>
          </Container>)}
        </section></SiteElement>

        <SiteElement site="FeaturesPage-28"><section className="bg-white py-14 sm:py-20">
          <Container className="flex flex-col gap-12 sm:gap-14">
            <SiteElement site="FeaturesPage-29"><div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 text-center">
              <SiteElement site="FeaturesPage-30"><h2 className={`${DM} text-[32px] leading-[1.1] tracking-[-0.9px] text-[#000B2C] sm:text-[40px] lg:text-[48px]`}>{copy.overviewHeading}</h2></SiteElement>
              <SiteElement site="FeaturesPage-31"><p className="max-w-[640px] text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{copy.overviewIntroduction}</p></SiteElement>
            </div></SiteElement>
            <SiteElement site="FeaturesPage-32"><ol className="grid grid-cols-1 border-y border-[#D3D3D3] sm:grid-cols-2 lg:grid-cols-5">
              {OVERVIEW.map((item, i) => ({ ...item, ...copy.overview[i] })).map((o, i) => (
                <SiteElement site="FeaturesPage-33" key={o.title} item={o.title}><li  className={`${i > 0 ? "border-t border-[#D3D3D3] sm:border-t-0 lg:border-l" : ""} ${i % 2 === 1 ? "sm:border-l" : ""} ${i === 0 ? "lg:pr-8" : i === OVERVIEW.length - 1 ? "lg:pl-8" : "lg:px-8"}`}>
                  <SiteElement site="FeaturesPage-34"><a href={o.href} className="group flex h-full flex-col gap-3.5 px-6 py-9 transition-colors hover:bg-[#F6F9FF] lg:px-0">
                    <SiteElement site="FeaturesPage-35"><span className={`flex size-12 items-center justify-center rounded-full ${o.plain ? "" : "bg-[#EAF1FF]"}`}><SiteElement site="FeaturesPage-36"><Image src={`${IMG}/${o.icon}`} alt="" width={o.plain ? 48 : 28} height={o.plain ? 48 : 28} /></SiteElement></span></SiteElement>
                    <SiteElement site="FeaturesPage-37"><span className="text-[18px] font-semibold leading-[1.3] text-[#000B2C]">{o.n}. {o.title}</span></SiteElement>
                    <SiteElement site="FeaturesPage-38"><span className="text-[15px] leading-[1.6] text-[#4A5470]">{o.text}</span></SiteElement>
                  </a></SiteElement>
                </li></SiteElement>
              ))}
            </ol></SiteElement>
          </Container>
        </section></SiteElement>

        {STAGES.map((st, stageIndex) => (
          <SiteElement site="FeaturesPage-39" key={st.n} item={st.n}><section  id={`stage-${st.n}`} className="scroll-mt-[69px] bg-white py-10 sm:py-14">
            <Container className="flex flex-col gap-14 sm:gap-20">
              {st.rows.map((r, i) => <SiteElement site="FeaturesPage-40" key={r.eyebrow} item={r.eyebrow} selectable={false}><Row  r={{ ...r, ...copy.stages[stageIndex].rows[i], cta: r.cta && { ...r.cta, label: copy.stages[stageIndex].rows[i].buttonLabel } }} panelLeft={i % 2 === 1} /></SiteElement>)}
            </Container>
          </section></SiteElement>
        ))}

        <SiteElement site="FeaturesPage-41"><section className="bg-white py-14 sm:py-20">
          <Container className="flex flex-col gap-12 sm:gap-14">
            <SiteElement site="FeaturesPage-42"><div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 text-center">
              <SiteElement site="FeaturesPage-43"><h2 className={`${DM} text-[32px] leading-[1.1] tracking-[-0.9px] text-[#000B2C] sm:text-[40px] lg:text-[48px]`}>{copy.securityHeading}</h2></SiteElement>
              <SiteElement site="FeaturesPage-44"><p className="max-w-[640px] text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{copy.securityIntroduction}</p></SiteElement>
            </div></SiteElement>
            <SiteElement site="FeaturesPage-45"><ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {SECURITY.map((item, i) => ({ ...item, ...copy.security[i] })).map((s, i) => (
                <SiteElement site="FeaturesPage-46" key={s.title} item={s.title}><li  className={`flex flex-col gap-3 ${i < SECURITY.length - 1 ? "lg:border-r lg:border-[rgba(60,60,67,0.18)] lg:pr-5" : ""}`}>
                  <SiteElement site="FeaturesPage-47"><Image src={`${IMG}/${s.icon}`} alt="" width={30} height={30} /></SiteElement>
                  <SiteElement site="FeaturesPage-48"><p className="text-[17px] font-semibold text-[#000B2C]">{s.title}</p></SiteElement>
                  <SiteElement site="FeaturesPage-49"><p className="text-[17px] leading-[1.35] text-[#4A5470]">{s.text}</p></SiteElement>
                </li></SiteElement>
              ))}
            </ul></SiteElement>
          </Container>
        </section></SiteElement>

        {/* the price card sits on the design's pale violet background with the same dashed-square lines as the hero (Figma 115:449) */}
        <SiteElement site="FeaturesPage-50"><section className="relative overflow-hidden bg-[#F6F6FF] py-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute left-[-96px] top-[-16px] hidden h-[681px] w-[1632px] lg:block"><SiteElement site="FeaturesPage-51"><Image src="/images/how-it-works/hero-lines.svg" alt="" fill sizes="1632px" className="max-w-none" /></SiteElement></div>
          <Container className="relative">
            <SiteElement site="FeaturesPage-52"><div className="flex flex-col items-center gap-7 rounded-3xl border border-[#E1E7F2] bg-white p-8 text-center sm:p-16">
              <SiteElement site="FeaturesPage-53"><h2 className={`${DM} max-w-[900px] text-[32px] leading-[1.1] tracking-[-0.9px] text-[#000B2C] sm:text-[40px] lg:text-[48px]`}>{copy.pricingHeading}</h2></SiteElement>
              <SiteElement site="FeaturesPage-54"><p className="max-w-[680px] text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{copy.pricingIntroduction}</p></SiteElement>
              <SiteElement site="FeaturesPage-55"><ul className="grid w-full max-w-[936px] grid-cols-1 gap-x-6 gap-y-4 pt-2 text-left sm:grid-cols-2 lg:grid-cols-3">
                {copy.included.map((t) => (
                  <SiteElement site="FeaturesPage-56" key={t} item={t}><li  className="flex items-center gap-2.5 text-[16px] font-medium leading-[1.4] text-[#000B2C]"><SiteElement site="FeaturesPage-58"><Image src="/images/landing/tick.svg" alt="" width={20} height={20} /></SiteElement><SiteText site="FeaturesPage-56-text-57">{t}</SiteText></li></SiteElement>
                ))}
              </ul></SiteElement>
              <SiteElement site="FeaturesPage-59"><Link href="/pricing" style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-[54px] items-center justify-center rounded-xl px-6 text-[16px] font-semibold text-white hover:brightness-95">{copy.pricingLabel}</Link></SiteElement>
            </div></SiteElement>
          </Container>
        </section></SiteElement>
      </main></SiteElement>
      <Footer inner ctaVariant="features" />
    </div></SiteElement>
  );
}

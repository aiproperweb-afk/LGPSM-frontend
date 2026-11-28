import { SiteElement, SiteText } from "@/components/cms/SiteElement";
import type { HomeContent } from "@/components/cms/homeContent";
import { resolveCmsImage } from "@/components/cms/approvedContent";
import type { ClientCopy, TestimonialsCopy } from "@/components/cms/marketingContent";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Navbar from "@/app/navbar/Navbar";
import Footer from "@/components/Footer";
import FaqLanding from "@/components/landing/FaqLanding";
import ClientBackdrop from "./ClientBackdrop";
import ClientContactForm from "./ClientContactForm";
import Reveal from "@/components/landing/Reveal";
import Testimonials from "@/components/landing/Testimonials";
import { LogosRow, StatsRow } from "@/components/landing/StatsClients";
import { Container, Tick } from "@/components/landing/ui";
import { type ClientCategory } from "@/constants/clients";

// A Clients page (Figma 228:1029, Business & Corporate; the other categories use the same template).
const DM = "font-[family-name:var(--font-dm-sans)]";
const BLUE_GRADIENT = "linear-gradient(180deg, #1F65FF 0%, #2071FF 33%, #2181FF 69%, #1F65FF 100%)";

/** A decorative picture that bleeds beyond the box it sits in (the design's glows and swooshes) */
function Bleed({ src, className = "", inset = "0" }: { src: string; className?: string; inset?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`}>
      <SiteElement site="ClientPage-1"><div className="absolute" style={{ inset }}><SiteElement site="ClientPage-2"><Image src={src} alt="" fill sizes="700px" className="max-w-none" /></SiteElement></div></SiteElement>
    </div>
  );
}

function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <SiteElement site="ClientPage-3"><h2 className={`${DM} text-[32px] leading-[1.1] tracking-[-0.9px] sm:text-[40px] lg:text-[48px] ${className}`}>{children}</h2></SiteElement>;
}

function Check({ children, white = false }: { children: ReactNode; white?: boolean }) {
  return (
    <SiteElement site="ClientPage-4"><li className="flex items-start gap-2.5 text-[16px] font-medium leading-[1.5] text-[#000B2C]">
      <SiteElement site="ClientPage-5"><Image src={white ? "/images/clients/check-white.svg" : "/images/landing/tick.svg"} alt="" width={20} height={20} className="mt-0.5 shrink-0" /></SiteElement>
      <SiteElement site="ClientPage-6"><span>{children}</span></SiteElement>
    </li></SiteElement>
  );
}

export default function ClientPage({ category, copy, testimonials, faq, stats, visualHero }: { visualHero?: ReactNode; category: ClientCategory; copy: ClientCopy; testimonials?: TestimonialsCopy; faq?: HomeContent["FaqLanding"]; stats?: HomeContent["StatsClients"]["stats"] }) {
  const c = { ...category, ...copy };
  const half = Math.ceil(copy.tools.length / 2);
  return (
    <SiteElement site="ClientPage-7"><div className="min-h-screen bg-white font-[family-name:var(--font-inter)]">
      <Navbar />
      <SiteElement site="ClientPage-8"><main>
        {/* hero */}
        <SiteElement site="ClientPage-9"><section className="relative overflow-hidden bg-[#F6F6FF] py-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute left-[-96px] top-0 hidden h-[681px] w-[1632px] lg:block"><SiteElement site="ClientPage-10"><Image src="/images/clients/hero-lines.svg" alt="" fill priority sizes="1632px" className="max-w-none" /></SiteElement></div>
          {visualHero ?? (<Container className="relative flex flex-col items-center gap-6 text-center">
            <SiteElement site="ClientPage-11"><div className="flex max-w-full items-center gap-2 rounded-full border border-[#E1E7F2] bg-white py-[7px] pl-2 pr-3.5">
              <SiteElement site="ClientPage-12"><span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#EAF1FF]"><SiteElement site="ClientPage-13"><Image src="/images/clients/eyebrow-icon.svg" alt="" width={15} height={15} /></SiteElement></span></SiteElement>
              <SiteElement site="ClientPage-14"><span className="text-[11px] tracking-[1px] text-[#4A5470] sm:text-[13px]">{c.eyebrow}</span></SiteElement>
            </div></SiteElement>
            <SiteElement site="ClientPage-15"><p className="text-[15px] font-medium text-[#4A5470]">{c.tagline}</p></SiteElement>
            <SiteElement site="ClientPage-16"><h1 className={`${DM} max-w-[1000px] text-[36px] leading-[1.1] tracking-[-1.2px] text-[#000B2C] sm:text-[48px] lg:text-[58px] lg:leading-[64px] lg:tracking-[-2.24px]`}>{c.heading}</h1></SiteElement>
            <SiteElement site="ClientPage-17"><p className="max-w-[820px] text-[16px] leading-[1.5] text-[#4A5470] sm:text-[17px]">{c.sub}</p></SiteElement>
            <SiteElement site="ClientPage-18"><div className="flex flex-col items-stretch gap-3 sm:flex-row">
              <SiteElement site="ClientPage-19"><Link href="/contact" style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-[54px] items-center justify-center rounded-xl px-6 text-[16px] font-semibold text-white hover:brightness-95">{copy.demoLabel}</Link></SiteElement>
              <SiteElement site="ClientPage-20"><Link href="/how-it-works" className="inline-flex h-[54px] items-center justify-center gap-2 rounded-xl border border-[#000B2C] bg-white px-6 text-[16px] font-semibold text-[#000B2C] hover:bg-[#EAF1FF]"><SiteText site="ClientPage-20-text-21">{copy.tutorialLabel}</SiteText> <SiteElement site="ClientPage-22"><Image src="/images/clients/play.svg" alt="" width={24} height={24} /></SiteElement></Link></SiteElement>
            </div></SiteElement>
          </Container>)}
        </section></SiteElement>

        {/* clients */}
        <SiteElement site="ClientPage-23"><section className="bg-white py-12 sm:py-16">
          <Container className="flex flex-col items-center gap-8 text-center">
            <SiteElement site="ClientPage-24"><h2 className={`${DM} text-[26px] leading-[1.15] tracking-[-0.9px] text-[#000B2C] sm:text-[36px] lg:text-[40px]`}>{copy.clientsHeading}</h2></SiteElement>
            <LogosRow />
          </Container>
        </section></SiteElement>

        {/* services */}
        <SiteElement site="ClientPage-25"><section className="bg-white py-12 sm:py-20">
          <Container className="grid items-center gap-10 lg:grid-cols-[1fr_560px] lg:gap-12">
            <Reveal variant="left" className="flex flex-col gap-8">
              <SiteElement site="ClientPage-26"><div className="flex flex-col gap-4">
                <H2 className="text-[#000B2C] lg:text-[56px] lg:tracking-[-0.92px]">{c.servicesTitle}</H2>
                <SiteElement site="ClientPage-27"><p className="text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{c.servicesSub}</p></SiteElement>
              </div></SiteElement>
              <SiteElement site="ClientPage-28"><ul className="flex flex-col gap-4">
                {c.services.map((s) => (
                  <SiteElement site="ClientPage-29" key={s.label} item={s.label}><li  className="flex items-start gap-3 text-[16px] leading-[1.4] text-[#4A5470] sm:text-[17px]">
                    <Tick className="mt-0.5" />
                    <SiteElement site="ClientPage-30"><span><SiteElement site="ClientPage-32"><b className="font-semibold text-[#000B2C]">{s.label}</b></SiteElement> <SiteText site="ClientPage-30-text-31">{s.text}</SiteText></span></SiteElement>
                  </li></SiteElement>
                ))}
              </ul></SiteElement>
            </Reveal>
            <Reveal variant="right" className="relative h-[360px] overflow-hidden rounded-[19px] bg-[#0156D5] sm:h-[480px] lg:h-[593px]">
              {c.slug === "business-corporate" ? (
                <SiteElement site="ClientPage-33"><div className="absolute left-[-229px] top-[-5px] h-[610px] w-[914px]"><SiteElement site="ClientPage-34"><Image src={resolveCmsImage(copy.servicesImage) ?? "/images/clients/services-photo.png"} unoptimized={copy.servicesImage.startsWith("media:")} alt="" fill sizes="914px" className="max-w-none object-cover" /></SiteElement></div></SiteElement>
              ) : (
                <SiteElement site="ClientPage-35"><Image src={resolveCmsImage(copy.servicesImage) ?? "/images/landing/dashboard-hero.jpg"} unoptimized={copy.servicesImage.startsWith("media:")} alt="The EventQRapp event dashboard" fill sizes="560px" className="object-cover object-left-top" /></SiteElement>
              )}
            </Reveal>
          </Container>
        </section></SiteElement>

        {/* event types */}
        <SiteElement site="ClientPage-36"><section className="bg-white py-12 sm:py-20">
          <Container className="flex flex-col gap-12">
            <H2 className="mx-auto max-w-[900px] text-center text-[#000B2C]">{c.typesTitle}</H2>
            <SiteElement site="ClientPage-37"><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {c.types.map((t, i) => (
                <SiteElement site="ClientPage-38" key={t.title} item={t.title} selectable={false}><Reveal  variant="up" delay={i * 80} className="relative flex flex-col gap-3 self-stretch rounded-2xl border border-[#E1E7F2] bg-white p-7">
                  <SiteElement site="ClientPage-39"><div className="relative h-[120px] w-full overflow-hidden rounded-lg bg-[#EAF1FF]">
                    {t.image ? <SiteElement site="ClientPage-40"><Image src={resolveCmsImage(t.image) ?? "/images/landing/dashboard-hero.jpg"} unoptimized={t.image.startsWith("media:")} alt="" fill sizes="280px" className="object-cover" /></SiteElement> : null}
                  </div></SiteElement>
                  <SiteElement site="ClientPage-41"><h3 className="text-[18px] font-medium leading-[1.3] text-[#000B2C]">{t.title}</h3></SiteElement>
                  <SiteElement site="ClientPage-42"><p className="text-[15px] leading-[1.4] text-[#4A5470]">{t.text}</p></SiteElement>
                  <SiteElement site="ClientPage-43"><span className="absolute left-[18px] top-[18px] flex size-10 items-center justify-center rounded-full bg-[#EAF1FF] text-[15px] font-semibold text-[#1F65FF]">{String(i + 1).padStart(2, "0")}</span></SiteElement>
                </Reveal></SiteElement>
              ))}
            </div></SiteElement>
          </Container>
        </section></SiteElement>

        {/* channels and tools */}
        <SiteElement site="ClientPage-44"><section className="relative overflow-hidden bg-[#000B2C] py-16 sm:py-24">
          <ClientBackdrop />
          <Container className="relative grid items-center gap-10 lg:grid-cols-[360px_1fr] lg:gap-16">
            <H2 className="text-white lg:text-[44px]">{copy.toolsHeading}</H2>
            <SiteElement site="ClientPage-45"><div className="grid gap-[18px] rounded-[20px] border border-[#E1E7F2] bg-[#F9F9FA] p-6 sm:grid-cols-2 sm:gap-8 sm:p-10">
              <SiteElement site="ClientPage-46"><ul className="flex flex-col gap-[18px]">{copy.tools.slice(0, half).map((t) => <SiteElement site="ClientPage-47" key={t} item={t} selectable={false}><Check >{t}</Check></SiteElement>)}</ul></SiteElement>
              <SiteElement site="ClientPage-48"><ul className="flex flex-col gap-[18px]">{copy.tools.slice(half).map((t) => <SiteElement site="ClientPage-49" key={t} item={t} selectable={false}><Check >{t}</Check></SiteElement>)}</ul></SiteElement>
            </div></SiteElement>
          </Container>
        </section></SiteElement>

        {/* statements */}
        <SiteElement site="ClientPage-50"><section className="bg-white py-12 sm:py-20">
          <Container className="grid gap-6 lg:grid-cols-2">
            <Reveal variant="left" className="flex flex-col gap-[18px] rounded-3xl p-8 sm:p-12" style={{ backgroundImage: "linear-gradient(143.8deg, #E4F0FE 0%, #C3D5FB 71.4%)" }}>
              <SiteElement site="ClientPage-51"><span className="flex size-14 items-center justify-center rounded-[14px] bg-white"><SiteElement site="ClientPage-52"><Image src="/images/clients/scan.svg" alt="" width={28} height={28} /></SiteElement></span></SiteElement>
              <SiteElement site="ClientPage-53"><h3 className={`${DM} text-[28px] leading-[1.15] tracking-[-0.6px] text-[#000B2C] sm:text-[36px]`}>{c.statementTitle}</h3></SiteElement>
              <SiteElement site="ClientPage-54"><p className="text-[16px] leading-[1.65] text-[#000B2C] sm:text-[17px]">{c.statementText}</p></SiteElement>
            </Reveal>
            <Reveal variant="right" className="flex flex-col gap-5 rounded-[19px] p-8 sm:p-9" style={{ backgroundImage: "linear-gradient(154.36deg, rgb(32, 21, 155) 14.16%, rgb(86, 66, 196) 29.72%, rgb(86, 66, 196) 69.86%, rgb(9, 37, 137) 81.51%)" }}>
              <SiteElement site="ClientPage-55"><span className="flex size-14 items-center justify-center rounded-[14px] bg-white/10">
                <SiteElement site="ClientPage-56"><Image src="/images/clients/lock.svg" alt="" width={28} height={28} /></SiteElement>
              </span></SiteElement>
              <SiteElement site="ClientPage-57"><h3 className={`${DM} text-[28px] leading-[1.15] tracking-[-0.6px] text-white sm:text-[36px]`}>{copy.privacyHeading}</h3></SiteElement>
              <SiteElement site="ClientPage-58"><p className="text-[16px] leading-[1.65] text-[#D6DDF0] sm:text-[17px]">{copy.privacyDescription}</p></SiteElement>
              <SiteElement site="ClientPage-59"><Link href="/contact" className="mt-auto inline-flex h-[50px] items-center justify-center rounded-md bg-white px-6 text-[16px] font-semibold text-black hover:bg-[#EAF1FF]">{copy.callbackLabel}</Link></SiteElement>
            </Reveal>
          </Container>
        </section></SiteElement>

        {/* why */}
        <SiteElement site="ClientPage-60"><section className="bg-white py-12 sm:py-20">
          <Container className="grid items-center gap-10 lg:grid-cols-[1fr_560px] lg:gap-16">
            <Reveal variant="left" className="flex flex-col gap-7">
              <SiteElement site="ClientPage-61"><div className="flex flex-col gap-4">
                <H2 className="text-[#000B2C] lg:text-[44px]">{c.whyTitle}</H2>
                <SiteElement site="ClientPage-62"><p className="text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{c.whySub}</p></SiteElement>
              </div></SiteElement>
              <SiteElement site="ClientPage-63"><ul className="flex flex-col gap-4">{c.why.map((w) => <SiteElement site="ClientPage-64" key={w} item={w} selectable={false}><Check >{w}</Check></SiteElement>)}</ul></SiteElement>
              <SiteElement site="ClientPage-65"><Link href="/contact" style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-[54px] items-center justify-center self-start rounded-xl px-6 text-[16px] font-semibold text-white hover:brightness-95">{copy.scheduleLabel}</Link></SiteElement>
            </Reveal>
            <Reveal variant="right" className="relative h-[360px] overflow-hidden rounded-[19px] bg-[#0156D5] sm:h-[480px] lg:h-[593px]">
              <Bleed src="/images/clients/why-v1.svg" className="left-[-10.5px] top-[-34.5px] h-[382px] w-[234px]" inset="-10.47% -17.09%" />
              <Bleed src="/images/clients/why-ellipse.svg" className="right-[-41px] top-[-31px] size-[263px]" inset="-15.21%" />
              <Bleed src="/images/clients/why-v2.svg" className="left-[1.5px] top-[310.5px] h-[356px] w-[682px]" inset="-5.62% -2.93%" />
              <SiteElement site="ClientPage-66"><div className="absolute left-[30px] top-[45px] h-[558px] w-[709px] rounded-tl-[20px] bg-white">
                <SiteElement site="ClientPage-67"><div className="absolute bottom-[-15px] left-[17px] h-[557px] w-[692px]"><SiteElement site="ClientPage-68"><Image src={resolveCmsImage(copy.whyImage) ?? "/images/clients/why-dashboard.png"} unoptimized={copy.whyImage.startsWith("media:")} alt="The EventQRapp event dashboard" fill sizes="692px" className="max-w-none object-cover" /></SiteElement></div></SiteElement>
              </div></SiteElement>
            </Reveal>
          </Container>
        </section></SiteElement>

        {/* essentials */}
        <SiteElement site="ClientPage-69"><section className="py-16 sm:py-24" style={{ backgroundImage: "linear-gradient(90deg, #1F65FF, #0B1635)" }}>
          <Container className="flex flex-col items-center gap-9 text-center">
            <SiteElement site="ClientPage-70"><div className="flex flex-col gap-4">
              <H2 className="text-white">{copy.essentialsHeading}</H2>
              <SiteElement site="ClientPage-71"><p className="mx-auto max-w-[680px] text-[16px] leading-[1.6] text-[#D6DDF0] sm:text-[17px]">{copy.essentialsDescription}</p></SiteElement>
            </div></SiteElement>
            <SiteElement site="ClientPage-72"><ul className="flex flex-wrap justify-center gap-4">
              {copy.essentials.map((e) => (
                <SiteElement site="ClientPage-73" key={e} item={e}><li  className="flex items-center gap-2.5 rounded-full border border-white/25 bg-white/[0.12] py-3.5 pl-4 pr-5 text-[16px] font-semibold text-white">
                  <SiteElement site="ClientPage-75"><Image src="/images/clients/check-white.svg" alt="" width={20} height={20} /></SiteElement><SiteText site="ClientPage-73-text-74">{e}</SiteText>
                </li></SiteElement>
              ))}
            </ul></SiteElement>
          </Container>
        </section></SiteElement>

        <Testimonials copy={testimonials} />

        <SiteElement site="ClientPage-76"><section className="bg-white py-10 sm:py-14"><Container><StatsRow stats={stats} /></Container></section></SiteElement>

        {/* closing call to action */}
        <SiteElement site="ClientPage-77"><section className="bg-white py-12 sm:py-20">
          <Container>
            <SiteElement site="ClientPage-78"><div className="flex flex-col items-center gap-7 rounded-[28px] px-6 py-14 text-center sm:px-16 sm:py-[72px]" style={{ backgroundImage: "linear-gradient(90deg, #1F65FF, #0B1635)" }}>
              <SiteElement site="ClientPage-79"><h2 className={`${DM} max-w-[820px] text-[28px] leading-[1.15] tracking-[-0.8px] text-white sm:text-[44px]`}>{c.closing}</h2></SiteElement>
              <SiteElement site="ClientPage-80"><div className="flex flex-col items-stretch gap-3 sm:flex-row">
                <SiteElement site="ClientPage-81"><Link href="/contact" className="inline-flex h-[52px] items-center justify-center rounded-md bg-white px-7 text-[16px] font-semibold text-black hover:bg-[#EAF1FF]">{copy.demoLabel}</Link></SiteElement>
                <SiteElement site="ClientPage-82"><Link href="/contact" className="inline-flex h-[52px] items-center justify-center rounded-md border border-white px-7 text-[16px] font-semibold text-white hover:bg-white/10">{copy.contactLabel}</Link></SiteElement>
              </div></SiteElement>
            </div></SiteElement>
          </Container>
        </section></SiteElement>

        <ClientContactForm category={c.name} eventTypes={c.types.map((t) => t.title)} heading={copy.enquiryHeading} description={copy.enquiryDescription} submitLabel={copy.enquirySubmitLabel} />

        <FaqLanding {...faq} />
      </main></SiteElement>
      <Footer inner ctaVariant="clients" />
    </div></SiteElement>
  );
}

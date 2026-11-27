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
import { COMMON_TOOLS, ESSENTIALS, type ClientCategory } from "@/constants/clients";

// A Clients page (Figma 228:1029, Business & Corporate; the other categories use the same template).
const DM = "font-[family-name:var(--font-dm-sans)]";
const BLUE_GRADIENT = "linear-gradient(180deg, #1F65FF 0%, #2071FF 33%, #2181FF 69%, #1F65FF 100%)";

/** A decorative picture that bleeds beyond the box it sits in (the design's glows and swooshes) */
function Bleed({ src, className = "", inset = "0" }: { src: string; className?: string; inset?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`}>
      <div className="absolute" style={{ inset }}><Image src={src} alt="" fill sizes="700px" className="max-w-none" /></div>
    </div>
  );
}

function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`${DM} text-[32px] leading-[1.1] tracking-[-0.9px] sm:text-[40px] lg:text-[48px] ${className}`}>{children}</h2>;
}

function Check({ children, white = false }: { children: ReactNode; white?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-[16px] font-medium leading-[1.5] text-[#000B2C]">
      <Image src={white ? "/images/clients/check-white.svg" : "/images/landing/tick.svg"} alt="" width={20} height={20} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

export default function ClientPage({ c }: { c: ClientCategory }) {
  const half = Math.ceil(COMMON_TOOLS.length / 2);
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-inter)]">
      <Navbar />
      <main>
        {/* hero */}
        <section className="relative overflow-hidden bg-[#F6F6FF] py-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute left-[-96px] top-0 hidden h-[681px] w-[1632px] lg:block"><Image src="/images/clients/hero-lines.svg" alt="" fill priority sizes="1632px" className="max-w-none" /></div>
          <Container className="relative flex flex-col items-center gap-6 text-center">
            <div className="flex max-w-full items-center gap-2 rounded-full border border-[#E1E7F2] bg-white py-[7px] pl-2 pr-3.5">
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#EAF1FF]"><Image src="/images/clients/eyebrow-icon.svg" alt="" width={15} height={15} /></span>
              <span className="text-[11px] tracking-[1px] text-[#4A5470] sm:text-[13px]">{c.eyebrow}</span>
            </div>
            <p className="text-[15px] font-medium text-[#4A5470]">{c.tagline}</p>
            <h1 className={`${DM} max-w-[1000px] text-[36px] leading-[1.1] tracking-[-1.2px] text-[#000B2C] sm:text-[48px] lg:text-[58px] lg:leading-[64px] lg:tracking-[-2.24px]`}>{c.heading}</h1>
            <p className="max-w-[820px] text-[16px] leading-[1.5] text-[#4A5470] sm:text-[17px]">{c.sub}</p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row">
              <Link href="/contact" style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-[54px] items-center justify-center rounded-xl px-6 text-[16px] font-semibold text-white hover:brightness-95">Book a demo</Link>
              <Link href="/how-it-works" className="inline-flex h-[54px] items-center justify-center gap-2 rounded-xl border border-[#000B2C] bg-white px-6 text-[16px] font-semibold text-[#000B2C] hover:bg-[#EAF1FF]">See how it works <Image src="/images/clients/play.svg" alt="" width={24} height={24} /></Link>
            </div>
          </Container>
        </section>

        {/* clients */}
        <section className="bg-white py-12 sm:py-16">
          <Container className="flex flex-col items-center gap-8 text-center">
            <h2 className={`${DM} text-[26px] leading-[1.15] tracking-[-0.9px] text-[#000B2C] sm:text-[36px] lg:text-[40px]`}>Event planners, agencies and families already on board</h2>
            <LogosRow />
          </Container>
        </section>

        {/* services */}
        <section className="bg-white py-12 sm:py-20">
          <Container className="grid items-center gap-10 lg:grid-cols-[1fr_560px] lg:gap-12">
            <Reveal variant="left" className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <H2 className="text-[#000B2C] lg:text-[56px] lg:tracking-[-0.92px]">{c.servicesTitle}</H2>
                <p className="text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{c.servicesSub}</p>
              </div>
              <ul className="flex flex-col gap-4">
                {c.services.map((s) => (
                  <li key={s.label} className="flex items-start gap-3 text-[16px] leading-[1.4] text-[#4A5470] sm:text-[17px]">
                    <Tick className="mt-0.5" />
                    <span><b className="font-semibold text-[#000B2C]">{s.label}</b> {s.text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal variant="right" className="relative h-[360px] overflow-hidden rounded-[19px] bg-[#0156D5] sm:h-[480px] lg:h-[593px]">
              {c.slug === "business-corporate" ? (
                <div className="absolute left-[-229px] top-[-5px] h-[610px] w-[914px]"><Image src="/images/clients/services-photo.png" alt="" fill sizes="914px" className="max-w-none object-cover" /></div>
              ) : (
                <Image src="/images/landing/dashboard-hero.jpg" alt="The EventQRapp event dashboard" fill sizes="560px" className="object-cover object-left-top" />
              )}
            </Reveal>
          </Container>
        </section>

        {/* event types */}
        <section className="bg-white py-12 sm:py-20">
          <Container className="flex flex-col gap-12">
            <H2 className="mx-auto max-w-[900px] text-center text-[#000B2C]">{c.typesTitle}</H2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {c.types.map((t, i) => (
                <Reveal key={t.title} variant="up" delay={i * 80} className="relative flex flex-col gap-3 self-stretch rounded-2xl border border-[#E1E7F2] bg-white p-7">
                  <div className="relative h-[120px] w-full overflow-hidden rounded-lg bg-[#EAF1FF]">
                    {t.image ? <Image src={t.image} alt="" fill sizes="280px" className="object-cover" /> : null}
                  </div>
                  <h3 className="text-[18px] font-medium leading-[1.3] text-[#000B2C]">{t.title}</h3>
                  <p className="text-[15px] leading-[1.4] text-[#4A5470]">{t.text}</p>
                  <span className="absolute left-[18px] top-[18px] flex size-10 items-center justify-center rounded-full bg-[#EAF1FF] text-[15px] font-semibold text-[#1F65FF]">{String(i + 1).padStart(2, "0")}</span>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* channels and tools */}
        <section className="relative overflow-hidden bg-[#000B2C] py-16 sm:py-24">
          <ClientBackdrop />
          <Container className="relative grid items-center gap-10 lg:grid-cols-[360px_1fr] lg:gap-16">
            <H2 className="text-white lg:text-[44px]">Channels and tools that work for {c.slug === "business-corporate" ? "business" : "your event"}</H2>
            <div className="grid gap-[18px] rounded-[20px] border border-[#E1E7F2] bg-[#F9F9FA] p-6 sm:grid-cols-2 sm:gap-8 sm:p-10">
              <ul className="flex flex-col gap-[18px]">{COMMON_TOOLS.slice(0, half).map((t) => <Check key={t}>{t}</Check>)}</ul>
              <ul className="flex flex-col gap-[18px]">{COMMON_TOOLS.slice(half).map((t) => <Check key={t}>{t}</Check>)}</ul>
            </div>
          </Container>
        </section>

        {/* statements */}
        <section className="bg-white py-12 sm:py-20">
          <Container className="grid gap-6 lg:grid-cols-2">
            <Reveal variant="left" className="flex flex-col gap-[18px] rounded-3xl p-8 sm:p-12" style={{ backgroundImage: "linear-gradient(143.8deg, #E4F0FE 0%, #C3D5FB 71.4%)" }}>
              <span className="flex size-14 items-center justify-center rounded-[14px] bg-white"><Image src="/images/clients/scan.svg" alt="" width={28} height={28} /></span>
              <h3 className={`${DM} text-[28px] leading-[1.15] tracking-[-0.6px] text-[#000B2C] sm:text-[36px]`}>{c.statementTitle}</h3>
              <p className="text-[16px] leading-[1.65] text-[#000B2C] sm:text-[17px]">{c.statementText}</p>
            </Reveal>
            <Reveal variant="right" className="flex flex-col gap-5 rounded-[19px] p-8 sm:p-9" style={{ backgroundImage: "linear-gradient(154.36deg, rgb(32, 21, 155) 14.16%, rgb(86, 66, 196) 29.72%, rgb(86, 66, 196) 69.86%, rgb(9, 37, 137) 81.51%)" }}>
              <span className="flex size-14 items-center justify-center rounded-[14px] bg-white/10">
                <Image src="/images/clients/lock.svg" alt="" width={28} height={28} />
              </span>
              <h3 className={`${DM} text-[28px] leading-[1.15] tracking-[-0.6px] text-white sm:text-[36px]`}>Your guest list stays protected</h3>
              <p className="text-[16px] leading-[1.65] text-[#D6DDF0] sm:text-[17px]">Codes can&apos;t be shared to sneak extra people in, every scan is logged, and only the staff you assign can check guests in.</p>
              <Link href="/contact" className="mt-auto inline-flex h-[50px] items-center justify-center rounded-md bg-white px-6 text-[16px] font-semibold text-black hover:bg-[#EAF1FF]">Request a callback</Link>
            </Reveal>
          </Container>
        </section>

        {/* why */}
        <section className="bg-white py-12 sm:py-20">
          <Container className="grid items-center gap-10 lg:grid-cols-[1fr_560px] lg:gap-16">
            <Reveal variant="left" className="flex flex-col gap-7">
              <div className="flex flex-col gap-4">
                <H2 className="text-[#000B2C] lg:text-[44px]">{c.whyTitle}</H2>
                <p className="text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{c.whySub}</p>
              </div>
              <ul className="flex flex-col gap-4">{c.why.map((w) => <Check key={w}>{w}</Check>)}</ul>
              <Link href="/contact" style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-[54px] items-center justify-center self-start rounded-xl px-6 text-[16px] font-semibold text-white hover:brightness-95">Schedule a callback</Link>
            </Reveal>
            <Reveal variant="right" className="relative h-[360px] overflow-hidden rounded-[19px] bg-[#0156D5] sm:h-[480px] lg:h-[593px]">
              <Bleed src="/images/clients/why-v1.svg" className="left-[-10.5px] top-[-34.5px] h-[382px] w-[234px]" inset="-10.47% -17.09%" />
              <Bleed src="/images/clients/why-ellipse.svg" className="right-[-41px] top-[-31px] size-[263px]" inset="-15.21%" />
              <Bleed src="/images/clients/why-v2.svg" className="left-[1.5px] top-[310.5px] h-[356px] w-[682px]" inset="-5.62% -2.93%" />
              <div className="absolute left-[30px] top-[45px] h-[558px] w-[709px] rounded-tl-[20px] bg-white">
                <div className="absolute bottom-[-15px] left-[17px] h-[557px] w-[692px]"><Image src="/images/clients/why-dashboard.png" alt="The EventQRapp event dashboard" fill sizes="692px" className="max-w-none object-cover" /></div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* essentials */}
        <section className="py-16 sm:py-24" style={{ backgroundImage: "linear-gradient(90deg, #1F65FF, #0B1635)" }}>
          <Container className="flex flex-col items-center gap-9 text-center">
            <div className="flex flex-col gap-4">
              <H2 className="text-white">Everything your event desk needs</H2>
              <p className="mx-auto max-w-[680px] text-[16px] leading-[1.6] text-[#D6DDF0] sm:text-[17px]">The essentials for any {c.slug === "business-corporate" ? "business " : ""}event, in one dashboard.</p>
            </div>
            <ul className="flex flex-wrap justify-center gap-4">
              {ESSENTIALS.map((e) => (
                <li key={e} className="flex items-center gap-2.5 rounded-full border border-white/25 bg-white/[0.12] py-3.5 pl-4 pr-5 text-[16px] font-semibold text-white">
                  <Image src="/images/clients/check-white.svg" alt="" width={20} height={20} />{e}
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <Testimonials />

        <section className="bg-white py-10 sm:py-14"><Container><StatsRow /></Container></section>

        {/* closing call to action */}
        <section className="bg-white py-12 sm:py-20">
          <Container>
            <div className="flex flex-col items-center gap-7 rounded-[28px] px-6 py-14 text-center sm:px-16 sm:py-[72px]" style={{ backgroundImage: "linear-gradient(90deg, #1F65FF, #0B1635)" }}>
              <h2 className={`${DM} max-w-[820px] text-[28px] leading-[1.15] tracking-[-0.8px] text-white sm:text-[44px]`}>{c.closing}</h2>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row">
                <Link href="/contact" className="inline-flex h-[52px] items-center justify-center rounded-md bg-white px-7 text-[16px] font-semibold text-black hover:bg-[#EAF1FF]">Book a demo</Link>
                <Link href="/contact" className="inline-flex h-[52px] items-center justify-center rounded-md border border-white px-7 text-[16px] font-semibold text-white hover:bg-white/10">Contact us</Link>
              </div>
            </div>
          </Container>
        </section>

        <ClientContactForm category={c.name} eventTypes={c.types.map((t) => t.title)} />

        <FaqLanding />
      </main>
      <Footer inner ctaVariant="clients" />
    </div>
  );
}

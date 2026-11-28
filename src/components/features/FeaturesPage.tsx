import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/navbar/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/landing/Reveal";
import { Container } from "@/components/landing/ui";
import { INCLUDED, OVERVIEW, SECURITY, STAGES, type FeatureRow } from "@/constants/featuresPage";

// The Features page (Figma 119:5): hero, a jump list of the four stages, then each stage's features, the security points and the price card.
const DM = "font-[family-name:var(--font-dm-sans)]";
const BLUE_GRADIENT = "linear-gradient(180deg, #1F65FF 0%, #2071FF 33%, #2181FF 69%, #1F65FF 100%)";
const IMG = "/images/features-page";

function Row({ r, panelLeft }: { r: FeatureRow; panelLeft: boolean }) {
  return (
    <Reveal as="article" variant={panelLeft ? "right" : "left"} className={`grid items-center gap-8 lg:gap-16 ${panelLeft ? "lg:grid-cols-[560px_1fr]" : "lg:grid-cols-[1fr_560px]"}`}>
      <div id={r.id} className={`flex scroll-mt-[90px] flex-col gap-5 ${panelLeft ? "lg:order-2" : ""}`}>
        <div className="flex items-center gap-2">
          <Image src={`${IMG}/${r.icon}`} alt="" width={18} height={18} />
          <p className="text-[17px] font-semibold text-[#1F65FF]">{r.eyebrow}</p>
        </div>
        <h3 className={`${DM} text-[28px] leading-[1.15] tracking-[-0.6px] text-[#000B2C] sm:text-[36px]`}>{r.title}</h3>
        <p className="text-[16px] leading-[1.65] text-[#4A5470] sm:text-[17px]">{r.text}</p>
        <ul className="flex flex-col gap-[18px] pt-1">
          {r.items.map((it) => (
            <li key={it.title} className="flex items-start gap-3">
              <Image src="/images/landing/tick.svg" alt="" width={20} height={20} className="mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1"><p className="text-[17px] font-semibold leading-[1.4] text-[#000B2C]">{it.title}</p><p className="text-[16px] leading-[1.6] text-[#4A5470]">{it.text}</p></div>
            </li>
          ))}
        </ul>
        {r.cta ? (
          <div className="pt-2">
            <Link href={r.cta.href} style={r.cta.outline ? undefined : { backgroundImage: BLUE_GRADIENT }} className={`inline-flex h-[50px] items-center justify-center rounded-xl px-6 text-[16px] font-semibold ${r.cta.outline ? "border border-[#000B2C] bg-white text-[#000B2C] hover:bg-[#EAF1FF]" : "text-white hover:brightness-95"}`}>{r.cta.label}</Link>
          </div>
        ) : null}
      </div>
      <div className={`overflow-hidden rounded-[19px] ${panelLeft ? "lg:order-1" : ""}`}>
        <Image src={`${IMG}/${r.image}`} alt={r.eyebrow} width={r.w} height={r.h} sizes="(min-width: 1024px) 560px, 100vw" className="h-auto w-full" />
      </div>
    </Reveal>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-inter)]">
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-[#F6F6FF] py-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute left-[-96px] top-0 hidden h-[681px] w-[1632px] lg:block"><Image src="/images/how-it-works/hero-lines.svg" alt="" fill priority sizes="1632px" className="max-w-none" /></div>
          <Container className="relative flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-2 rounded-full border border-[#E1E7F2] bg-white py-[7px] pl-2 pr-3.5">
              <span className="flex size-[22px] items-center justify-center rounded-full bg-[#EAF1FF]"><Image src={`${IMG}/hero-features.svg`} alt="" width={13} height={13} /></span>
              <span className="text-[15px] text-[#4A5470]">Features</span>
            </div>
            <h1 className={`${DM} max-w-[1000px] text-[34px] leading-[1.1] tracking-[-1.2px] text-[#000B2C] sm:text-[46px] lg:text-[58px] lg:leading-[64px] lg:tracking-[-2.24px]`}>Every tool you need to run the guest list, from first invite to final exit</h1>
            <p className="max-w-[860px] text-[16px] leading-[1.5] text-[#4A5470] sm:text-[17px]">EventQRapp brings QR code invitations, RSVP management, session-wise entry rules and live check-in into one simple dashboard. No spreadsheets passed around, no guesswork at the gate.</p>
            <Link href="/signup" style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-[54px] items-center justify-center rounded-xl px-6 text-[16px] font-semibold text-white hover:brightness-95">Create your first event</Link>
          </Container>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <Container className="flex flex-col gap-12 sm:gap-14">
            <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 text-center">
              <h2 className={`${DM} text-[32px] leading-[1.1] tracking-[-0.9px] text-[#000B2C] sm:text-[40px] lg:text-[48px]`}>One platform, four stages of your event</h2>
              <p className="max-w-[640px] text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">Jump to the part of your event you&apos;re planning right now.</p>
            </div>
            <ol className="grid grid-cols-1 border-y border-[#D3D3D3] sm:grid-cols-2 lg:grid-cols-5">
              {OVERVIEW.map((o, i) => (
                <li key={o.title} className={`${i > 0 ? "border-t border-[#D3D3D3] sm:border-t-0 lg:border-l" : ""} ${i % 2 === 1 ? "sm:border-l" : ""} ${i === 0 ? "lg:pr-8" : i === OVERVIEW.length - 1 ? "lg:pl-8" : "lg:px-8"}`}>
                  <a href={o.href} className="group flex h-full flex-col gap-3.5 px-6 py-9 transition-colors hover:bg-[#F6F9FF] lg:px-0">
                    <span className={`flex size-12 items-center justify-center rounded-full ${o.plain ? "" : "bg-[#EAF1FF]"}`}><Image src={`${IMG}/${o.icon}`} alt="" width={o.plain ? 48 : 28} height={o.plain ? 48 : 28} /></span>
                    <span className="text-[18px] font-semibold leading-[1.3] text-[#000B2C]">{o.n}. {o.title}</span>
                    <span className="text-[15px] leading-[1.6] text-[#4A5470]">{o.text}</span>
                  </a>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {STAGES.map((st) => (
          <section key={st.n} id={`stage-${st.n}`} className="scroll-mt-[69px] bg-white py-10 sm:py-14">
            <Container className="flex flex-col gap-14 sm:gap-20">
              {st.rows.map((r, i) => <Row key={r.eyebrow} r={r} panelLeft={i % 2 === 1} />)}
            </Container>
          </section>
        ))}

        <section className="bg-white py-14 sm:py-20">
          <Container className="flex flex-col gap-12 sm:gap-14">
            <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 text-center">
              <h2 className={`${DM} text-[32px] leading-[1.1] tracking-[-0.9px] text-[#000B2C] sm:text-[40px] lg:text-[48px]`}>Built to keep gate-crashers out</h2>
              <p className="max-w-[640px] text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">Every safeguard works quietly in the background, so you can focus on your guests.</p>
            </div>
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {SECURITY.map((s, i) => (
                <li key={s.title} className={`flex flex-col gap-3 ${i < SECURITY.length - 1 ? "lg:border-r lg:border-[rgba(60,60,67,0.18)] lg:pr-5" : ""}`}>
                  <Image src={`${IMG}/${s.icon}`} alt="" width={30} height={30} />
                  <p className="text-[17px] font-semibold text-[#000B2C]">{s.title}</p>
                  <p className="text-[17px] leading-[1.35] text-[#4A5470]">{s.text}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* the price card sits on the design's pale violet background with the same dashed-square lines as the hero (Figma 115:449) */}
        <section className="relative overflow-hidden bg-[#F6F6FF] py-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute left-[-96px] top-[-16px] hidden h-[681px] w-[1632px] lg:block"><Image src="/images/how-it-works/hero-lines.svg" alt="" fill sizes="1632px" className="max-w-none" /></div>
          <Container className="relative">
            <div className="flex flex-col items-center gap-7 rounded-3xl border border-[#E1E7F2] bg-white p-8 text-center sm:p-16">
              <h2 className={`${DM} max-w-[900px] text-[32px] leading-[1.1] tracking-[-0.9px] text-[#000B2C] sm:text-[40px] lg:text-[48px]`}>Every feature, one simple price</h2>
              <p className="max-w-[680px] text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">No plans to compare, no locked features. Every event gets the full platform for a simple per-invitee price + GST, with no subscription, seat fees or setup costs.</p>
              <ul className="grid w-full max-w-[936px] grid-cols-1 gap-x-6 gap-y-4 pt-2 text-left sm:grid-cols-2 lg:grid-cols-3">
                {INCLUDED.map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[16px] font-medium leading-[1.4] text-[#000B2C]"><Image src="/images/landing/tick.svg" alt="" width={20} height={20} />{t}</li>
                ))}
              </ul>
              <Link href="/pricing" style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-[54px] items-center justify-center rounded-xl px-6 text-[16px] font-semibold text-white hover:brightness-95">View pricing</Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer inner cta={{ title: "Ready to run your smoothest guest list yet?", body: "Set up your event, design your QR invitation and send it to every guest in minutes. You only pay for the people you invite.", primary: "Create your first event", note: "No credit card needed to start · No subscription" }} />
    </div>
  );
}

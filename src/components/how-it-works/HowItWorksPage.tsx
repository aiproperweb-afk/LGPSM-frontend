import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/navbar/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/landing/Reveal";
import { Container } from "@/components/landing/ui";
import { STEPS, type Step } from "@/constants/howItWorks";
import TutorialVideo from "./TutorialVideo";

// The How it works page (Figma 182:721): hero, introduction video, then the thirteen steps, each with its own picture.
const DM = "font-[family-name:var(--font-dm-sans)]";
const BLUE_GRADIENT = "linear-gradient(180deg, #1F65FF 0%, #2071FF 33%, #2181FF 69%, #1F65FF 100%)";

// which steps share a row of the page, and which of those sit on the pale band (steps 1-3, 6-8 and 11-12 are on white)
const GROUPS = [{ from: 1, to: 3, tint: false }, { from: 4, to: 5, tint: true }, { from: 6, to: 8, tint: false }, { from: 9, to: 10, tint: true }, { from: 11, to: 12, tint: false }];

function StepBlock({ s }: { s: Step }) {
  return (
    <Reveal as="article" variant={s.textLeft ? "left" : "right"} className={`grid scroll-mt-[90px] items-center gap-8 lg:justify-between lg:gap-12 ${s.textLeft ? "lg:grid-cols-[382px_570px]" : "lg:grid-cols-[570px_382px]"}`}>
      <div id={`step-${s.n}`} className={`flex scroll-mt-[90px] flex-col gap-5 ${s.textLeft ? "" : "lg:order-2"}`}>
        <p className="text-[14px] font-semibold leading-[1.4] tracking-[1.2px] text-[#1F65FF]">Step {s.n}</p>
        <h3 className={`${DM} text-[26px] leading-[1.18] tracking-[-0.6px] text-[#000B2C] sm:text-[32px]`}>{s.title}</h3>
        <p className="text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{s.intro}</p>
        <ol className="flex flex-col gap-[18px] pt-1">
          {s.points.map((p, i) => (
            <li key={p.title} className="flex items-start gap-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1F65FF] text-[13px] font-semibold text-white">{i + 1}</span>
              <div className="flex flex-col gap-1"><p className="text-[17px] font-semibold leading-[1.4] text-[#000B2C]">{p.title}</p><p className="text-[16px] leading-[1.6] text-[#4A5470]">{p.text}</p></div>
            </li>
          ))}
        </ol>
      </div>
      <div className={`relative w-full overflow-hidden rounded-[19px] lg:w-[570px] ${s.textLeft ? "" : "lg:order-1"}`}>
                  <Image src={`/images/how-it-works/${s.image}`} alt={`Step ${s.n}: ${s.chip}`} width={1140} height={880} sizes="(min-width: 1024px) 570px, 100vw" className="h-auto w-full" />
      </div>
    </Reveal>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-inter)]">
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-[#F6F6FF] py-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute left-[-96px] top-0 hidden h-[681px] w-[1632px] lg:block"><Image src="/images/how-it-works/hero-lines.svg" alt="" fill priority sizes="1632px" className="max-w-none" /></div>
          <Container className="relative flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-2 rounded-full border border-[#E1E7F2] bg-white py-[7px] pl-2 pr-3.5">
              <span className="flex size-[22px] items-center justify-center rounded-full bg-[#EAF1FF]"><Image src="/images/how-it-works/eyebrow-icon.svg" alt="" width={13} height={13} /></span>
              <span className="text-[12px] tracking-[1px] text-[#4A5470] sm:text-[15px]">HOW EVENTQRAPP WORKS</span>
            </div>
            <h1 className={`${DM} max-w-[1000px] text-[34px] leading-[1.1] tracking-[-1.2px] text-[#000B2C] sm:text-[46px] lg:text-[58px] lg:leading-[64px] lg:tracking-[-2.24px]`}>How to Create an Event, Send QR Invitations, and Manage Guest Entry</h1>
            <p className="max-w-[880px] text-[16px] leading-[1.5] text-[#4A5470] sm:text-[17px]">Learn how to use EventQRapp, from setting up your account and creating your first event to inviting guests, scanning QR codes, and tracking attendance. Follow each step with simple instructions and short video tutorials.</p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row">
              <Link href="/signup" style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-[54px] items-center justify-center rounded-xl px-6 text-[16px] font-semibold text-white hover:brightness-95">Create Your First Event</Link>
              <a href="#tutorial" className="inline-flex h-[54px] items-center justify-center gap-2 rounded-xl border border-[#000B2C] bg-white px-6 text-[16px] font-semibold text-[#000B2C] hover:bg-[#EAF1FF]">Watch Full Tutorial <Image src="/images/how-it-works/play.svg" alt="" width={24} height={24} /></a>
            </div>
          </Container>
        </section>

        <section className="border-t border-[#EEF2F8] bg-white py-14 sm:py-20">
          <Container className="flex flex-col items-center gap-12">
            <div className="flex max-w-[720px] flex-col items-center gap-4 text-center">
              <h2 className={`${DM} text-[32px] leading-[1.1] tracking-[-0.9px] text-[#000B2C] sm:text-[40px] lg:text-[48px]`}>See How EventQRapp Works in Just 2 Minutes</h2>
              <p className="text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">New to EventQRapp? Watch this quick walkthrough to understand how to set up an event, prepare your guest list, send invitations, and manage entry on event day.</p>
            </div>
            <TutorialVideo />
          </Container>
        </section>

        <section className="bg-white pt-6">
          <Container className="flex flex-col gap-12 pb-12 sm:pb-16">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-[14px] font-semibold tracking-[1.2px] text-[#1F65FF]">Step-by-step guide</p>
              <h2 className={`${DM} max-w-[900px] text-[32px] leading-[1.1] tracking-[-0.9px] text-[#000B2C] sm:text-[40px] lg:text-[48px]`}>Everything you need to know, one step at a time</h2>
              <p className="max-w-[720px] text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">Follow these short tutorials in order to set up and run your event. Each step explains what to do and includes a picture to help you follow along.</p>
            </div>
            <nav aria-label="Jump to a step" className="flex flex-wrap justify-center gap-2.5">
              {STEPS.map((s) => (
                <a key={s.n} href={`#step-${s.n}`} className="flex items-center gap-2 rounded-full border border-[#E1E7F2] bg-white py-2 pl-2.5 pr-3.5 text-[14px] font-medium leading-[1.3] text-[#000B2C] transition-colors hover:border-[#1F65FF] hover:bg-[#F6F9FF]">
                  <span className="text-[13px] font-semibold text-[#1F65FF]">{s.n}</span>{s.chip}
                </a>
              ))}
            </nav>
          </Container>
          {/* the design lays steps 04-05 and 09-10 on a pale violet band, the others on white */}
          {GROUPS.map((g) => (
            <div key={g.from} className={`${g.tint ? "bg-[#F6F6FF]" : "bg-white"} py-10 sm:py-16`}>
              <Container className="flex flex-col gap-16 sm:gap-24">
                {STEPS.slice(g.from - 1, g.to).map((s) => <StepBlock key={s.n} s={s} />)}
              </Container>
            </div>
          ))}
        </section>

      </main>
      <Footer inner cta={{ title: "Ready to create your first event?", body: "Set up your event, upload your guests and send QR invitations in minutes. You only pay for the guests you invite.", primary: "Create Your First Event", note: "No credit card needed to start · No subscription" }} />
    </div>
  );
}

import { SiteElement, SiteText } from "@/components/cms/SiteElement";
import Image from "next/image";
import { homeContent, type HomeContent } from "@/components/cms/homeContent";
import { approvedLink } from "@/components/cms/approvedContent";
import Link from "next/link";
import { BLUE_GRADIENT } from "./BlueButton";
import Reveal from "./Reveal";
import { Container, Headline } from "./ui";

// Figma node 66:6767 — pricing. The rate shown is the design's example; the live rate is set by the platform admin.
const RATE = 3;
const GUESTS = 510;
const GST = 0.18;
const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const FEATURES = [
  "Unique QR invitation for every guest", "Delivery by email and WhatsApp", "Templates or your own design", "RSVP and food-preference collection",
  "Multiple sessions and access rules", "Staff accounts for your team", "Live check-in dashboard", "Full event report and downloads",
];
// the dashed squares drawn on the dark card (Figma 66:6853), positions inside a 324 x 407 box
const SQUARES: [number, number][] = [[160, 265], [241, 265], [241, 184], [161, 184], [81, 103], [81, 22], [0, -60], [242, 103], [81, -60]];

/** a picture that fills a box that is itself pushed out past its parent by `inset` (how the design places its soft glows and swooshes) */
function Bleed({ src, inset, className = "", style }: { src: string; inset: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`} style={style}>
      <SiteElement site="PricingLanding-1"><div className="absolute" style={{ inset }}><SiteElement site="PricingLanding-2"><Image src={src} alt="" fill unoptimized className="max-w-none object-fill" /></SiteElement></div></SiteElement>
    </div>
  );
}

const TRUST = [
  { icon: "/images/landing/price-lock.svg", label: "Secure payment" },
  { icon: "/images/landing/price-mail.svg", label: "Instant invoice by email" },
  { icon: "/images/landing/price-download.svg", label: "Statements any time" },
];

export default function PricingLanding({ heading, description, signupLabel, signupHref, contactLabel, contactHref, volumeHeading, volumeDescription }: HomeContent["PricingLanding"]) {
  const subtotal = GUESTS * RATE;
  const gst = subtotal * GST;
  return (
    <SiteElement site="PricingLanding-3"><section id="pricing" className="scroll-mt-[69px] bg-white py-14 sm:py-20">
      <Container className="flex flex-col items-center gap-10 sm:gap-14">
        <Reveal className="flex w-full flex-col items-center gap-4 text-center">
          <Headline className="max-w-[820px] text-[#000B2C]">{heading}</Headline>
          <SiteElement site="PricingLanding-4"><p className="max-w-[680px] text-[16px] leading-[1.6] text-[#4A5470] sm:text-[17px]">{description}</p></SiteElement>
        </Reveal>
        <SiteElement site="PricingLanding-5"><div className="flex w-full flex-col items-stretch justify-center gap-8 lg:flex-row lg:items-start">
          {/* the plan: a deep navy card with two soft glows and the dashed squares */}
          <Reveal variant="left" className="relative w-full overflow-hidden rounded-[19px] bg-[#000B2C] text-white lg:h-[580px] lg:w-[632px] lg:shrink-0">
            <Bleed src="/images/landing/price-glow-1.svg" inset="-109.51%" className="left-[335px] top-[25px] size-[347px]" />
            <Bleed src="/images/landing/price-glow-2.svg" inset="-109.51%" className="left-[-29px] top-[342px] size-[347px]" />
            <div aria-hidden className="pointer-events-none absolute bottom-[194px] left-[358px] hidden h-[407px] w-[324px] -scale-x-100 lg:block">
              {SQUARES.map(([x, y]) => <SiteElement site="PricingLanding-6" key={`${x}-${y}`} item={`${x}-${y}`}><span  className="absolute size-[82px] border border-dashed border-[#37456B]" style={{ left: x, top: y }} /></SiteElement>)}
            </div>
            <SiteElement site="PricingLanding-7"><div className="relative flex flex-col">
              <SiteElement site="PricingLanding-8"><div className="flex flex-col justify-between gap-6 px-6 py-7 sm:px-10 lg:h-[236px] lg:gap-0">
                <SiteElement site="PricingLanding-9"><p className="text-[17px] font-semibold text-[#8FB2FF]">Pay per invitee</p></SiteElement>
                <SiteElement site="PricingLanding-10"><div className="flex flex-col">
                  <SiteElement site="PricingLanding-11"><p className="font-[family-name:var(--font-inter)] text-[72px] font-bold leading-[0.9] sm:text-[84px]">₹{RATE}</p></SiteElement>
                  <SiteElement site="PricingLanding-12"><p className="text-[17px] text-[#A9B4CF]">per invitee + GST</p></SiteElement>
                </div></SiteElement>
                <SiteElement site="PricingLanding-13"><p className="text-[17px] font-semibold">One price, every feature included</p></SiteElement>
              </div></SiteElement>
              <SiteElement site="PricingLanding-14"><div className="flex flex-col gap-6 px-6 py-7 sm:px-10">
                <SiteElement site="PricingLanding-15"><ul className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
                  {FEATURES.map((f) => (
                    <SiteElement site="PricingLanding-16" key={f} item={f}><li  className="flex min-h-[44px] items-start gap-2.5 text-[15px] leading-snug text-[#E1E7F2]">
                      <SiteElement site="PricingLanding-18"><Image src="/images/landing/price-tick.svg" alt="" width={18} height={18} className="mt-0.5 shrink-0" /></SiteElement><SiteText site="PricingLanding-16-text-17">{f}</SiteText>
                    </li></SiteElement>
                  ))}
                </ul></SiteElement>
                <SiteElement site="PricingLanding-19"><Link href={approvedLink(signupHref, homeContent.PricingLanding.signupHref)} style={{ backgroundImage: BLUE_GRADIENT }} className="flex h-[50px] w-full items-center justify-center rounded-xl px-6 text-[16px] font-semibold text-white transition hover:brightness-110">{signupLabel}</Link></SiteElement>
              </div></SiteElement>
            </div></SiteElement>
          </Reveal>

          <Reveal variant="right" delay={120} className="flex w-full flex-col gap-5 lg:w-[440px] lg:shrink-0">
            {/* the worked example on a blue card with two soft swooshes (Figma 66:6940) */}
            <SiteElement site="PricingLanding-20"><div className="relative overflow-hidden rounded-[19px] bg-[#1F65FF] p-6 text-white lg:flex lg:h-[236px] lg:items-center lg:justify-center">
              <Bleed src="/images/landing/price-swoosh-1.svg" inset="-9.32% -15.23%" className="left-[-10.5px] top-[-4.5px] h-[214.5px] w-[131.289px]" />
              <Bleed src="/images/landing/price-swoosh-2.svg" inset="-8.47% -4.42%" className="left-[-4px] top-[88px] h-[236px] w-[452px]" />
              <SiteElement site="PricingLanding-21"><div className="relative flex w-full flex-col gap-[17px] lg:w-[413px]">
                <SiteElement site="PricingLanding-22"><p className="text-[17px] font-bold leading-[1.2]">Worked example: {GUESTS} guests</p></SiteElement>
                <dl className="flex flex-col gap-[13px] border-b border-white pb-5 text-[17px] font-medium">
                  <SiteElement site="PricingLanding-23"><div className="flex justify-between gap-4"><SiteElement site="PricingLanding-24"><dt>{GUESTS} guests × ₹{RATE}</dt></SiteElement><SiteElement site="PricingLanding-25"><dd>{inr(subtotal)}</dd></SiteElement></div></SiteElement>
                  <SiteElement site="PricingLanding-26"><div className="flex justify-between gap-4"><SiteElement site="PricingLanding-27"><dt>GST (18%)</dt></SiteElement><SiteElement site="PricingLanding-28"><dd>{inr(gst)}</dd></SiteElement></div></SiteElement>
                </dl>
                <SiteElement site="PricingLanding-29"><div className="flex justify-between gap-4 border-b border-white pb-5 text-[17px] font-bold"><SiteElement site="PricingLanding-30"><span>Total</span></SiteElement><SiteElement site="PricingLanding-31"><span>{inr(subtotal + gst)}</span></SiteElement></div></SiteElement>
              </div></SiteElement>
            </div></SiteElement>
            <SiteElement site="PricingLanding-32"><div className="flex flex-col items-start justify-center gap-3 rounded-[19px] border border-[#CDC4C4] px-6 py-7 sm:px-10">
              <SiteElement site="PricingLanding-33"><h3 className="text-[17px] font-bold text-[#000B2C]">{volumeHeading}</h3></SiteElement>
              <SiteElement site="PricingLanding-34"><p className="text-[17px] leading-[1.3] text-[#4A5470]">{volumeDescription}</p></SiteElement>
              <SiteElement site="PricingLanding-35"><Link href={approvedLink(contactHref, homeContent.PricingLanding.contactHref)} className="inline-flex items-center rounded-md border border-[#1F65FF] bg-white px-3.5 py-2 text-[17px] font-semibold text-[#1F65FF] transition-colors hover:bg-[#EAF1FF]">{contactLabel}</Link></SiteElement>
            </div></SiteElement>
            <SiteElement site="PricingLanding-36"><ul className="flex flex-wrap items-start justify-center gap-x-5 gap-y-2">
              {TRUST.map((t) => (
                <SiteElement site="PricingLanding-37" key={t.label} item={t.label}><li  className="flex items-center gap-1.5 text-[16px] text-[#4A5470] sm:text-[17px]">
                  <SiteElement site="PricingLanding-39"><Image src={t.icon} alt="" width={15} height={15} /></SiteElement><SiteText site="PricingLanding-37-text-38">{t.label}</SiteText>
                </li></SiteElement>
              ))}
            </ul></SiteElement>
          </Reveal>
        </div></SiteElement>
      </Container>
    </section></SiteElement>
  );
}

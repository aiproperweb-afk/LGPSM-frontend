import Image from "next/image";
import Link from "next/link";
import FinalCta, { type CtaCopy } from "@/components/landing/FinalCta";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/constants/site";

// Landing footer (Figma node 278:1041, the updated footer): brand and blurb on the left, four link groups, then the copyright line with the
// legal links on the right. Every link goes to a section of the landing page or an existing page; labels that have no page of their own yet
// (Help centre, Blog, About, Careers and the three legal pages) lead to the Contact page until those pages exist.
const GROUPS = [
  { title: "Product", links: [["Features", "/features"], ["How it works", "/how-it-works"], ["Pricing", "/#pricing"], ["Templates", "/#features"], ["Custom card design", "/contact"]] },
  { title: "Use cases", links: [["Weddings", "/clients/wedding-pre-wedding"], ["Birthdays", "/clients/personal-family"], ["Corporate events", "/clients/business-corporate"], ["Conferences", "/clients/business-corporate"], ["Expos and fests", "/clients/festivals-culture"], ["Agencies", "/contact"]] },
  { title: "Resources", links: [["Help centre", "/contact"], ["Sample Excel guest list", "/#features"], ["FAQ", "/#faq"], ["Blog", "/contact"]] },
  { title: "Company", links: [["About", "/contact"], ["Contact", "/contact"], ["Careers", "/contact"]] },
] as const;

// The footer's own background (Figma 278:1007): deep navy, a soft blue glow behind the call to action, and dashed squares at both sides
const LEFT_SQUARES: [number, number][] = [[160, 325], [241, 325], [241, 244], [161, 244], [81, 163], [81, 82], [0, 0], [242, 163], [81, 0]];
const RIGHT_SQUARES: [number, number][] = [[327, 0], [245, 0], [82, 325], [163, 243], [164, 162], [325, 325], [407, 407], [406, 243], [0, 243], [163, 325], [244, 243], [245, 162], [164, 81], [81, 243], [244, 325], [325, 243], [326, 162], [245, 81]];
function Squares({ list, className }: { list: [number, number][]; className: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute hidden lg:block ${className}`}>
      {list.map(([x, y]) => <span key={`${x}-${y}`} className="absolute size-[82px] border-[0.75px] border-dashed border-[#2B3652]" style={{ left: x, top: y }} />)}
    </div>
  );
}

// The other pages (Clients, How it works, Features) use the design's longer footer: a Legal group under Product, and the contact details in the
// bottom bar instead of the two legal links. (The design's phone number is a placeholder, so a number shows only when one is configured.)
const LEGAL = [["Terms and conditions", "/contact"], ["Privacy policy", "/contact"], ["Refund policy", "/contact"]] as const;

export default function Footer({ withCta = true, cta, inner = false }: { withCta?: boolean; cta?: CtaCopy; inner?: boolean }) {
  return (
    <div className="relative overflow-hidden border-b border-[#081E61] bg-[#000B2C]">
      {withCta ? (
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-64px] h-[456px] w-[1061px] -translate-x-1/2">
          <div className="absolute" style={{ inset: "-32.89% -14.14%" }}><Image src="/images/landing/footer-glow.svg" alt="" fill unoptimized className="max-w-none object-fill" /></div>
        </div>
      ) : null}
      <Squares list={LEFT_SQUARES} className="bottom-[-69px] left-2 h-[407px] w-[324px]" />
      <Squares list={RIGHT_SQUARES} className="right-0 top-[129px] size-[489px]" />
      {withCta ? <FinalCta copy={cta} /> : null}
      <footer className="relative text-[#A9B4CF]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[30px] px-4 pb-8 pt-[72px] sm:px-6 lg:px-12">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
            <div className="flex w-full flex-col gap-4 lg:w-[304px] lg:shrink-0">
              <Link href="/" aria-label="EventQRapp home" className="self-start">
                <Image src="/images/branding/eventqrapp-logo-light.svg" alt="EventQRapp" width={202} height={36} className="h-9 w-auto" />
              </Link>
              <p className="max-w-[280px] text-[15px] leading-[1.35]">EventQRApp helps you create elegant digital invitations with QR codes, RSVP tracking, guest management, and instant sharing. Perfect for weddings, birthdays, corporate events, and special occasions.</p>
            </div>
            <div className="grid flex-1 grid-cols-2 content-start gap-x-6 gap-y-[30px] text-[14px] sm:grid-cols-3 lg:flex lg:flex-wrap lg:gap-[30px]">
              {GROUPS.map((g) => (
                <nav key={g.title} aria-label={g.title} className="flex flex-col gap-3 lg:w-[164px]">
                  <h2 className="font-semibold text-white">{g.title}</h2>
                  <ul className="flex flex-col gap-3">
                    {g.links.map(([label, href]) => (
                      <li key={label}><Link href={href} className="leading-[19.6px] transition-colors hover:text-white">{label}</Link></li>
                    ))}
                  </ul>
                  {inner && g.title === "Product" ? (
                    <>
                      <h2 className="mt-[18px] font-semibold text-white">Legal</h2>
                      <ul className="flex flex-col gap-3">
                        {LEGAL.map(([label, href]) => <li key={label}><Link href={href} className="leading-[19.6px] transition-colors hover:text-white">{label}</Link></li>)}
                      </ul>
                    </>
                  ) : null}
                </nav>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-[#1E2B52] pt-6 text-[14px] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} EventQRapp. All rights reserved.</p>
            {inner ? (
              <p className="flex items-center gap-x-2">
                <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-white">{CONTACT_EMAIL}</a>
                {CONTACT_PHONE ? <><span aria-hidden>|</span><a href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`} className="transition-colors hover:text-white">{CONTACT_PHONE}</a></> : null}
              </p>
            ) : (
              <p className="flex items-center gap-x-2">
                <Link href="/contact" className="transition-colors hover:text-white">Terms &amp; condition</Link>
                <span aria-hidden>|</span>
                <Link href="/contact" className="transition-colors hover:text-white">Privacy policy</Link>
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

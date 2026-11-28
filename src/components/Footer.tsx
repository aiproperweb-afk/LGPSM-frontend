"use client";
import { SiteElement } from "@/components/cms/SiteElement";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import VisualRenderer from "@/components/cms/VisualRenderer";
import { useSiteChrome } from "@/components/cms/useSiteChromeCopy";
import { footerCtas, footerGroups as GROUPS, footerLegal as LEGAL, footerGroupKey, type FooterCtaVariant } from "@/components/cms/siteChromeContent";
import FinalCta from "@/components/landing/FinalCta";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/constants/site";

// Landing footer (Figma node 278:1041, the updated footer): brand and blurb on the left, four link groups, then the copyright line with the
// legal links on the right. Every link goes to a section of the landing page or an existing page; labels that have no page of their own yet
// (Help centre, Blog, About, Careers and the three legal pages) lead to the Contact page until those pages exist.

// The footer's own background (Figma 278:1007): deep navy, a soft blue glow behind the call to action, and dashed squares at both sides
const LEFT_SQUARES: [number, number][] = [[160, 325], [241, 325], [241, 244], [161, 244], [81, 163], [81, 82], [0, 0], [242, 163], [81, 0]];
const RIGHT_SQUARES: [number, number][] = [[327, 0], [245, 0], [82, 325], [163, 243], [164, 162], [325, 325], [407, 407], [406, 243], [0, 243], [163, 325], [244, 243], [245, 162], [164, 81], [81, 243], [244, 325], [325, 243], [326, 162], [245, 81]];
function Squares({ list, className }: { list: [number, number][]; className: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute hidden lg:block ${className}`}>
      {list.map(([x, y]) => <SiteElement site="Footer-1" key={`${x}-${y}`} item={`${x}-${y}`}><span  className="absolute size-[82px] border-[0.75px] border-dashed border-[#2B3652]" style={{ left: x, top: y }} /></SiteElement>)}
    </div>
  );
}

// The other pages (Clients, How it works, Features) use the design's longer footer: a Legal group under Product, and the contact details in the
// bottom bar instead of the two legal links. (The design's phone number is a placeholder, so a number shows only when one is configured.)

export default function Footer({ withCta = true, ctaVariant = "home", inner = false, visualLabels, branding }: { withCta?: boolean; ctaVariant?: FooterCtaVariant; inner?: boolean; visualLabels?: Record<string, string>; branding?: ReactNode }) {
  const { text, visual } = useSiteChrome("footer", visualLabels);
  if (visual) return <VisualRenderer data={visual} slug="footer" renderChrome={(labels, contents) => <Footer withCta={withCta} ctaVariant={ctaVariant} inner={inner} visualLabels={labels} branding={contents} />} />;
  const original = footerCtas[ctaVariant];
  const cta = {
    title: text(ctaVariant + "_cta_title", original.title),
    body: text(ctaVariant + "_cta_body", original.body),
    primary: text(ctaVariant + "_cta_primary", original.primary),
    note: text(ctaVariant + "_cta_note", original.note),
  };
  return (
    <SiteElement site="Footer-2"><div id="footer" className="relative overflow-hidden border-b border-[#081E61] bg-[#000B2C]">
      {withCta ? (
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-64px] h-[456px] w-[1061px] -translate-x-1/2">
          <SiteElement site="Footer-3"><div className="absolute" style={{ inset: "-32.89% -14.14%" }}><SiteElement site="Footer-4"><Image src="/images/landing/footer-glow.svg" alt="" fill unoptimized className="max-w-none object-fill" /></SiteElement></div></SiteElement>
        </div>
      ) : null}
      <Squares list={LEFT_SQUARES} className="bottom-[-69px] left-2 h-[407px] w-[324px]" />
      <Squares list={RIGHT_SQUARES} className="right-0 top-[129px] size-[489px]" />
      {withCta ? <FinalCta copy={cta} demoLabel={text("bookDemo", "Book a demo")} /> : null}
      <SiteElement site="Footer-5"><footer className="relative text-[#A9B4CF]">
        <SiteElement site="Footer-6"><div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[30px] px-4 pb-8 pt-[72px] sm:px-6 lg:px-12">
          <SiteElement site="Footer-7"><div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
            <SiteElement site="Footer-8"><div className="flex w-full flex-col gap-4 lg:w-[304px] lg:shrink-0">
              {branding ?? <>
              <SiteElement site="Footer-9"><Link href="/" aria-label={text("logoLinkLabel", "EventQRapp home")} className="self-start">
                <SiteElement site="Footer-10"><Image src="/images/branding/eventqrapp-logo-light.svg" alt="EventQRapp" width={202} height={36} className="h-9 w-auto" /></SiteElement>
              </Link></SiteElement>
              <SiteElement site="Footer-11"><p className="max-w-[280px] text-[15px] leading-[1.35]">{text("description", "EventQRApp helps you create elegant digital invitations with QR codes, RSVP tracking, guest management, and instant sharing. Perfect for weddings, birthdays, corporate events, and special occasions.")}</p></SiteElement>
              </>}
            </div></SiteElement>
            <SiteElement site="Footer-12"><div className="grid flex-1 grid-cols-2 content-start gap-x-6 gap-y-[30px] text-[14px] sm:grid-cols-3 lg:flex lg:flex-wrap lg:gap-[30px]">
              {GROUPS.map((g) => (
                <SiteElement site="Footer-13" key={g.title} item={g.title}><nav  aria-label={text(footerGroupKey(g.title) + "_heading", g.title)} className="flex flex-col gap-3 lg:w-[164px]">
                  <SiteElement site="Footer-14"><h2 className="font-semibold text-white">{text(footerGroupKey(g.title) + "_heading", g.title)}</h2></SiteElement>
                  <SiteElement site="Footer-15"><ul className="flex flex-col gap-3">
                    {g.links.map(([label, href], index) => (
                      <SiteElement site="Footer-16" key={label} item={label}><li ><SiteElement site="Footer-17"><Link href={href} className="leading-[19.6px] transition-colors hover:text-white">{text(footerGroupKey(g.title) + "_link_" + (index + 1), label)}</Link></SiteElement></li></SiteElement>
                    ))}
                  </ul></SiteElement>
                  {inner && g.title === "Product" ? (
                    <>
                      <SiteElement site="Footer-18"><h2 className="mt-[18px] font-semibold text-white">{text("legalHeading", "Legal")}</h2></SiteElement>
                      <SiteElement site="Footer-19"><ul className="flex flex-col gap-3">
                        {LEGAL.map(([label, href], index) => <SiteElement site="Footer-20" key={label} item={label}><li ><SiteElement site="Footer-21"><Link href={href} className="leading-[19.6px] transition-colors hover:text-white">{text("legal_link_" + (index + 1), label)}</Link></SiteElement></li></SiteElement>)}
                      </ul></SiteElement>
                    </>
                  ) : null}
                </nav></SiteElement>
              ))}
            </div></SiteElement>
          </div></SiteElement>
          <SiteElement site="Footer-22"><div className="flex flex-col gap-2 border-t border-[#1E2B52] pt-6 text-[14px] sm:flex-row sm:items-center sm:justify-between">
            <SiteElement site="Footer-23"><p>© {new Date().getFullYear()} {text("copyright", "EventQRapp. All rights reserved.")}</p></SiteElement>
            {inner ? (
              <SiteElement site="Footer-24"><p className="flex items-center gap-x-2">
                <SiteElement site="Footer-25"><a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-white">{CONTACT_EMAIL}</a></SiteElement>
                {CONTACT_PHONE ? <><span aria-hidden>|</span><SiteElement site="Footer-26"><a href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`} className="transition-colors hover:text-white">{CONTACT_PHONE}</a></SiteElement></> : null}
              </p></SiteElement>
            ) : (
              <SiteElement site="Footer-27"><p className="flex items-center gap-x-2">
                <SiteElement site="Footer-28"><Link href="/contact" className="transition-colors hover:text-white">{text("homeTerms", "Terms & condition")}</Link></SiteElement>
                <span aria-hidden>|</span>
                <SiteElement site="Footer-29"><Link href="/contact" className="transition-colors hover:text-white">{text("homePrivacy", "Privacy policy")}</Link></SiteElement>
              </p></SiteElement>
            )}
          </div></SiteElement>
        </div></SiteElement>
      </footer></SiteElement>
    </div></SiteElement>
  );
}

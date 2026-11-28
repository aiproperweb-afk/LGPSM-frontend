import { SiteElement } from "@/components/cms/SiteElement";
import { homeContent, type HomeContent } from "@/components/cms/homeContent";
import { approvedLink, resolveCmsImage } from "@/components/cms/approvedContent";
import type React from "react";
import Image from "next/image";
import { OutlineLink, PrimaryLink } from "@/components/landing/BlueButton";

// Landing hero (Figma "EventQRapp — Landing Page-Ver2", node 66:119)
export default function HeroSection({ badge, heading, description, note, primaryLabel, primaryHref, secondaryLabel, secondaryHref, image, imageAlt, visualHero }: HomeContent["HeroSection"] & { visualHero?: React.ReactNode }) {
  return (
    <SiteElement site="HeroSection-1"><section id="home" className="scroll-mt-[69px] relative w-full overflow-hidden bg-[#F6F6FF]">
      {/* faint grid lines behind the headline */}
      <Image src="/images/landing/hero-lines.svg" alt="" aria-hidden width={1633} height={681} unoptimized className="pointer-events-none absolute left-[-67px] top-[186px] hidden max-w-none lg:block" />

      {visualHero ?? (
      <SiteElement site="HeroSection-2"><div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-10 px-4 pt-10 sm:px-6 lg:px-12">
        <SiteElement site="HeroSection-3"><div className="flex w-full flex-col items-center gap-6 text-center">
          <SiteElement site="HeroSection-4"><div className="hero-anim inline-flex items-center gap-2 rounded-full border border-[#E1E7F2] bg-white py-[7px] pl-2 pr-3.5" style={{ "--d": "0ms" } as React.CSSProperties}>
            <SiteElement site="HeroSection-5"><span className="flex size-[22px] items-center justify-center rounded-full bg-[#EAF1FF]">
              <SiteElement site="HeroSection-6"><Image src="/images/landing/hero-badge-icon.svg" alt="" width={13} height={13} /></SiteElement>
            </span></SiteElement>
            <SiteElement site="HeroSection-7"><span className="text-[13px] sm:text-[15px] text-[#4A5470]">{badge}</span></SiteElement>
          </div></SiteElement>

          <SiteElement site="HeroSection-8"><h1 style={{ "--d": "110ms" } as React.CSSProperties} className="hero-anim font-[family-name:var(--font-dm-sans)] text-[34px] leading-[40px] tracking-[-1px] text-[#000B2C] sm:text-[46px] sm:leading-[52px] lg:text-[58px] lg:leading-[64px] lg:tracking-[-2.24px]">{heading}</h1></SiteElement>

          <SiteElement site="HeroSection-9"><p style={{ "--d": "220ms" } as React.CSSProperties} className="hero-anim max-w-[1100px] text-[15px] leading-relaxed text-[#4A5470] sm:text-[17px] lg:px-10">{description}</p></SiteElement>

          <SiteElement site="HeroSection-10"><div style={{ "--d": "330ms" } as React.CSSProperties} className="hero-anim flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <PrimaryLink href={approvedLink(primaryHref, homeContent.HeroSection.primaryHref)}>{primaryLabel}</PrimaryLink>
            <OutlineLink href={approvedLink(secondaryHref, homeContent.HeroSection.secondaryHref)}>
              {secondaryLabel}
              <SiteElement site="HeroSection-11"><Image src="/images/landing/play-circle.svg" alt="" width={24} height={24} /></SiteElement>
            </OutlineLink>
          </div></SiteElement>

          <SiteElement site="HeroSection-12"><p style={{ "--d": "410ms" } as React.CSSProperties} className="hero-anim text-[15px] text-[#4A5470]">{note}</p></SiteElement>
        </div></SiteElement>

        {/* product shot on a blue stage */}
        <SiteElement site="HeroSection-13"><div style={{ "--d": "480ms" } as React.CSSProperties} className="hero-anim hero-anim-stage relative h-[230px] w-full overflow-hidden rounded-t-[20px] bg-[#1F65FF] sm:h-[400px] lg:h-[593px]">
          <Image src="/images/landing/hero-wave-1.svg" alt="" aria-hidden width={470} height={693} unoptimized className="pointer-events-none absolute left-[-8px] top-[-190px] max-w-none opacity-80" />
          <Image src="/images/landing/hero-wave-2.svg" alt="" aria-hidden width={1240} height={650} unoptimized className="pointer-events-none absolute left-[-47px] top-[-40px] hidden max-w-none lg:block" />
          <SiteElement site="HeroSection-14"><div className="absolute left-1/2 top-[6%] aspect-[964/575] w-[88%] max-w-[964px] -translate-x-1/2 overflow-hidden rounded-t-md">
            <SiteElement site="HeroSection-15"><Image src={resolveCmsImage(image) ?? homeContent.HeroSection.image} alt={imageAlt} unoptimized={image !== homeContent.HeroSection.image} width={1440} height={859} priority sizes="(max-width: 1024px) 88vw, 964px" className="w-full h-auto" /></SiteElement>
          </div></SiteElement>
        </div></SiteElement>
      </div></SiteElement>
      )}
    </section></SiteElement>
  );
}

import { SiteElement } from "@/components/cms/SiteElement";
import Image from "next/image";
import type { ReactNode } from "react";

// Shared pieces of the landing page (EventQRapp brand design)
export const INK = "#000B2C";
export const BODY = "#4A5470";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <SiteElement site="ui-1"><div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-12 ${className}`}>{children}</div></SiteElement>;
}

/** Headline in DM Sans, as every section of the design uses */
export function Headline({ children, className = "", as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <Tag className={`font-[family-name:var(--font-dm-sans)] text-[32px] leading-[1.1] tracking-[-0.9px] sm:text-[40px] lg:text-[48px] ${className}`}>
      {children}
    </Tag>
  );
}

/** `wide`: the heading and its line below take the full width of the page column (one line each on a large screen), as the problem section of the design does */
export function SectionHeading({ title, subtitle, dark = false, wide = false, className = "" }: { title: string; subtitle?: string; dark?: boolean; wide?: boolean; className?: string }) {
  return (
    <SiteElement site="ui-2"><div className={`mx-auto flex ${wide ? "max-w-[1104px]" : "max-w-[900px]"} flex-col items-center gap-4 text-center ${className}`}>
      <Headline className={`${dark ? "text-white" : "text-[#000B2C]"} ${wide ? "lg:whitespace-nowrap" : ""}`}>{title}</Headline>
      {subtitle ? <SiteElement site="ui-3"><p className={`${wide ? "max-w-none" : "max-w-[640px]"} text-[16px] leading-[1.6] sm:text-[17px] ${dark ? "text-[#C3CCE6]" : "text-[#4A5470]"}`}>{subtitle}</p></SiteElement> : null}
    </div></SiteElement>
  );
}

export function Tick({ className = "" }: { className?: string }) {
  return <SiteElement site="ui-4"><Image src="/images/landing/tick.svg" alt="" width={20} height={20} className={`shrink-0 ${className}`} /></SiteElement>;
}

export function CheckList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <SiteElement site="ui-5"><ul className={`flex flex-col gap-3 ${className}`}>
      {items.map((t) => (
        <SiteElement site="ui-6" key={t} item={t}><li  className="flex items-start gap-3 text-[16px] leading-[1.5] text-[#4A5470] sm:text-[17px]">
          <Tick className="mt-0.5" />
          <SiteElement site="ui-7"><span>{t}</span></SiteElement>
        </li></SiteElement>
      ))}
    </ul></SiteElement>
  );
}

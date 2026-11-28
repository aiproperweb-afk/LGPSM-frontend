"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSiteChrome, type SiteChromeText } from "@/components/cms/useSiteChromeCopy";
import { navbarLinks as LINKS } from "@/components/cms/siteChromeContent";
import { CLIENT_CATEGORIES } from "@/constants/clients";

// Landing page navigation (EventQRapp brand design, Figma 238:29276): Features, How it works and Contact have their own pages; Clients opens a menu of
// the seven client categories, each with its own page.

// The sections in the order they appear down the home page (the menu order differs)
const SECTION_ORDER = ["clients", "how-it-works", "features", "pricing", "faq"];

// On the home page the link of the section being read is the current one; on its own page (Features, Pricing) that page's link is.
function useCurrentSection(): string {
  const pathname = usePathname();
  const [section, setSection] = useState("");
  useEffect(() => {
    if (pathname !== "/") return;
    let frame = 0;
    const update = () => {
      frame = 0;
      // the last section whose top has passed just under the sticky bar; above the first one (the hero) nothing is current
      let current = "";
      for (const id of SECTION_ORDER) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setSection(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [pathname]);
  if (pathname === "/") return section;
  return LINKS.find((l) => l.page && pathname.startsWith(l.page))?.section ?? "";
}

/** "Clients" with its dropdown arrow: opens the menu of the seven client categories (hover, click or keyboard) */
function ClientsMenu({ className, underline, pathname, text }: { className: string; underline: React.ReactNode; pathname: string; text: SiteChromeText }) {
  const [open, setOpen] = useState(false);
  const box = React.useRef<HTMLDivElement>(null);
  // the panel hangs from the bottom edge of the bar, a few pixels below the button, so closing waits a moment: the pointer can cross that gap
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setOpen(true); };
  const hide = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(false), 220); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div ref={box} onMouseEnter={show} onMouseLeave={hide}>
      <button type="button" data-cms-preview-toggle aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={`${className} inline-flex items-center gap-1.5 cursor-pointer`}>
        {text("link_clients", "Clients")}
        <svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="M2.5 7.5L6 11l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {underline}
      </button>
      {open && (
        <div role="menu" className="absolute left-1/2 top-full z-50 w-[728px] max-w-[calc(100vw-32px)] -translate-x-1/2 pt-px">
          <div className="rounded-b-[20px] border border-[#E1EAF8] bg-white p-7 pb-0 shadow-[0_24px_48px_-12px_rgba(0,11,44,0.18)]">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {CLIENT_CATEGORIES.map((c) => {
                const here = pathname === `/clients/${c.slug}`;
                return (
                  <Link key={c.slug} href={`/clients/${c.slug}`} role="menuitem" onClick={() => setOpen(false)} aria-current={here ? "page" : undefined} className={`flex items-start gap-3.5 rounded-xl p-3 transition-colors hover:bg-[#F0F4FF] ${here ? "bg-[#F0F4FF]" : ""}`}>
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] ${here ? "bg-white shadow-sm" : "bg-[#EAF1FF]"}`}><Image src={c.icon} alt="" width={24} height={24} /></span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[16px] font-medium leading-[1.3] text-[#000B2C]">{text("client_" + c.slug + "_name", c.name)}</span>
                      <span className="text-[13px] leading-[1.45] text-[#4A5470]">{text("client_" + c.slug + "_description", c.menu)}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#E6EBF5] px-3 py-4 text-[14px]">
              <span className="text-[#4A5470]">{text("clientMenuPrompt", "Not sure which fits your event?")}</span>
              <Link href="/contact" onClick={() => setOpen(false)} className="font-semibold text-[#1F65FF] hover:underline">{text("scheduleMeeting", "Schedule a meeting")}</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import VisualRenderer from "@/components/cms/VisualRenderer";

const BLUE_GRADIENT = "linear-gradient(180deg, #1F65FF 0%, #2071FF 33%, #2181FF 69%, #1F65FF 100%)";

export default function Navbar({ visualLabels, branding }: { visualLabels?: Record<string, string>; branding?: ReactNode } = {}) {
  const { text, visual } = useSiteChrome("navbar", visualLabels);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const current = useCurrentSection();
  const pathname = usePathname();

  if (visual) return <div className="sticky top-0 z-50"><VisualRenderer data={visual} slug="navbar" renderChrome={(labels, contents) => <Navbar visualLabels={labels} branding={contents} />} /></div>;

  return (
    <header id="navbar" className="hero-anim hero-anim-nav w-full sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#E1EAF8]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-3 flex items-center justify-between gap-6">
        {branding ?? <Link href="/" className="flex items-center shrink-0" aria-label={text("logoLinkLabel", "EventQRapp home")}>
          <Image src="/images/branding/Final-Logo.svg" alt="EventQRapp" width={183} height={32} priority className="h-8 w-auto" />
        </Link>}

        <nav aria-label={text("navigationLabel", "Main")} className="hidden lg:flex items-center gap-[30px]">
          {LINKS.map((l) => {
            const inMenu = "menu" in l && l.menu;
            const on = inMenu ? current === l.section || pathname.startsWith("/clients") : current === l.section;
            const cls = `relative py-1 text-[15px] font-medium transition-colors ${on ? "text-[#1F65FF]" : "text-[#4A5470] hover:text-[#1F65FF]"}`;
            // the underline marks where you are, so it is clear even when the pointer is elsewhere
            const underline = <span aria-hidden className={`absolute inset-x-0 -bottom-[13px] h-[2px] rounded-full bg-[#1F65FF] transition-opacity duration-200 ${on ? "opacity-100" : "opacity-0"}`} />;
            if (inMenu) return <ClientsMenu key={l.section} className={cls} underline={underline} pathname={pathname} text={text} />;
            return (
              <Link key={l.section} href={l.href} aria-current={on ? "true" : undefined} className={cls}>
                {text("link_" + l.section, l.label)}
                {underline}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link href="/signin?mode=organizer" className="px-3.5 py-3 text-[15px] font-semibold text-[#000B2C] hover:text-[#1F65FF] transition-colors">
            {text("desktopSignIn", "Log in")}
          </Link>
          <Link
            href="/signup"
            style={{ backgroundImage: BLUE_GRADIENT }}
            className="h-11 px-6 inline-flex items-center justify-center rounded-xl text-[15px] font-semibold text-white hover:brightness-95 active:scale-[0.98] transition"
          >
            {text("createEvent", "Start your first event")}
          </Link>
        </div>

        <button
          data-cms-preview-toggle
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={text("toggleMenuLabel", "Toggle navigation menu")}
          aria-expanded={mobileMenuOpen}
          className="lg:hidden p-2 text-[#4A5470] focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E1EAF8] px-4 pt-3 pb-6 space-y-1">
          {[LINKS[0], LINKS[1]].map((l) => (
            <Link key={l.section} href={l.href} onClick={() => setMobileMenuOpen(false)} aria-current={current === l.section ? "true" : undefined} className={`block py-2.5 text-[15px] font-medium ${current === l.section ? "text-[#1F65FF]" : "text-[#4A5470]"}`}>
              {text("link_" + l.section, l.label)}
            </Link>
          ))}
          <details className="group" open={pathname.startsWith("/clients")}>
            <summary className={`flex cursor-pointer list-none items-center justify-between py-2.5 text-[15px] font-medium ${pathname.startsWith("/clients") ? "text-[#1F65FF]" : "text-[#4A5470]"}`}>
              {text("link_clients", "Clients")}
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden className="transition-transform group-open:rotate-180"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <div className="flex flex-col gap-1 pb-2 pl-1">
              {CLIENT_CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/clients/${c.slug}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg py-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF1FF]"><Image src={c.icon} alt="" width={22} height={22} /></span>
                  <span className="text-[14px] font-medium text-[#000B2C]">{text("client_" + c.slug + "_name", c.name)}</span>
                </Link>
              ))}
            </div>
          </details>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} aria-current={current === "contact" ? "true" : undefined} className={`block py-2.5 text-[15px] font-medium ${current === "contact" ? "text-[#1F65FF]" : "text-[#4A5470]"}`}>{text("link_contact", "Contact")}</Link>
          <div className="pt-3 flex flex-col gap-2 border-t border-[#E1EAF8]">
            <Link href="/signin?mode=organizer" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 text-[15px] font-semibold text-[#000B2C] border border-[#E1EAF8] rounded-xl hover:bg-[#EAF1FF] transition-colors">{text("organizerSignIn", "Organizer log in")}</Link>
            <Link href="/signin?mode=admin" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 text-[15px] font-semibold text-[#000B2C] border border-[#E1EAF8] rounded-xl hover:bg-[#EAF1FF] transition-colors">{text("adminSignIn", "Super Admin log in")}</Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)} style={{ backgroundImage: BLUE_GRADIENT }} className="w-full block text-center py-3 text-[15px] font-semibold text-white rounded-xl">{text("createEvent", "Start your first event")}</Link>
          </div>
        </div>
      )}
    </header>
  );
}

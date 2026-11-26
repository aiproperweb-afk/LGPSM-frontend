"use client";

import React, { useEffect, useRef } from "react";
import PopupMessage from "@/components/common/PopupMessage";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";

// Auth screens (Figma "Login", "Register" and "Account recovery", node 3354:227 onwards): a white 456px card centred on a navy page
// with a blue glow at the top right and a purple one at the bottom left.
const ASSETS = "/images/auth/signin";

/** `corner` sits at the top right of the page (the way to the other portal); `below` is the small print under the card. */
export function AuthPage({ children, corner, below }: { children: React.ReactNode; corner?: React.ReactNode; below?: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    // The card slides up as it appears (clearProps: no transform is left behind to trap fixed popups inside the card)
    gsap.fromTo(cardRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power2.out", clearProps: "transform,opacity" });
  }, []);

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#000B2C] font-[family-name:var(--font-inter)] text-[#000B2C]">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG glow */}
      <img src={`${ASSETS}/blur-purple.svg`} alt="" aria-hidden width={1418} height={1418} className="pointer-events-none absolute -z-10 -left-[602px] -bottom-[602px] max-w-none" />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG glow */}
      <img src={`${ASSETS}/blur-blue.svg`} alt="" aria-hidden width={1418} height={1418} className="pointer-events-none absolute -z-10 -right-[602px] -top-[602px] max-w-none" />
      {corner && <div className="flex justify-end px-4 pt-4 sm:absolute sm:right-8 sm:top-6 sm:p-0">{corner}</div>}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-6 pt-6 sm:pt-16">
        <div ref={cardRef} className="flex w-full max-w-[456px] flex-col gap-6 rounded-2xl bg-white p-6 shadow-[0px_24px_48px_0px_rgba(0,0,0,0.35)] sm:p-10">
          {children}
        </div>
        {below && <div className="mt-6 w-full max-w-[456px] text-center text-xs font-medium leading-[18px] text-white/70">{below}</div>}
      </main>
      <footer className="px-4 pb-8 pt-2 text-center text-xs font-medium text-white/60">© {new Date().getFullYear()} EventQRApp. All rights reserved.</footer>
    </div>
  );
}

/** The link in the page's top right corner (to the Super Admin sign-in, or back to the organizer one) */
export function AuthCornerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center rounded-lg border border-white/35 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white">
      {children}
    </Link>
  );
}

export function AuthLogo() {
  return (
    <Link href="/" className="inline-block">
      <Image src={`${ASSETS}/logo.svg`} alt="EventQRapp" width={216} height={38} priority fetchPriority="high" unoptimized />
    </Link>
  );
}

export function AuthHeader({ title, prompt }: { title: string; prompt?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <AuthLogo />
      <h1 className="mt-[48px] text-[28px] font-semibold leading-[1.22] sm:text-[32px]">{title}</h1>
      {prompt && <p className="mt-2 text-sm font-medium text-[#666D80]">{prompt}</p>}
    </div>
  );
}

export const authLinkClass = "font-semibold text-[#1F65FF] hover:text-[#1A56DB] hover:underline cursor-pointer";

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-[#666D80]" aria-hidden>
      <span className="h-px flex-1 bg-[#E0E0E0]" />or<span className="h-px flex-1 bg-[#E0E0E0]" />
    </div>
  );
}

/** "← Back to …" under a recovery or verification card */
export function AuthBackLink({ href, label, onClick }: { href?: string; label: string; onClick?: () => void }) {
  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static icon */}
      <img src={`${ASSETS}/arrow-left.svg`} alt="" width={16} height={16} />
      {label}
    </>
  );
  const cls = `inline-flex items-center gap-1.5 self-center text-sm ${authLinkClass}`;
  return onClick ? <button type="button" onClick={onClick} className={cls}>{inner}</button> : <Link href={href || "/signin"} className={cls}>{inner}</Link>;
}

// Server-rendered placeholder for auth pages whose body reads the URL query on the client. Without it
// the HTML is blank until JavaScript loads, so the brand logo (the LCP element) now paints immediately.
export function AuthLoadingShell() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#000B2C] px-4">
      <div className="flex w-full max-w-[456px] justify-center rounded-2xl bg-white p-10">
        <AuthLogo />
      </div>
    </div>
  );
}

export function AuthAlert({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  // shown as a popup so it is never missed; plain text messages only
  const text = typeof children === "string" ? children : React.Children.toArray(children).filter((c) => typeof c === "string" || typeof c === "number").join("");
  return <PopupMessage message={text || null} type={tone} />;
}

export const authInputClass =
  "w-full h-[47px] px-4 bg-white border border-[#E0E0E0] rounded-md text-sm font-medium text-[#000B2C] placeholder:text-[#898B8D] focus:outline-none focus:border-[#1F65FF] focus:ring-[3px] focus:ring-[#1F65FF]/[0.18] transition-colors disabled:opacity-60";

export const authLabelClass = "block text-sm font-medium text-[#000B2C] mb-2";

export const authPrimaryButtonClass =
  "w-full h-12 bg-[#1F65FF] hover:bg-[#1A56DB] text-white text-base font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2";

export const Required = () => <span className="text-[#D92D20]">*</span>;

export function PasswordInput({
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
  id,
  hiddenIcon = "eye-off",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  autoComplete?: string;
  id?: string;
  /** the icon shown while the password is hidden */
  hiddenIcon?: "eye" | "eye-off";
}) {
  const [visible, setVisible] = React.useState(false);
  const shownIcon = hiddenIcon === "eye" ? "eye-off" : "eye";
  return (
    <div className="relative flex items-center">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${authInputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-3 flex p-1 cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static icon */}
        <img src={`${ASSETS}/${visible ? shownIcon : hiddenIcon}.svg`} alt="" width={20} height={20} />
      </button>
    </div>
  );
}

export function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

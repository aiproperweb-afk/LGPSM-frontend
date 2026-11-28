"use client";
import { SiteElement } from "@/components/cms/SiteElement";

import { useEffect, useRef, useState } from "react";
import PhoneInput from "@/components/common/PhoneInput";
import { Container } from "@/components/landing/ui";
import { contactService } from "@/services/contactService";
import { CONTACT_ENQUIRY_EMAIL } from "@/constants/site";
import { EMPTY_CONTACT_FORM, hasErrors, validateContactForm, type ContactField, type ContactFieldErrors } from "@/utils/contactForm";
import ClientBackdrop from "./ClientBackdrop";

// The enquiry form of a Clients page (Figma 238:28731). It goes through the same public contact API as the Contact page: the backend takes
// name, email, phone and a message, so the company, event type and guest count are written at the top of the message the team receives.
const DM = "font-[family-name:var(--font-dm-sans)]";
const BLUE_GRADIENT = "linear-gradient(180deg, #1F65FF 0%, #2071FF 33%, #2181FF 69%, #1F65FF 100%)";
const FIELD = "h-12 w-full rounded-[10px] border border-[#D9E1EF] bg-white px-3.5 text-[15px] text-[#000B2C] placeholder:text-[#9AA3B8] focus:border-[#1F65FF] focus:outline-none disabled:opacity-60";
const LABEL = "text-[14px] font-medium leading-[1.4] text-[#000B2C]";
const MAX_USER_MESSAGE = 1500;

/** The site's own dropdown (the browser's default list does not match the form): keyboard and screen-reader friendly, closes on Escape or an outside click */
function Select({ id, value, options, placeholder, disabled, onChange }: { id: string; value: string; options: string[]; placeholder: string; disabled?: boolean; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);
  const openList = () => { setActive(Math.max(0, options.indexOf(value))); setOpen(true); };
  const pick = (o: string) => { onChange(o); setOpen(false); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { openList(); return; }
      setActive((i) => (e.key === "ArrowDown" ? Math.min(options.length - 1, i + 1) : Math.max(0, i - 1)));
    } else if (e.key === "Home" && open) { e.preventDefault(); setActive(0); }
    else if (e.key === "End" && open) { e.preventDefault(); setActive(options.length - 1); }
    else if ((e.key === "Enter" || e.key === " ") && open && active >= 0) { e.preventDefault(); pick(options[active]); }
  };
  return (
    <SiteElement site="ClientContactForm-1"><div ref={box} className="relative">
      <SiteElement site="ClientContactForm-2"><button type="button" id={id} disabled={disabled} role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} onClick={() => (open ? setOpen(false) : openList())} onKeyDown={onKey}
        className={`${FIELD} flex cursor-pointer items-center justify-between gap-2 text-left ${open ? "!border-[#1F65FF]" : ""} ${value ? "" : "text-[#9AA3B8]"}`}>
        <SiteElement site="ClientContactForm-3"><span className="truncate">{value || placeholder}</span></SiteElement>
        <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}><path d="M3.5 6L8 10.5L12.5 6" stroke="#000B2C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button></SiteElement>
      {open ? (
        <SiteElement site="ClientContactForm-4"><ul id={`${id}-list`} role="listbox" className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-64 overflow-auto rounded-xl border border-[#E1E7F2] bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(0,11,44,0.25)]">
          {options.map((o, i) => (
            <SiteElement site="ClientContactForm-5" key={o} item={o}><li  role="option" aria-selected={o === value} onMouseEnter={() => setActive(i)} onClick={() => pick(o)}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-[15px] ${i === active ? "bg-[#EAF1FF]" : ""} ${o === value ? "font-medium text-[#1F65FF]" : "text-[#000B2C]"}`}>
              <SiteElement site="ClientContactForm-6"><span>{o}</span></SiteElement>
              {o === value ? <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6.5" stroke="#1F65FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
            </li></SiteElement>
          ))}
        </ul></SiteElement>
      ) : null}
    </div></SiteElement>
  );
}

export default function ClientContactForm({ category, eventTypes, heading, description, submitLabel }: { category: string; eventTypes: string[]; heading: string; description: string; submitLabel: string }) {
  const [v, setV] = useState({ ...EMPTY_CONTACT_FORM, company: "", eventType: "", guests: "" });
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const options = [...eventTypes, "Other"];

  const set = (k: keyof typeof v, value: string) => {
    setV((p) => ({ ...p, [k]: value }));
    if (k in errors) setErrors((p) => ({ ...p, [k]: undefined }));
    setFeedback(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const details = [`Enquiry from the ${category} page`, v.company.trim() && `Company: ${v.company.trim()}`, v.eventType && `Event type: ${v.eventType}`, v.guests.trim() && `Expected guests: ${v.guests.trim()}`].filter(Boolean).join("\n");
    const values = { name: v.name, email: v.email, phone: v.phone, website: v.website, message: `${details}\n\n${v.message.trim()}` };
    // check the visitor's own text (the lines above are ours)
    const errs = validateContactForm({ ...values, message: v.message });
    setErrors(errs);
    if (hasErrors(errs)) { setFeedback({ ok: false, text: "Please check the highlighted fields and try again." }); return; }
    setSending(true);
    setFeedback(null);
    const outcome = await contactService.submit(values);
    setSending(false);
    if (outcome.kind === "success") {
      setV({ ...EMPTY_CONTACT_FORM, company: "", eventType: "", guests: "" });
      setErrors({});
      setFeedback({ ok: true, text: outcome.message });
      return;
    }
    if (outcome.kind === "validation") setErrors(outcome.fieldErrors);
    setFeedback({ ok: false, text: outcome.message });
  };

  const err = (f: ContactField) => errors[f] ? <SiteElement site="ClientContactForm-7"><p className="text-xs text-[#B3261E]">{errors[f]}</p></SiteElement> : null;

  return (
    <SiteElement site="ClientContactForm-8"><section id="enquiry" className="relative scroll-mt-[69px] overflow-hidden bg-[#000B2C] py-16 sm:py-24">
      <ClientBackdrop lowGlowTop={589} />
      <Container className="relative grid items-start gap-10 lg:grid-cols-[400px_1fr] lg:gap-16">
        <SiteElement site="ClientContactForm-9"><div className="flex flex-col items-start gap-5 lg:pt-3">
          <SiteElement site="ClientContactForm-10"><h2 className={`${DM} text-[34px] leading-[1.12] tracking-[-0.8px] text-white sm:text-[44px]`}>{heading}</h2></SiteElement>
          <SiteElement site="ClientContactForm-11"><p className="text-[16px] leading-[1.65] text-[#A9B4CF] sm:text-[17px]">{description}</p></SiteElement>
          <SiteElement site="ClientContactForm-12"><a href={`mailto:${CONTACT_ENQUIRY_EMAIL}`} style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-[16px] font-semibold text-white hover:brightness-95">{CONTACT_ENQUIRY_EMAIL}</a></SiteElement>
        </div></SiteElement>

        <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-3xl border border-[#E1E7F2] bg-white p-6 sm:p-10">
          {/* honeypot: people never see or fill this */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden value={v.website} onChange={(e) => set("website", e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <SiteElement site="ClientContactForm-13"><div className="grid gap-4 sm:grid-cols-2">
            <SiteElement site="ClientContactForm-14"><div className="flex flex-col gap-2"><SiteElement site="ClientContactForm-15"><label htmlFor="cf-name" className={LABEL}>Name</label></SiteElement><SiteElement site="ClientContactForm-16"><input id="cf-name" autoComplete="name" maxLength={100} placeholder="Your full name" value={v.name} onChange={(e) => set("name", e.target.value)} disabled={sending} aria-invalid={!!errors.name} className={FIELD} /></SiteElement>{err("name")}</div></SiteElement>
            <SiteElement site="ClientContactForm-17"><div className="flex flex-col gap-2"><SiteElement site="ClientContactForm-18"><label htmlFor="cf-email" className={LABEL}>Work email</label></SiteElement><SiteElement site="ClientContactForm-19"><input id="cf-email" type="email" autoComplete="email" maxLength={254} placeholder="name@company.com" value={v.email} onChange={(e) => set("email", e.target.value)} disabled={sending} aria-invalid={!!errors.email} className={FIELD} /></SiteElement>{err("email")}</div></SiteElement>
          </div></SiteElement>
          <SiteElement site="ClientContactForm-20"><div className="grid gap-4 sm:grid-cols-2">
            <SiteElement site="ClientContactForm-21"><div className="flex flex-col gap-2"><SiteElement site="ClientContactForm-22"><label htmlFor="cf-phone" className={LABEL}>Phone</label></SiteElement><PhoneInput id="cf-phone" placeholder="+91" value={v.phone} onValueChange={(d) => set("phone", d)} disabled={sending} aria-invalid={!!errors.phone} className={FIELD} />{err("phone")}</div></SiteElement>
            <SiteElement site="ClientContactForm-23"><div className="flex flex-col gap-2"><SiteElement site="ClientContactForm-24"><label htmlFor="cf-company" className={LABEL}>Company</label></SiteElement><SiteElement site="ClientContactForm-25"><input id="cf-company" autoComplete="organization" maxLength={100} placeholder="Company name" value={v.company} onChange={(e) => set("company", e.target.value)} disabled={sending} className={FIELD} /></SiteElement></div></SiteElement>
          </div></SiteElement>
          <SiteElement site="ClientContactForm-26"><div className="grid gap-4 sm:grid-cols-2">
            <SiteElement site="ClientContactForm-27"><div className="flex flex-col gap-2">
              <SiteElement site="ClientContactForm-28"><label htmlFor="cf-type" className={LABEL}>Event type</label></SiteElement>
              <Select id="cf-type" value={v.eventType} options={options} placeholder="Select event type" disabled={sending} onChange={(o) => set("eventType", o)} />
            </div></SiteElement>
            <SiteElement site="ClientContactForm-29"><div className="flex flex-col gap-2"><SiteElement site="ClientContactForm-30"><label htmlFor="cf-guests" className={LABEL}>Expected guests</label></SiteElement><SiteElement site="ClientContactForm-31"><input id="cf-guests" inputMode="numeric" maxLength={7} placeholder="e.g. 300" value={v.guests} onChange={(e) => set("guests", e.target.value.replace(/\D/g, ""))} disabled={sending} className={FIELD} /></SiteElement></div></SiteElement>
          </div></SiteElement>
          <SiteElement site="ClientContactForm-32"><div className="flex flex-col gap-2">
            <SiteElement site="ClientContactForm-33"><label htmlFor="cf-message" className={LABEL}>Message</label></SiteElement>
            <SiteElement site="ClientContactForm-34"><textarea id="cf-message" rows={3} maxLength={MAX_USER_MESSAGE} placeholder="Tell us about your event" value={v.message} onChange={(e) => set("message", e.target.value)} disabled={sending} aria-invalid={!!errors.message} className="w-full resize-y rounded-[10px] border border-[#D9E1EF] bg-white p-3.5 text-[15px] leading-[1.4] text-[#000B2C] placeholder:text-[#9AA3B8] focus:border-[#1F65FF] focus:outline-none disabled:opacity-60" /></SiteElement>
            {err("message")}
          </div></SiteElement>
          <SiteElement site="ClientContactForm-35"><p className="text-[12px] leading-[1.5] text-[#828282]">Event type options: {options.join(" · ")}</p></SiteElement>
          <SiteElement site="ClientContactForm-36"><button type="submit" disabled={sending} style={{ backgroundImage: BLUE_GRADIENT }} className="inline-flex h-[54px] w-full items-center justify-center rounded-xl px-6 text-[16px] font-semibold text-white transition hover:brightness-95 disabled:opacity-70">{sending ? "Sending…" : submitLabel}</button></SiteElement>
          {feedback ? <SiteElement site="ClientContactForm-37"><p role={feedback.ok ? "status" : "alert"} className={`text-[14px] ${feedback.ok ? "text-[#1F7A45]" : "text-[#B3261E]"}`}>{feedback.text}</p></SiteElement> : null}
        </form>
      </Container>
    </section></SiteElement>
  );
}

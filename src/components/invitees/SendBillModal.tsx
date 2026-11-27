"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/icons/Icon";
import { formatMoney } from "@/utils/money";
import { formatDeadline } from "@/utils/deadline";
import type { BillQuote } from "@/services/billingService";

interface SendBillModalProps {
  quote: BillQuote;
  /** what is being paid for: invitations to send (default) or printable cards to download */
  kind?: "send" | "download" | "both" | "resend";
  /** the payment (Razorpay) is in progress */
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onFinish: () => void;
  /** invitations only: send these by email instead, which costs nothing */
  onEmailInstead?: () => void;
  /** set for an administrator, who sees the organizer's bill and chooses how it is handled instead of paying: ask for it now */
  onRequestPayment?: () => void;
  /** administrator: send now, the organizer pays by the event's end */
  onPayLater?: () => void;
  /** administrator: the organizer already paid outside the platform */
  onSettle?: (note: string) => void;
  /** administrator recording an offline payment when nothing is being sent */
  settleOnly?: boolean;
}

type AdminChoice = "now" | "later" | "settled";
const CHOICES: { value: AdminChoice; label: string; hint: string }[] = [
  { value: "now", label: "Pay Now", hint: "Ask the organizer to pay first" },
  { value: "later", label: "Pay Later", hint: "Send now, paid by the event's end" },
  { value: "settled", label: "Payment Settled", hint: "Already received outside the app" },
];

const rupees = (n: number) => formatMoney(n, { minFractionDigits: 0, maxFractionDigits: 2 });
const gstLabel = (p: number) => `${Number.isInteger(p) ? p : p.toFixed(2)}%`;

/**
 * The bill shown when invitations are sent (Figma 2001:2467 "Make Payment"): per-head price, how many invitees, the subtotal, GST and
 * the total. The figures come from the server (the admin's per-head rate and GST), so they follow whatever the admin sets.
 */
export default function SendBillModal({ quote, kind = "send", busy, error, onCancel, onFinish, onEmailInstead, onRequestPayment, onPayLater, onSettle, settleOnly = false }: SendBillModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [showAgreeError, setShowAgreeError] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, busy]);

  const messages = kind !== "download";
  const organizer = quote.organizerName || "the organizer";
  const admin = !!(onRequestPayment || settleOnly);
  const [choice, setChoice] = useState<AdminChoice>(settleOnly ? "settled" : "now");
  const [note, setNote] = useState("");
  const settling = admin && choice === "settled";
  // an offline payment covers everything owed so far; the other choices are about the guests being invited now
  const shown = settling && quote.owed ? quote.owed : quote;
  const deadline = quote.payBy ? formatDeadline(quote.payBy) : "the event ends";
  const finish = () => {
    if (settling) {
      if (!agreed) { setShowAgreeError(true); return; }
      return onSettle?.(note.trim());
    }
    if (admin) return choice === "later" ? onPayLater?.() : onRequestPayment?.();
    if (!agreed) { setShowAgreeError(true); return; }
    onFinish();
  };

  const row = "flex items-center justify-between gap-2 py-3";
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="send-bill-title">
      <div className="w-full max-w-[400px] bg-white border border-[#E5E5E5] rounded-lg overflow-y-auto max-h-[calc(100dvh-2rem)]">
        <div className="flex items-end gap-5 px-6 py-5 border-b border-[#E0E0E0]">
          <h2 id="send-bill-title" className="flex-1 text-base font-medium text-[#15191C]">{settleOnly ? "Record Payment" : admin ? "Organizer Payment" : "Make Payment"}</h2>
          <button type="button" onClick={onCancel} disabled={busy} aria-label="Close" className="shrink-0 cursor-pointer disabled:opacity-40">
            <Icon name="events/close" width={16} height={16} />
          </button>
        </div>

        <div className="px-[26px] pt-1 pb-4">
          {admin && !settleOnly && (
            <fieldset className="mt-3" disabled={busy}>
              <legend className="sr-only">How is the organizer paying?</legend>
              <div className="flex flex-col gap-2">
                {CHOICES.map((c) => (
                  <label key={c.value} className={`flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 ${choice === c.value ? "border-[#1F65FF] bg-[#F5F8FF]" : "border-[#E0E0E0]"}`}>
                    <input type="radio" name="bill-choice" value={c.value} checked={choice === c.value} onChange={() => { setChoice(c.value); setAgreed(false); setShowAgreeError(false); }} className="mt-1 accent-[#1F65FF]" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#15191C]">{c.label}</span>
                      <span className="block text-xs text-[#6B6B6B]">{c.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <p role="status" className="mt-3 rounded-md border border-[#C7D7FE] bg-[#EEF4FF] px-3 py-2 text-[13px] text-[#1D3A8A]">
            {!messages
              ? <>Printed cards are charged. A guest already paid for on WhatsApp is not charged again.</>
              : !admin
                ? <>WhatsApp invitations are charged, including when you choose All (Email + WhatsApp). Email invitations are free.</>
                : settling
                  ? <>Records everything <b className="break-words">{organizer}</b> owes on this event so far{settleOnly ? "" : ", including these guests"}. Guests added later are charged again.</>
                  : choice === "later"
                    ? <>The invitations go out now. <b className="break-words">{organizer}</b> must pay by <b>{deadline}</b>, and is reminded 3 days and 1 day before, and if it is overdue.</>
                    : <>WhatsApp invitations are charged to <b className="break-words">{organizer}</b>. Nothing goes out on WhatsApp until they pay from their Billing page. Email invitations are free.</>}
          </p>
          <p className="py-4 text-base font-medium text-[#15191C] border-b border-[#EAEAEA]">Payment Info</p>
          <div className="border-b border-dashed border-black/15 text-sm font-medium text-[#15191C]/50">
            <div className={row}><span>Per Head Price</span><span>{rupees(shown.rate ?? 0)}</span></div>
            <div className={row}><span>{kind === "download" ? "Total Cards" : kind === "both" || settling ? "Total Guests" : "Total Invitees"}</span><span>{shown.invitees}</span></div>
          </div>
          <div className="border-b border-dashed border-black/15 text-sm font-medium text-[#15191C]/50">
            <div className={row}><span>Subtotal</span><span>{rupees(shown.subtotal)}</span></div>
            <div className={row}><span>Tax ({gstLabel(shown.gstPercent)} GST)</span><span>{rupees(shown.tax)}</span></div>
          </div>
          <div className="flex items-center justify-between gap-2 py-4 border-b border-[#EAEAEA] text-base">
            <span className="font-medium text-[#15191C]">Total Amount</span>
            <span className="font-bold text-[#1F65FF]">{rupees(shown.total)}</span>
          </div>

          {settling && (
            <label className="mt-4 block text-[13px] font-medium text-[#15191C]">
              Note (optional)
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="e.g. Cash, receipt number" className="mt-1 w-full rounded-md border border-[#E0E0E0] px-3 py-2 text-sm font-normal text-[#15191C] focus:border-[#1F65FF] focus:outline-none" />
            </label>
          )}
          {(!admin || settling) && (
          <>
            <div className="mt-4 flex items-start gap-1.5">
              <input
                id="bill-agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); if (e.target.checked) setShowAgreeError(false); }}
                className="mt-0.5 size-[18px] shrink-0 cursor-pointer check-green"
              />
              <label htmlFor="bill-agree" className="text-[13px] font-medium text-[#15191C]/50 cursor-pointer">
                {settling
                  ? <>I have received {rupees(shown.total)} from {organizer}</>
                  : <>I agree to the <Link href="/contact" target="_blank" className="underline">Terms and conditions</Link> &amp; <Link href="/contact" target="_blank" className="underline">Privacy policy</Link></>}
              </label>
            </div>
            {showAgreeError && !agreed && <p role="alert" className="mt-2 text-[13px] font-medium text-[#D92D20]">Please select the checkbox</p>}
          </>
          )}
          {error && <p role="alert" className="mt-3 text-[13px] font-medium text-[#D92D20]">{error}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 p-4 border-t border-[#E5E5E5]">
          {onEmailInstead && (
            <button type="button" onClick={onEmailInstead} disabled={busy} className="w-full text-center text-sm font-semibold text-[#1F65FF] underline cursor-pointer disabled:opacity-50">Send by email only (free)</button>
          )}
          <button type="button" onClick={onCancel} disabled={busy} className="px-6 py-[11px] bg-white border border-[#DDD] rounded-lg text-base font-semibold text-black cursor-pointer disabled:opacity-50">Cancel</button>
          <button
            type="button"
            onClick={finish}
            disabled={busy}
            style={{ backgroundImage: "linear-gradient(180deg, #1F65FF 0%, #2071FF 33%, #2181FF 69%, #1F65FF 100%)" }}
            className="px-6 py-[11px] rounded-lg text-base font-semibold text-white cursor-pointer disabled:opacity-60 hover:brightness-95"
          >
            {busy ? "Processing…" : !admin ? `Pay ${rupees(quote.total)}` : choice === "now" ? "Send payment request" : choice === "later" ? "Send now" : settleOnly ? "Mark settled" : "Mark settled and send"}
          </button>
        </div>
      </div>
    </div>
  );
}

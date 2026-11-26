"use client";

import React, { useEffect, useRef, useState } from "react";
import { NOT_DIGITS_MESSAGE } from "@/utils/phoneInput";
import { AuthAlert, Spinner, authLinkClass, authPrimaryButtonClass } from "@/components/auth/AuthLayouts";
import type { ApiResponse } from "@/services/apiClient";

const LENGTH = 6;
const EXPIRY_SECONDS = 600;
const RESEND_SECONDS = 60;
const EMPTY = Array<string>(LENGTH).fill("");

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * Six boxes for a code sent by email or text message, with the time it stays valid and "Resend code". Mount it again (a new `key`)
 * when a fresh code goes somewhere else, so the boxes and timers start over.
 */
export default function CodeEntry({ onVerify, onResend, sendOnOpen = false, submitLabel = "Verify & Continue" }: {
  onVerify: (code: string) => Promise<ApiResponse<unknown>>;
  onResend: () => Promise<ApiResponse<unknown>>;
  /** ask for a code as soon as the boxes appear (someone coming back to finish an earlier sign-up) */
  sendOnOpen?: boolean;
  submitLabel?: string;
}) {
  const [digits, setDigits] = useState<string[]>(EMPTY);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [expiry, setExpiry] = useState(EXPIRY_SECONDS);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const asked = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setExpiry((s) => (s > 0 ? s - 1 : 0));
      setCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    boxes.current[0]?.focus();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sendOnOpen || asked.current) return;
    asked.current = true;
    void onResend().then((res) => {
      // asked within a minute of the last one: that code was just sent and still works, so nothing needs saying
      if (!res.success && res.code !== "CODE_COOLDOWN") setMessage({ tone: "error", text: res.message || "The code could not be sent." });
    });
  }, [sendOnOpen, onResend]);

  const change = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    // a letter or symbol typed into a box is not entered; this says why
    setNote(value.trim() && cleaned.length < value.trim().length ? NOT_DIGITS_MESSAGE : null);
    const next = [...digits];
    next[index] = cleaned.slice(-1);
    setDigits(next);
    if (next[index] && index < LENGTH - 1) boxes.current[index + 1]?.focus();
  };

  const keys = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) boxes.current[index - 1]?.focus();
    else if (e.key === "ArrowLeft" && index > 0) boxes.current[index - 1]?.focus();
    else if (e.key === "ArrowRight" && index < LENGTH - 1) boxes.current[index + 1]?.focus();
  };

  const paste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text");
    const pasted = raw.replace(/\D/g, "").slice(0, LENGTH);
    setNote(raw.replace(/[\s\d]/g, "") ? NOT_DIGITS_MESSAGE : null);
    if (!pasted) return;
    setDigits(EMPTY.map((_, i) => pasted[i] || ""));
    boxes.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (expiry <= 0) return setMessage({ tone: "error", text: "Verification code has expired. Please request a new code." });
    setBusy(true);
    try {
      const res = await onVerify(digits.join(""));
      if (!res.success) setMessage({ tone: "error", text: res.message || "Invalid verification code. Please try again." });
    } catch {
      setMessage({ tone: "error", text: "Network error. Please try again later." });
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setMessage(null);
    setResending(true);
    try {
      const res = await onResend();
      if (res.success) {
        setDigits(EMPTY);
        setExpiry(EXPIRY_SECONDS);
        setCooldown(RESEND_SECONDS);
        setMessage({ tone: "success", text: "A fresh code has been sent." });
        boxes.current[0]?.focus();
      } else setMessage({ tone: "error", text: res.message || "Failed to resend the code. Please try again." });
    } catch {
      setMessage({ tone: "error", text: "Network error. Please try again later." });
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={verify} className="flex flex-col gap-5">
      {message && <AuthAlert tone={message.tone}>{message.text}</AuthAlert>}
      <fieldset>
        <legend className="mb-3 block text-sm font-medium">Enter 6-digit verification code</legend>
        <div className="flex justify-between gap-2" onPaste={paste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { boxes.current[i] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Digit ${i + 1} of ${LENGTH}`}
              value={digit}
              onChange={(e) => change(i, e.target.value)}
              onKeyDown={(e) => keys(i, e)}
              disabled={busy}
              className={`h-14 w-full min-w-0 max-w-14 rounded-lg border text-center text-2xl font-semibold focus:border-[#1F65FF] focus:outline-none focus:ring-[3px] focus:ring-[#1F65FF]/[0.18] ${digit ? "border-[#1F65FF]" : "border-[#E0E0E0]"}`}
            />
          ))}
        </div>
        {note && <p role="alert" className="mt-2 text-xs font-medium text-rose-600">{note}</p>}
      </fieldset>
      <div className="flex items-center justify-between text-xs font-medium text-[#666D80]">
        <span>Code expires in <strong className={expiry <= 60 ? "text-rose-600" : "text-[#000B2C]"}>{clock(expiry)}</strong></span>
        {cooldown > 0 ? <span>Resend code ({cooldown}s)</span> : <button type="button" onClick={resend} disabled={resending} className={authLinkClass}>{resending ? "Sending…" : "Resend code"}</button>}
      </div>
      <button type="submit" disabled={busy || digits.join("").length !== LENGTH || expiry <= 0} className={authPrimaryButtonClass}>
        {busy ? <><Spinner /> Verifying…</> : submitLabel}
      </button>
    </form>
  );
}

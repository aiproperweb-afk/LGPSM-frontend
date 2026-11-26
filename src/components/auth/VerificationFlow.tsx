"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import CodeEntry from "@/components/auth/CodeEntry";
import ChangeEmailForm from "@/components/auth/ChangeEmailForm";
import ChangePhoneForm from "@/components/auth/ChangePhoneForm";
import { AuthAlert, AuthHeader, authLinkClass } from "@/components/auth/AuthLayouts";
import { signinHref } from "@/components/auth/authPortal";
import { clearPendingVerification, savePendingVerification, type VerificationStep } from "@/utils/pendingVerification";

/**
 * Finishing a sign-up: the code sent to the email address and then, when the server can send text messages, the code sent to the
 * mobile number. Both addresses can be corrected here if the code went to the wrong place.
 */
export default function VerificationFlow({ initialEmail, initialStep = "email", knownPassword, knownPhone, sendPhoneCodeOnOpen = false }: {
  initialEmail: string;
  initialStep?: VerificationStep;
  /** the password typed on the sign-up form, while this page still has it: changing an address needs it */
  knownPassword?: string;
  knownPhone?: string;
  /** coming back to the mobile step from sign-in: ask for a code straight away */
  sendPhoneCodeOnOpen?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(knownPhone || "");
  const [step, setStep] = useState<VerificationStep>(initialStep);
  const [changing, setChanging] = useState(false);
  // bumped whenever a code goes somewhere new, so the boxes and timers start over
  const [round, setRound] = useState(0);
  const [done, setDone] = useState("");

  const finish = (message: string) => {
    clearPendingVerification();
    try { sessionStorage.setItem("lgpsm_new_account_popup_pending", "true"); } catch { /* the welcome note is simply not shown */ }
    setDone(message);
    setTimeout(() => router.push(`${signinHref("organizer")}&verified=true`), 1200);
  };

  const resendEmail = useCallback(() => authService.resendVerificationCode(email), [email]);
  const resendPhone = useCallback(() => authService.resendSignupPhoneCode(email), [email]);

  const verifyEmail = async (code: string) => {
    const res = await authService.verifyEmail(email, code);
    if (res.success) {
      if (res.data?.phoneVerificationRequired) {
        savePendingVerification(email, "phone");
        setStep("phone");
        setChanging(false);
      } else finish("Email verified successfully! Redirecting to sign in…");
    }
    return res;
  };

  const verifyPhone = async (code: string) => {
    const res = await authService.verifySignupPhone(email, code);
    if (res.success) finish("Mobile number verified! Redirecting to sign in…");
    return res;
  };

  const onEmail = step === "email";
  const sentTo = onEmail ? email || "your email address" : phone ? `+91 ${phone.slice(-10)}` : "your mobile number";
  return (
    <>
      <AuthHeader
        title={onEmail ? "Verify your email" : "Verify your mobile"}
        prompt={<>Enter the 6-digit code sent {onEmail ? "to" : "by text message to"} <span className={`font-semibold text-[#000B2C] ${onEmail ? "break-all" : "whitespace-nowrap"}`}>{sentTo}</span></>}
      />
      {done && <AuthAlert tone="success">{done}</AuthAlert>}
      <CodeEntry
        key={`${step}-${round}`}
        onVerify={onEmail ? verifyEmail : verifyPhone}
        onResend={onEmail ? resendEmail : resendPhone}
        sendOnOpen={!onEmail && sendPhoneCodeOnOpen && round === 0}
      />
      <p className="text-center text-xs font-medium text-[#666D80]">
        {onEmail ? "Didn’t get the email? Check your spam folder, or " : "Didn’t get the text? "}
        <button type="button" onClick={() => setChanging((open) => !open)} aria-expanded={changing} className={authLinkClass}>
          {onEmail ? "change email address" : "change mobile number"}
        </button>
      </p>
      {changing && onEmail && (
        <ChangeEmailForm
          currentEmail={email}
          knownPassword={knownPassword}
          onCancel={() => setChanging(false)}
          onChanged={(next) => {
            savePendingVerification(next, "email");
            setEmail(next);
            setChanging(false);
            setRound((n) => n + 1);
          }}
        />
      )}
      {changing && !onEmail && (
        <ChangePhoneForm
          email={email}
          knownPassword={knownPassword}
          onCancel={() => setChanging(false)}
          onChanged={(next) => {
            setPhone(next);
            setChanging(false);
            setRound((n) => n + 1);
          }}
        />
      )}
    </>
  );
}

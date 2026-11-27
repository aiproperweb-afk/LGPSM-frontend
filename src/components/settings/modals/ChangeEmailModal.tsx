"use client";

import { useDashboardCopy } from "@/components/cms/DashboardCopyProvider";

import React, { useCallback, useState } from "react";
import ModalClose from "@/components/common/ModalClose";
import CodeEntry from "@/components/auth/CodeEntry";
import { AuthAlert, PasswordInput, Spinner, authInputClass, authLabelClass, authPrimaryButtonClass } from "@/components/auth/AuthLayouts";
import { userService } from "@/services/userService";

/** Changing the sign-in email: the current password, then the code sent to the new address. Nothing changes until that code is entered. */
export default function ChangeEmailModal({ currentEmail, onClose, onChanged }: { currentEmail: string; onClose: () => void; onChanged: (email: string) => void | Promise<void> }) {
  const cmsText = useDashboardCopy();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(() => userService.requestEmailChange(email.trim(), password), [email, password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (email.trim().toLowerCase() === currentEmail.trim().toLowerCase()) return setError("Enter a different email address.");
    setBusy(true);
    try {
      const res = await request();
      if (res.success) setSentTo(res.data?.sentTo || email.trim().toLowerCase());
      else setError(res.message || "The email address could not be changed. Please try again.");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (code: string) => {
    const res = await userService.confirmEmailChange(code);
    if (res.success && res.data) await onChanged(res.data.email);
    return res;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="change-email-title">
      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-xl bg-white p-6 text-[#000B2C] shadow-2xl">
        <ModalClose onClick={onClose} disabled={busy} />
        <div>
          <h2 id="change-email-title" className="pr-8 text-lg font-semibold">{cmsText("changeEmailAddress", "Change email address")}</h2>
          <p className="mt-1 text-sm text-[#666D80]">
            {sentTo ? <>{cmsText("enterThe6DigitCodeSentTo", "Enter the 6-digit code sent to") + " "}<span className="break-all font-semibold text-[#000B2C]">{sentTo}</span>.</> : <>{cmsText("youSignInWith", "You sign in with") + " "}<span className="break-all font-semibold text-[#000B2C]">{currentEmail}</span>{" " + cmsText("now", "now.")}</>}
          </p>
        </div>
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        {sentTo ? (
          <CodeEntry onVerify={confirm} onResend={request} submitLabel="Change my email" />
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="new-account-email" className={authLabelClass}>{cmsText("newEmailAddress", "New email address")}</label>
              <input id="new-account-email" type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} placeholder={cmsText("helloExampleCom", "hello@example.com")} className={authInputClass} />
            </div>
            <div>
              <label htmlFor="new-account-email-password" className={authLabelClass}>{cmsText("currentPassword", "Current password")}</label>
              <PasswordInput id="new-account-email-password" value={password} onChange={setPassword} placeholder={cmsText("enterYourPassword", "Enter your password")} autoComplete="current-password" disabled={busy} />
            </div>
            <button type="submit" disabled={busy || !email.trim() || !password} className={authPrimaryButtonClass}>{busy ? <><Spinner />{" " + cmsText("sending2", "Sending…")}</> : cmsText("sendCodeToTheNewAddress", "Send code to the new address")}</button>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import { useAlert } from "@/context/AlertContext";
import { usePageTitle } from "@/context/PageTitleContext";
import PhoneField from "@/components/auth/PhoneField";
import CodeEntry from "@/components/auth/CodeEntry";
import { AuthAlert, AuthBackLink, AuthHeader, AuthLoadingShell, AuthPage, Required, Spinner, authInputClass, authLabelClass, authPrimaryButtonClass } from "@/components/auth/AuthLayouts";
import { signinHref } from "@/components/auth/authPortal";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

const OPTIONS = "/account-recovery";
const hint = "mt-2 text-xs font-medium leading-[18px] text-[#666D80]";
const important = "font-semibold text-[#000B2C]";

const Chip = ({ icon }: { icon: string }) => (
  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#E5ECFF]">
    {/* eslint-disable-next-line @next/next/no-img-element -- static icon */}
    <img src={`/images/auth/signin/${icon}.svg`} alt="" width={20} height={20} />
  </span>
);

const rowClass = "flex h-14 w-full items-center gap-3 px-4 text-left text-base font-medium hover:bg-[#F7F9FF] cursor-pointer";
const Row = ({ icon, label }: { icon: string; label: string }) => (
  <>
    <Chip icon={icon} />
    <span className="min-w-0 flex-1">{label}</span>
    {/* eslint-disable-next-line @next/next/no-img-element -- static icon */}
    <img src="/images/auth/signin/chevron-right.svg" alt="" width={20} height={20} />
  </>
);

function Choose() {
  const { showAlert } = useAlert();
  return (
    <>
      <div>
        <p className="text-base font-semibold">What happened to your account?</p>
        <p className="mt-1.5 text-sm font-medium text-[#666D80]">Pick the issue and we&apos;ll guide you from there.</p>
      </div>
      <ul className="divide-y divide-[#E0E0E0] overflow-hidden rounded-lg border border-[#E0E0E0]">
        <li>
          <button type="button" className={rowClass} onClick={() => showAlert("Two-factor authentication is coming soon, so there is nothing to recover yet. If you cannot sign in, use Forgot password on the log in page.", "info", "Coming soon")}>
            <Row icon="phone" label="Lost two-factor authentication" />
          </button>
        </li>
        <li><Link href={`${OPTIONS}?issue=email-access`} className={rowClass}><Row icon="mail" label="Lost access to email" /></Link></li>
        <li><Link href={`${OPTIONS}?issue=forgot-email`} className={rowClass}><Row icon="help" label="Forgot email" /></Link></li>
      </ul>
      <AuthBackLink href={signinHref("organizer")} label="Back to log in" />
    </>
  );
}

/** Lost access to the email: the request goes to the administrators, who check who is asking before changing anything */
function LostEmailAccess() {
  const [email, setEmail] = useState("");
  const [recovery, setRecovery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (email.trim().toLowerCase() === recovery.trim().toLowerCase()) return setError("Give a different email address that you can still open.");
    setBusy(true);
    try {
      const res = await authService.requestEmailRecovery(email.trim(), recovery.trim());
      if (res.success) setSent(true);
      else setError(res.message || "Your request could not be sent. Please try again.");
    } catch {
      setError(ERROR_MESSAGES.network.genericFailure);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <>
        <p role="status" className="rounded-lg border border-[#C7D7FE] bg-[#EEF4FF] p-4 text-sm font-medium leading-6">
          Your request has been received. Our team will check it and write to <span className="break-all font-semibold">{recovery.trim()}</span>. Nothing on your account has changed.
        </p>
        <AuthBackLink href={signinHref("organizer")} label="Back to log in" />
      </>
    );
  }
  return (
    <>
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <form onSubmit={submit} className="flex flex-col gap-6">
        <div>
          <label htmlFor="recovery-account" className={authLabelClass}>Account Email<Required /></label>
          <input id="recovery-account" type="email" required autoComplete="email" placeholder="hello@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} className={authInputClass} />
          <p className={hint}>Enter the email address associated with your account.</p>
        </div>
        <div>
          <label htmlFor="recovery-alternate" className={authLabelClass}>Recovery Email<Required /></label>
          <input id="recovery-alternate" type="email" required placeholder="alternate@example.com" value={recovery} onChange={(e) => setRecovery(e.target.value)} disabled={busy} className={authInputClass} />
          <p className={hint}>
            Enter an alternative email address where we can send further instructions to help you regain access to your account.{" "}
            <span className={important}>Please ensure that this email address is correct and that you have access to it.</span>
          </p>
        </div>
        <button type="submit" disabled={busy} className={authPrimaryButtonClass}>{busy ? <><Spinner /> Sending…</> : "Start Account Recovery"}</button>
      </form>
      <AuthBackLink href={OPTIONS} label="Back to recovery options" />
    </>
  );
}

/** Forgot email: a code to the mobile number, then the account email(s) on that number */
function ForgotEmail() {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [found, setFound] = useState<{ email: string; complete: boolean }[] | null>(null);

  const find = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length !== 10) return setError("Enter your 10-digit mobile number.");
    setBusy(true);
    try {
      const res = await authService.sendFindAccountCode(phone);
      if (res.success) setCodeSent(true);
      else setError(res.message || "Your account could not be looked up. Please try again.");
    } catch {
      setError(ERROR_MESSAGES.network.genericFailure);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (code: string) => {
    const res = await authService.findAccounts(phone, code);
    if (res.success) setFound(res.data?.accounts || []);
    return res;
  };

  if (found) {
    return (
      <>
        {found.length ? (
          <div>
            <p className="text-sm font-semibold">Account email on +91 {phone}</p>
            <ul className="mt-3 divide-y divide-[#E0E0E0] rounded-lg border border-[#E0E0E0]">
              {found.map((a) => <li key={a.email} className="break-all px-4 py-3 text-sm font-medium">{a.email}</li>)}
            </ul>
            {found.some((a) => !a.complete) && <p className={hint}>Part of an address is hidden because this number was never verified on that account. If you cannot tell which address it is, contact support.</p>}
          </div>
        ) : (
          <p role="status" className="text-sm font-medium">No account uses this mobile number.</p>
        )}
        <Link href={signinHref("organizer")} className={authPrimaryButtonClass}>Log in</Link>
        <AuthBackLink href={OPTIONS} label="Back to recovery options" />
      </>
    );
  }
  return (
    <>
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      {codeSent ? (
        <>
          <p className="text-center text-sm font-medium text-[#666D80]">If an account uses <span className="font-semibold text-[#000B2C]">+91 {phone}</span>, a code has been sent to it by text message.</p>
          <CodeEntry onVerify={verify} onResend={() => authService.sendFindAccountCode(phone)} submitLabel="Show my account" />
        </>
      ) : (
        <form onSubmit={find} className="flex flex-col gap-6">
          <div>
            <label htmlFor="recovery-phone" className={authLabelClass}>Mobile Number<Required /></label>
            <PhoneField id="recovery-phone" value={phone} onChange={setPhone} disabled={busy} placeholder="Enter mobile number" />
            <p className={hint}>Enter the mobile number registered with us and we&apos;ll try to find your account email.</p>
          </div>
          <button type="submit" disabled={busy} className={authPrimaryButtonClass}>{busy ? <><Spinner /> Searching…</> : "Find my account"}</button>
          <Link href="/contact" className="self-center text-sm font-semibold text-[#000B2C] hover:text-[#1A56DB] hover:underline">Continue without a mobile number</Link>
        </form>
      )}
      <AuthBackLink href={OPTIONS} label="Back to recovery options" />
    </>
  );
}

function Recovery() {
  const issue = useSearchParams().get("issue");
  usePageTitle("Account recovery");
  return (
    <AuthPage>
      <AuthHeader title="Account recovery" />
      {issue === "email-access" ? <LostEmailAccess /> : issue === "forgot-email" ? <ForgotEmail /> : <Choose />}
    </AuthPage>
  );
}

export default function AccountRecoveryPage() {
  return (
    <Suspense fallback={<AuthLoadingShell />}>
      <Recovery />
    </Suspense>
  );
}

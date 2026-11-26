"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { usePageTitle } from "@/context/PageTitleContext";
import SocialSignIn from "@/components/auth/SocialSignIn";
import PhoneField from "@/components/auth/PhoneField";
import VerificationFlow from "@/components/auth/VerificationFlow";
import {
  AuthAlert,
  AuthBackLink,
  AuthHeader,
  AuthPage,
  OrDivider,
  PasswordInput,
  Required,
  Spinner,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthLayouts";
import { signinHref } from "@/components/auth/authPortal";
import { INPUT_PLACEHOLDERS } from "@/constants/placeholders";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { clearPendingVerification, readPendingVerification, savePendingVerification, type VerificationStep } from "@/utils/pendingVerification";

type OrganizerType = "INDIVIDUAL" | "ORGANIZATION";

// the terms and privacy pages are not written yet: like the site's footer, these lead to the contact page
const legalLink = "font-semibold text-white underline";

// Only organizers can self-register; admin accounts are provisioned and assigned users are created by organizers.
export default function SignupPage() {
  const router = useRouter();
  const { register, googleLogin } = useAuth();
  const { showAlert } = useAlert();

  const [verifying, setVerifying] = useState<{ email: string; step: VerificationStep } | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Individual, or an Organization (then its name is required)
  const [orgType, setOrgType] = useState<OrganizerType>("INDIVIDUAL");
  const [orgName, setOrgName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inFlight = useRef(false);

  // Restore browser-only state after hydration so server and first client renders match.
  useEffect(() => {
    const pending = readPendingVerification();
    const passedAlong = new URLSearchParams(window.location.search).get("email");
    void Promise.resolve().then(() => {
      if (pending) setVerifying(pending);
      else if (passedAlong) setEmail(passedAlong);
    });
  }, []);

  usePageTitle(verifying ? "Verify your account" : "Register");

  // "Sign up with Google": the account is made from the Google profile and the organizer completes the rest on the dashboard
  const handleGoogle = async (credential: string) => {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const res = await googleLogin(credential);
      if (res.success) {
        try { sessionStorage.setItem("lgpsm_signing_in", "1"); } catch { /* the dashboard opens without the loader */ }
        router.push("/dashboard");
      } else {
        showAlert(res.message || "Google sign-up did not work. Please try again.", "error", "Google sign-up");
      }
    } catch {
      setErrorMessage(ERROR_MESSAGES.network.genericFailure);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;
    setErrorMessage("");
    if (fullName.trim().length < 2) return setErrorMessage("Full name must be at least 2 characters.");
    if (phone.length !== 10) return setErrorMessage("Enter your 10-digit mobile number.");
    if (orgType === "ORGANIZATION" && orgName.trim().length < 2) return setErrorMessage("Enter the organization name.");
    if (password !== confirmPassword) return void showAlert(ERROR_MESSAGES.auth.passwordsDoNotMatch, "error", "Password not matching");
    if (password.length < 8) return setErrorMessage(ERROR_MESSAGES.auth.passwordTooShort);

    inFlight.current = true;
    setIsSubmitting(true);
    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone,
        role: "ORGANIZER",
        channel: "web",
        marketingConsent: consent,
        organizationType: orgType,
        ...(orgType === "ORGANIZATION" ? { organizationName: orgName.trim() } : {}),
      });
      if (res.success) {
        const registered = res.data?.email || email.trim().toLowerCase();
        savePendingVerification(registered, "email");
        setVerifying({ email: registered, step: "email" });
      } else if (res.code === "EMAIL_VERIFICATION_PENDING") {
        setVerifying({ email: email.trim().toLowerCase(), step: "email" });
      } else {
        setErrorMessage(res.message || "Registration failed. Please check your inputs.");
      }
    } catch {
      setErrorMessage(ERROR_MESSAGES.network.genericFailure);
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <AuthPage>
        <VerificationFlow initialEmail={verifying.email} initialStep={verifying.step} knownPassword={password || undefined} knownPhone={phone || undefined} />
        <AuthBackLink label="Back to registration" onClick={() => { clearPendingVerification(); setVerifying(null); }} />
      </AuthPage>
    );
  }

  return (
    <AuthPage
      below={
        <>
          By continuing you agree with our <Link href="/contact" className={legalLink}>Terms of Service</Link> and confirm that you have read our{" "}
          <Link href="/contact" className={legalLink}>Privacy Policy</Link>. We may send you product updates and special offers via email. You can opt out anytime (see{" "}
          <Link href="/contact" className={legalLink}>Privacy Policy</Link>).
        </>
      }
    >
      <AuthHeader title="Register" prompt={<>Already have an account? <Link href={signinHref("organizer")} className={authLinkClass}>Log in</Link></>} />
      <SocialSignIn mode="signup" onGoogle={handleGoogle} disabled={isSubmitting} />
      <OrDivider />
      {errorMessage && <AuthAlert tone="error">{errorMessage}</AuthAlert>}
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="signup-name" className={authLabelClass}>Full Name<Required /></label>
          <input id="signup-name" type="text" required minLength={2} maxLength={120} autoComplete="name" placeholder={INPUT_PLACEHOLDERS.auth.name} value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isSubmitting} className={authInputClass} />
        </div>
        <div>
          <label htmlFor="signup-email" className={authLabelClass}>Email Address<Required /></label>
          <input id="signup-email" type="email" required autoComplete="email" placeholder={INPUT_PLACEHOLDERS.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} className={authInputClass} />
        </div>
        <div>
          <label htmlFor="signup-phone" className={authLabelClass}>Phone no<Required /></label>
          <PhoneField id="signup-phone" value={phone} onChange={setPhone} disabled={isSubmitting} />
        </div>
        <fieldset disabled={isSubmitting}>
          <legend className={authLabelClass}>Organizer type<Required /></legend>
          <div className="grid grid-cols-2 gap-3">
            {([["INDIVIDUAL", "Individual"], ["ORGANIZATION", "Organization"]] as const).map(([value, label]) => (
              <label key={value} className={`flex h-[47px] cursor-pointer items-center gap-2 rounded-md px-3.5 text-sm has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[#1F65FF]/30 ${orgType === value ? "border-[1.5px] border-[#1F65FF] bg-[#E5ECFF] font-semibold" : "border border-[#E0E0E0] bg-white font-medium hover:border-gray-400"}`}>
                <input type="radio" name="signup-org-type" value={value} checked={orgType === value} onChange={() => setOrgType(value)} className="sr-only" />
                {/* eslint-disable-next-line @next/next/no-img-element -- static icon */}
                <img src={`/images/auth/signin/radio-${orgType === value ? "on" : "off"}.svg`} alt="" width={18} height={18} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {orgType === "ORGANIZATION" && (
          <div>
            <label htmlFor="signup-org-name" className={authLabelClass}>Organization name<Required /></label>
            <input id="signup-org-name" type="text" required minLength={2} maxLength={150} placeholder="e.g. Iconic Event Planner" value={orgName} onChange={(e) => setOrgName(e.target.value)} disabled={isSubmitting} className={authInputClass} />
          </div>
        )}
        <div>
          <label htmlFor="signup-password" className={authLabelClass}>Password<Required /></label>
          <PasswordInput id="signup-password" value={password} onChange={setPassword} placeholder={INPUT_PLACEHOLDERS.auth.password} autoComplete="new-password" disabled={isSubmitting} />
        </div>
        <div>
          <label htmlFor="signup-confirm" className={authLabelClass}>Confirm Password<Required /></label>
          <PasswordInput id="signup-confirm" value={confirmPassword} onChange={setConfirmPassword} placeholder={INPUT_PLACEHOLDERS.auth.confirmPassword} autoComplete="new-password" disabled={isSubmitting} />
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm font-medium leading-[22px]">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={isSubmitting} className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-[#1F65FF]" />
          <span>
            I agree to receive product updates and special offers via WhatsApp and SMS. You can withdraw consent anytime.
            <br />
            More info in <Link href="/contact" className="font-semibold text-[#1F65FF] underline">Privacy Policy</Link>.
          </span>
        </label>
        <button type="submit" disabled={isSubmitting} className={`${authPrimaryButtonClass} mt-1`}>
          {isSubmitting ? <><Spinner /> Creating account…</> : "Register"}
        </button>
      </form>
    </AuthPage>
  );
}

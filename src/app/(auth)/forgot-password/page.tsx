"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import { useAlert } from "@/context/AlertContext";
import {
  AuthAlert,
  AuthBackLink,
  AuthHeader,
  AuthLoadingShell,
  AuthPage,
  PasswordInput,
  Spinner,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthLayouts";
import { parsePortalMode, signinHref } from "@/components/auth/authPortal";
import { INPUT_PLACEHOLDERS } from "@/constants/placeholders";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

type ForgotStage = "request" | "sent" | "reset" | "done";
const MIN_NEW_PASSWORD = 10; // matches the on-screen hint in 04C-Forgot Password.pdf

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert } = useAlert();
  const tokenFromUrl = searchParams.get("token") || "";
  const { mode } = parsePortalMode(searchParams.get("mode"), "organizer");
  const loginHref = signinHref(mode);

  const [stage, setStage] = useState<ForgotStage>(tokenFromUrl ? "reset" : "request");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const goBack = () => {
    setErrorMessage("");
    if (stage === "sent") setStage("request");
    else if (stage === "reset" && !tokenFromUrl) setStage("sent");
    else router.push(loginHref);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.success) setStage("sent");
      else setErrorMessage(res.message || "Failed to process request. Please try again.");
    } catch {
      setErrorMessage(ERROR_MESSAGES.network.genericFailure);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (newPassword !== repeatPassword) {
      showAlert(ERROR_MESSAGES.auth.passwordsDoNotMatch, "error", "Password not matching");
      return;
    }
    if (newPassword.length < MIN_NEW_PASSWORD) {
      setErrorMessage(ERROR_MESSAGES.auth.passwordResetMinLength);
      return;
    }
    if (!resetToken.trim()) {
      setErrorMessage("A reset code is required. Use the link from your email.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(resetToken.trim(), newPassword);
      if (res.success) setStage("done");
      else setErrorMessage(res.message || "Failed to reset password. The link may be invalid or expired.");
    } catch {
      setErrorMessage(ERROR_MESSAGES.network.genericFailure);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPage>
      {errorMessage && <AuthAlert tone="error">{errorMessage}</AuthAlert>}

      {stage === "request" && (
        <>
          <AuthHeader title="Forgot password" prompt="No worries! Enter email address below, and we'll send you a link to reset your password." />
          <form onSubmit={handleRequest} className="flex flex-col gap-6">
            <div>
              <label htmlFor="forgot-email" className={authLabelClass}>
                Email Address<span className="text-[#D92D20]">*</span>
              </label>
              <input id="forgot-email" type="email" required autoComplete="email" placeholder={INPUT_PLACEHOLDERS.auth.email}
                value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} className={authInputClass} />
            </div>
            <button type="submit" disabled={isSubmitting} className={authPrimaryButtonClass}>
              {isSubmitting ? (<><Spinner /> Submitting...</>) : "Submit"}
            </button>
          </form>
        </>
      )}

      {stage === "sent" && (
        <>
          <div className="flex h-14 w-14 items-center justify-center self-center rounded-full bg-[#D6E4FF]">
            <span className="w-9 h-9 rounded-full bg-[#1F65FF] flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <AuthHeader title="Check your email" prompt={`We sent a password reset link to ${email || "your email"}. Please check your inbox.`} />
          <a href="https://mail.google.com" target="_blank" rel="noreferrer" className={authPrimaryButtonClass}>
            Open Gmail
          </a>
          <button type="button" onClick={() => setStage("reset")} className={`w-full text-sm ${authLinkClass}`}>
            I have a reset code
          </button>
          <p className="text-center text-sm font-medium text-[#666D80]">
            Don&apos;t received the email?{" "}
            <button type="button" onClick={() => setStage("request")} className={authLinkClass}>
              Resend
            </button>
          </p>
        </>
      )}

      {stage === "reset" && (
        <>
          <AuthHeader title="Create a new password" prompt="Enter your new password below to complete the reset process. Ensure it's strong and secure" />
          <form onSubmit={handleReset} className="space-y-4">
            {!tokenFromUrl && (
              <div>
                <label htmlFor="reset-token" className={authLabelClass}>
                  Reset Code<span className="text-[#D92D20]">*</span>
                </label>
                <input id="reset-token" type="text" required placeholder={INPUT_PLACEHOLDERS.auth.resetCode}
                  value={resetToken} onChange={(e) => setResetToken(e.target.value)} disabled={isSubmitting} className={authInputClass} />
              </div>
            )}
            <div>
              <label htmlFor="reset-new" className={authLabelClass}>
                New Password<span className="text-[#D92D20]">*</span>
              </label>
              <PasswordInput id="reset-new" value={newPassword} onChange={setNewPassword} placeholder={INPUT_PLACEHOLDERS.auth.password}
                autoComplete="new-password" disabled={isSubmitting} />
              <p className="mt-1.5 text-xs text-[#5C5C5C] text-right">Must be at least {MIN_NEW_PASSWORD} characters</p>
            </div>
            <div>
              <label htmlFor="reset-repeat" className={authLabelClass}>
                Repeat New Password<span className="text-[#D92D20]">*</span>
              </label>
              <PasswordInput id="reset-repeat" value={repeatPassword} onChange={setRepeatPassword} placeholder={INPUT_PLACEHOLDERS.auth.password}
                autoComplete="new-password" disabled={isSubmitting} />
            </div>
            <button type="submit" disabled={isSubmitting} className={`${authPrimaryButtonClass} mt-2`}>
              {isSubmitting ? (<><Spinner /> Resetting...</>) : "Submit"}
            </button>
          </form>
        </>
      )}

      {stage === "done" && (
        <>
          <div className="flex h-14 w-14 items-center justify-center self-center rounded-full bg-[#C7F5D9]">
            <svg className="w-7 h-7 text-[#15803D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <AuthHeader title="Your password has been successfully reset!" prompt="You can now log in with your new password. If you encounter any issues, please contact support" />
          <Link href={loginHref} className={authPrimaryButtonClass}>
            Back to login
          </Link>
        </>
      )}
      {stage !== "done" && <AuthBackLink label={stage === "request" ? "Back to log in" : "Back"} onClick={goBack} />}
    </AuthPage>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthLoadingShell />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

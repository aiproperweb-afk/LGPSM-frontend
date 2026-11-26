"use client";

import SocialSignIn from "@/components/auth/SocialSignIn";
import React, { Suspense, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import {
  AuthAlert,
  AuthCornerLink,
  AuthHeader,
  AuthLoadingShell,
  AuthPage,
  OrDivider,
  PasswordInput,
  Spinner,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthLayouts";
import {
  PortalMode,
  forgotPasswordHref,
  signinHref,
  isSafeReturnPath,
  clearExplicitLogout,
  parsePortalMode,
  portalRole,
} from "@/components/auth/authPortal";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { canAccessRoute } from "@/components/sidebar/navConfig";
import { applyRememberChoice, forgetRememberedEmail, readRememberedEmail } from "@/utils/rememberedLogin";
import { createPortal } from "react-dom";
import BrandLoader from "@/components/common/BrandLoader";
import { savePendingVerification } from "@/utils/pendingVerification";

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleLogin } = useAuth();
  const { showAlert } = useAlert();

  const initial = parsePortalMode(searchParams.get("mode"));
  const mode: PortalMode = initial.mode;
  // The remembered email is read from localStorage without an effect: the server render sees "" and the
  // browser sees the saved value, which useSyncExternalStore reconciles without a hydration mismatch.
  const remembered = useSyncExternalStore(subscribeToStorage, () => readRememberedEmail(localStorage, mode), () => "");
  const [typedEmail, setTypedEmail] = useState<string | null>(null);
  const email = typedEmail ?? remembered;
  const [password, setPassword] = useState("");
  const [rememberChoice, setRememberChoice] = useState<boolean | null>(null);
  const rememberMe = rememberChoice ?? remembered !== "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set once a sign-in succeeds and never reset: the page is on its way out, so the loader covers the wait for the dashboard
  const [entering, setEntering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSuccess = (role?: string) => {
    setEntering(true);
    // Tells the dashboard to open behind the same loader, so the hand-off from sign-in is one continuous animation
    try { sessionStorage.setItem("lgpsm_signing_in", "1"); } catch { /* storage blocked: the loader just ends with the page change */ }
    clearExplicitLogout();
    const newAccountPending = sessionStorage.getItem("lgpsm_new_account_popup_pending") === "true";
    if (newAccountPending) {
      sessionStorage.removeItem("lgpsm_new_account_popup_pending");
      sessionStorage.setItem("show_dashboard_popup", "true");
    } else {
      // Clear any stale flag left by an earlier session: returning accounts never see onboarding again.
      sessionStorage.removeItem("show_dashboard_popup");
    }
    const from = searchParams.get("from");
    // Return to the earlier page only when this account may open it; otherwise (for example a different role
    // signing in after someone else's session ended) start from the dashboard
    if (isSafeReturnPath(from) && canAccessRoute(role, from.split("?")[0])) {
      router.push(from);
    } else {
      router.push("/dashboard");
    }
  };

  const isVerifiedParam = searchParams.get("verified") === "true";

  // "Sign in with Google" (organizers): the server verifies Google's token and signs the organizer in, or creates the account
  const handleGoogle = async (credential: string) => {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const res = await googleLogin(credential);
      if (res.success) onSuccess(res.data?.user?.role);
      else showAlert(res.message || "Google sign-in did not work. Please try again.", "error", "Google sign-in");
    } catch {
      setErrorMessage(ERROR_MESSAGES.network.genericFailure);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const res = await login({ email, password, role: portalRole(mode) });
      if (res.success) {
        // Only a confirmed sign-in is remembered, so a mistyped address is never saved
        applyRememberChoice(localStorage, mode, email, rememberMe);
        onSuccess(res.data?.user?.role);
      } else if (res.message?.includes("EMAIL_NOT_VERIFIED")) {
        savePendingVerification(email, "email");
        router.push("/verify-email");
      } else if (res.message?.includes("PHONE_NOT_VERIFIED")) {
        savePendingVerification(email, "phone");
        router.push("/verify-email?step=phone");
      } else {
        showAlert(res.message || ERROR_MESSAGES.auth.incorrectPassword, "error", "Incorrect password");
      }
    } catch {
      setErrorMessage(ERROR_MESSAGES.network.genericFailure);
    } finally {
      setIsSubmitting(false);
    }
  };

  const admin = mode === "admin";
  return (
    <AuthPage
      // the two portals are separate pages: each links to the other from its top right corner
      corner={admin ? <AuthCornerLink href={signinHref("organizer")}>Organizer log in</AuthCornerLink> : <AuthCornerLink href={signinHref("admin")}>Super Admin</AuthCornerLink>}
    >
      {/* Portalled to <body>: the auth card is animated, which would otherwise trap a fixed overlay inside it */}
      {entering && createPortal(<div className="fixed inset-0 z-[100]"><BrandLoader label="Signing in" /></div>, document.body)}
      <AuthHeader
        title={admin ? "Super Admin Log in" : "Log in"}
        prompt={admin ? "Welcome back! Log in to the admin dashboard" : <>Don&apos;t have an account? <Link href="/signup" className={authLinkClass}>Sign Up</Link></>}
      />
      {!admin && (
        <>
          <SocialSignIn mode="signin" onGoogle={handleGoogle} disabled={isSubmitting} />
          <OrDivider />
        </>
      )}
      {searchParams.get("notice") === "inactive" && <AuthAlert tone="error">Your account has been deactivated. Please contact your administrator.</AuthAlert>}
      {!admin && searchParams.get("notice") === "mobile-only" && (
        <AuthAlert tone="info">On-ground staff sign in through the EventQRapp mobile app. Organizers can sign in here.</AuthAlert>
      )}
      {isVerifiedParam && <AuthAlert tone="success">Your account is verified. Please log in to access your dashboard.</AuthAlert>}
      {errorMessage && <AuthAlert tone="error">{errorMessage}</AuthAlert>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="signin-email" className={authLabelClass}>Email address</label>
            <input id="signin-email" type="email" required autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setTypedEmail(e.target.value)} disabled={isSubmitting} className={authInputClass} />
          </div>
          <div>
            <label htmlFor="signin-password" className={authLabelClass}>Password</label>
            <PasswordInput id="signin-password" value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" disabled={isSubmitting} hiddenIcon="eye" />
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <Link href={forgotPasswordHref(mode)} className={authLinkClass}>Forgot password?</Link>
              <label className="flex cursor-pointer items-center gap-2 font-medium text-[#666D80]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => {
                    setRememberChoice(e.target.checked);
                    if (!e.target.checked) {
                      // Forget the saved address right away, not only at the next successful sign-in; otherwise leaving the
                      // page (or a failed attempt) keeps it saved and the box comes back ticked. Keep what is on screen.
                      setTypedEmail(email);
                      forgetRememberedEmail(localStorage, mode);
                    }
                  }}
                  className="size-4 cursor-pointer accent-[#1F65FF]"
                />
                Remember me
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button type="submit" disabled={isSubmitting} className={authPrimaryButtonClass}>
            {isSubmitting ? <><Spinner /> Logging in...</> : "Log in"}
          </button>
          {!admin && <Link href="/account-recovery" className="text-sm font-semibold text-[#000B2C] hover:text-[#1A56DB] hover:underline">Can&apos;t Access Your Account?</Link>}
        </div>
      </form>
    </AuthPage>
  );
}

// The form is keyed by the portal in the URL: switching tab, or pressing Back from one tab to the other, mounts a fresh form,
// so an email, password or error from the other portal can never carry over (they are different sign-ins).
function PortalSignin() {
  const mode = parsePortalMode(useSearchParams().get("mode")).mode;
  return <SigninContent key={mode} />;
}

export default function SigninPage() {
  return (
    <Suspense fallback={<AuthLoadingShell />}>
      <PortalSignin />
    </Suspense>
  );
}

"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VerificationFlow from "@/components/auth/VerificationFlow";
import { AuthBackLink, AuthLoadingShell, AuthPage } from "@/components/auth/AuthLayouts";
import { signinHref } from "@/components/auth/authPortal";
import { readPendingVerification, type VerificationStep } from "@/utils/pendingVerification";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";
  const wantsPhone = searchParams.get("step") === "phone";
  // browser storage is read after the first render, so the server and the browser draw the same thing first
  const [start, setStart] = useState<{ email: string; step: VerificationStep } | null>(null);
  useEffect(() => {
    const pending = readPendingVerification();
    const email = urlEmail || pending?.email || "";
    const step: VerificationStep = wantsPhone || (!urlEmail && pending?.step === "phone") ? "phone" : "email";
    void Promise.resolve().then(() => setStart({ email, step }));
  }, [urlEmail, wantsPhone]);

  if (!start) return <AuthLoadingShell />;
  return (
    <AuthPage>
      <VerificationFlow initialEmail={start.email} initialStep={start.step} sendPhoneCodeOnOpen={wantsPhone} />
      <AuthBackLink href={signinHref("organizer")} label="Back to log in" />
    </AuthPage>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthLoadingShell />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

"use client";

import React, { useCallback } from "react";
import ModalClose from "@/components/common/ModalClose";
import CodeEntry from "@/components/auth/CodeEntry";
import { userService } from "@/services/userService";

/** Verifying the sign-in email of an account an administrator created, with a code sent to it. */
export default function VerifyEmailModal({ email, onClose, onVerified }: { email: string; onClose: () => void; onVerified: () => void | Promise<void> }) {
  const send = useCallback(() => userService.sendEmailCode(), []);
  const verify = async (code: string) => {
    const res = await userService.verifyEmail(code);
    if (res.success) await onVerified();
    return res;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="verify-email-title">
      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-xl bg-white p-6 text-[#000B2C] shadow-2xl">
        <ModalClose onClick={onClose} />
        <div>
          <h2 id="verify-email-title" className="pr-8 text-lg font-semibold">Verify your email address</h2>
          <p className="mt-1 text-sm text-[#666D80]">Enter the 6-digit code sent to <span className="break-all font-semibold text-[#000B2C]">{email}</span>.</p>
        </div>
        <CodeEntry onVerify={verify} onResend={send} sendOnOpen submitLabel="Verify email" />
      </div>
    </div>
  );
}

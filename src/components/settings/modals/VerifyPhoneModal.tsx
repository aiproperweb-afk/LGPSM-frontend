"use client";

import { useDashboardCopy } from "@/components/cms/DashboardCopyProvider";

import React, { useCallback } from "react";
import ModalClose from "@/components/common/ModalClose";
import CodeEntry from "@/components/auth/CodeEntry";
import { userService } from "@/services/userService";

/** Verifying the profile's mobile number with a code sent by text message. */
export default function VerifyPhoneModal({ phone, onClose, onVerified }: { phone: string; onClose: () => void; onVerified: () => void | Promise<void> }) {
  const cmsText = useDashboardCopy();
  const send = useCallback(() => userService.sendPhoneCode(), []);
  const verify = async (code: string) => {
    const res = await userService.verifyPhone(code);
    if (res.success) await onVerified();
    return res;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="verify-phone-title">
      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-xl bg-white p-6 text-[#000B2C] shadow-2xl">
        <ModalClose onClick={onClose} />
        <div>
          <h2 id="verify-phone-title" className="pr-8 text-lg font-semibold">{cmsText("verifyYourMobileNumber", "Verify your mobile number")}</h2>
          <p className="mt-1 text-sm text-[#666D80]">{cmsText("enterThe6DigitCodeSentByText", "Enter the 6-digit code sent by text message to") + " "}<span className="whitespace-nowrap font-semibold text-[#000B2C]">+91 {phone.slice(-10)}</span>.</p>
        </div>
        <CodeEntry onVerify={verify} onResend={send} sendOnOpen submitLabel="Verify number" />
      </div>
    </div>
  );
}

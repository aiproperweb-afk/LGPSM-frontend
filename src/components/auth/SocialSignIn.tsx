"use client";

import React from "react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { useAlert } from "@/context/AlertContext";

/** The two buttons above the form: Google (working) and Facebook (shown in the design, not built yet, and says so). */
export default function SocialSignIn({ mode, onGoogle, disabled = false }: { mode: "signin" | "signup"; onGoogle: (credential: string) => void | Promise<void>; disabled?: boolean }) {
  const { showAlert } = useAlert();
  return (
    // one above the other on a narrow phone: Google's button does not fit half of one
    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
      <GoogleAuthButton mode={mode} onCredential={onGoogle} disabled={disabled} />
      <button
        type="button"
        disabled={disabled}
        aria-label={mode === "signup" ? "Sign up with Facebook (coming soon)" : "Sign in with Facebook (coming soon)"}
        onClick={() => showAlert("Facebook sign-in is coming soon. Please use Google, or your email and password, for now.", "info", "Facebook sign-in")}
        className="flex h-11 items-center justify-center rounded-lg border border-[#E0E0E0] bg-white hover:bg-[#F8F9FA] cursor-pointer disabled:opacity-60"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static icon */}
        <img src="/images/auth/signin/facebook.svg" alt="" width={20} height={20} />
      </button>
    </div>
  );
}

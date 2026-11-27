"use client";

import React from "react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

/** The button above the form: sign in or sign up with Google. */
export default function SocialSignIn({ mode, onGoogle, disabled = false }: { mode: "signin" | "signup"; onGoogle: (credential: string) => void | Promise<void>; disabled?: boolean }) {
  return <GoogleAuthButton mode={mode} onCredential={onGoogle} disabled={disabled} />;
}

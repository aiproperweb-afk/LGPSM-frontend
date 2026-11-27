"use client";

import React, { useEffect, useRef, useState } from "react";
import PopupMessage from "@/components/common/PopupMessage";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

interface GoogleIdentity {
  accounts: { id: { initialize: (config: object) => void; renderButton: (el: HTMLElement, options: object) => void } };
}
declare global {
  interface Window { google?: GoogleIdentity }
}

let scriptPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => { scriptPromise = null; reject(new Error("Google's sign-in could not be loaded")); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/**
 * "Sign in with Google" for organizers (sign-in and sign-up), across the row above the form. Google draws its own button (its rules
 * require that); `onCredential` receives the signed ID token, which the server verifies. Until a client id is configured
 * (NEXT_PUBLIC_GOOGLE_CLIENT_ID) a button of the same size says that Google sign-in is not set up yet when it is pressed.
 */
export default function GoogleAuthButton({ mode, onCredential, disabled = false }: { mode: "signin" | "signup"; onCredential: (credential: string) => void | Promise<void>; disabled?: boolean }) {
  const slot = useRef<HTMLDivElement>(null);
  const latest = useRef(onCredential);
  useEffect(() => { latest.current = onCredential; });
  const [problem, setProblem] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !slot.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response: { credential?: string }) => { if (response.credential) void latest.current(response.credential); },
          ux_mode: "popup",
          auto_select: false,
        });
        slot.current.replaceChildren();
        window.google.accounts.id.renderButton(slot.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: mode === "signup" ? "signup_with" : "signin_with",
          logo_alignment: "center",
          // as wide as the row: Google accepts 200 to 400px, and a button wider than its box would have its side borders cut off
          width: Math.min(400, slot.current.parentElement?.clientWidth || 320),
        });
        setReady(true);
      })
      .catch((e: Error) => { if (!cancelled) setProblem(e.message); });
    return () => { cancelled = true; };
  }, [mode]);

  return (
    <div className={`min-w-0 ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      {CLIENT_ID ? (
        <div className="flex h-11 w-full flex-col items-center justify-center overflow-hidden">
          {/* Google's script owns everything inside this div: React never renders children into it, so the two cannot fight over its nodes */}
          <div ref={slot} aria-label="Continue with Google" className="flex w-full justify-center" />
          {!ready && !problem && <span className="text-xs text-[#6B6B6B]">Loading Google…</span>}
        </div>
      ) : (
        <button
          type="button"
          aria-label={mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
          onClick={() => setProblem("Google sign-in is not set up yet. Please use your email and password for now.")}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#E0E0E0] bg-white text-sm font-medium text-[#3C4043] hover:bg-[#F8F9FA] cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static icon */}
          <img src="/images/auth/signin/google.svg" alt="" width={20} height={20} />
          {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
        </button>
      )}
      <PopupMessage message={problem} title="Google sign-in" />
    </div>
  );
}

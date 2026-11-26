// A sign-up that still needs its code(s), remembered for this browser tab so that a reload comes back to the right step.

export type VerificationStep = "email" | "phone";

const EMAIL = "lgpsm_pending_verification_email";
const STEP = "lgpsm_pending_verification_step";

interface Store {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const tab = (): Store | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

export function savePendingVerification(email: string, step: VerificationStep, store: Store | null = tab()): void {
  try {
    store?.setItem(EMAIL, email.trim());
    store?.setItem(STEP, step);
  } catch {
    /* storage blocked: the page still works, a reload just starts over */
  }
}

export function readPendingVerification(store: Store | null = tab()): { email: string; step: VerificationStep } | null {
  try {
    const email = store?.getItem(EMAIL) || "";
    return email ? { email, step: store?.getItem(STEP) === "phone" ? "phone" : "email" } : null;
  } catch {
    return null;
  }
}

export function clearPendingVerification(store: Store | null = tab()): void {
  try {
    store?.removeItem(EMAIL);
    store?.removeItem(STEP);
  } catch {
    /* ignore */
  }
}

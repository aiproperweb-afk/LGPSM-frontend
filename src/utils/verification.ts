export interface VerificationPending { email: boolean; phone: boolean }

/** What an account still has to verify before it can create events or send invitations, in words; "" when nothing */
export function pendingText(pending: VerificationPending | null | undefined): string {
  if (!pending || (!pending.email && !pending.phone)) return "";
  const what = [pending.email ? "email address" : "", pending.phone ? "mobile number" : ""].filter(Boolean).join(" and ");
  return `Verify your ${what} to create events and send invitations.`;
}

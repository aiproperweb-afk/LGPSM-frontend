"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { pendingText } from "@/utils/verification";

/** Shown on every page to an organizer whose account an administrator created, until they have verified it */
export default function VerificationBanner() {
  const { user } = useAuth();
  const pathname = usePathname();
  const text = pendingText(user?.verificationPending);
  if (!text) return null;
  return (
    <div role="status" className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-[#FDE68A] bg-[#FFFBEB] px-4 sm:px-6 py-2.5 text-sm text-[#854D0E]">
      <span className="min-w-0">{text}</span>
      {pathname !== "/settings/account" && <Link href="/settings/account" className="shrink-0 font-semibold text-[#1F65FF] underline">Verify in Account Settings</Link>}
    </div>
  );
}

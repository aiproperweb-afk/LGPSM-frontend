"use client";

import React, { useState } from "react";
import { authService } from "@/services/authService";
import PhoneField from "@/components/auth/PhoneField";
import { AuthAlert, PasswordInput, Spinner, authLabelClass, authLinkClass, authPrimaryButtonClass } from "@/components/auth/AuthLayouts";

/** "Change mobile number" on the mobile-code step of sign-up: the number was typed wrongly. The sign-up password proves who is asking. */
export default function ChangePhoneForm({ email, knownPassword, onChanged, onCancel }: {
  email: string;
  knownPassword?: string;
  onChanged: (phone: string) => void;
  onCancel: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length !== 10) return setError("Enter your 10-digit mobile number.");
    setBusy(true);
    try {
      const res = await authService.changePendingPhone(email, knownPassword || password, phone);
      if (res.success) onChanged(res.data?.phone || phone);
      else setError(res.message || "Could not change the mobile number. Please try again.");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-[#E0E0E0] bg-[#F7F9FF] p-4 text-left">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <div>
        <label htmlFor="change-phone-new" className={authLabelClass}>Correct mobile number</label>
        <PhoneField id="change-phone-new" value={phone} onChange={setPhone} disabled={busy} />
      </div>
      {!knownPassword && (
        <div>
          <label htmlFor="change-phone-password" className={authLabelClass}>Your password</label>
          <PasswordInput id="change-phone-password" value={password} onChange={setPassword} placeholder="The password you chose when signing up" autoComplete="current-password" disabled={busy} />
        </div>
      )}
      <button type="submit" disabled={busy || !phone || (!knownPassword && !password)} className={authPrimaryButtonClass}>
        {busy ? <><Spinner /> Sending…</> : "Send code to this number"}
      </button>
      <button type="button" onClick={onCancel} disabled={busy} className={`self-center text-sm ${authLinkClass}`}>Cancel</button>
    </form>
  );
}

"use client";

import React, { useState } from "react";
import PhoneInput, { PhoneNote } from "@/components/common/PhoneInput";

/** An Indian mobile number: the country code on the left, then the 10 digits (the only kind the platform sends to). */
export default function PhoneField({ id, value, onChange, disabled, placeholder = "Enter phone number" }: { id: string; value: string; onChange: (digits: string) => void; disabled?: boolean; placeholder?: string }) {
  const [note, setNote] = useState<string | null>(null);
  return (
    <>
      <div className="flex h-[47px] items-center gap-3 rounded-md border border-[#E0E0E0] bg-white px-4 transition-colors focus-within:border-[#1F65FF] focus-within:ring-[3px] focus-within:ring-[#1F65FF]/[0.18]">
        <span className="relative flex h-full items-center border-r border-[#E0E0E0] pr-3">
          <select aria-label="Country code" defaultValue="+91" disabled={disabled} className="cursor-pointer appearance-none bg-transparent pr-5 text-sm font-medium text-[#000B2C] focus:outline-none">
            <option value="+91">+91</option>
          </select>
          {/* eslint-disable-next-line @next/next/no-img-element -- static icon */}
          <img src="/images/auth/signin/chevron-down.svg" alt="" width={16} height={16} className="pointer-events-none absolute right-3" />
        </span>
        <PhoneInput
          id={id}
          required
          autoComplete="tel-national"
          placeholder={placeholder}
          value={value}
          onValueChange={onChange}
          onNote={setNote}
          disabled={disabled}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#000B2C] placeholder:text-[#898B8D] focus:outline-none disabled:opacity-60"
        />
      </div>
      <PhoneNote message={note} />
    </>
  );
}

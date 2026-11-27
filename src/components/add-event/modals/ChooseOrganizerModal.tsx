"use client";

import React, { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import type { UserData } from "@/services/tokenStorage";
import { matchOptions } from "@/utils/searchOptions";

/**
 * An administrator's first step of Add Event: who the event is for, chosen before the template (the templates offered depend on it). "My
 * admin account" creates it under the administrator.
 */
export default function ChooseOrganizerModal({ onChoose, onLeave }: { onChoose: (organizerId: string | null) => void; onLeave: () => void }) {
  const [organizers, setOrganizers] = useState<UserData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // undefined: nothing picked yet; null: the administrator's own account
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    userService.getUsers("ORGANIZER").then((res) => {
      if (!live) return;
      if (res.success && Array.isArray(res.data)) { setOrganizers(res.data.filter((u) => !u.role || u.role === "ORGANIZER")); setError(null); }
      else setError(res.message || "The organizers could not be loaded.");
    });
    return () => { live = false; };
  }, [attempt]);

  const options = matchOptions(
    (organizers ?? []).map((o) => ({ value: o._id, label: o.profile?.organizationName || o.fullName || o.email, hint: [o.fullName, o.email].filter(Boolean).join(" · ") })),
    search
  );
  const row = (selected: boolean) => `flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left cursor-pointer ${selected ? "border-[#1F65FF] bg-[#F5F8FF]" : "border-[#E0E0E0] hover:bg-gray-50"}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-overlay" role="dialog" aria-modal="true" aria-labelledby="choose-organizer-title">
      <form onSubmit={(e) => { e.preventDefault(); if (picked !== undefined) onChoose(picked); }} className="w-full max-w-lg bg-white rounded-lg shadow-2xl flex flex-col max-h-[90vh] animate-modal">
        <div className="px-6 py-4 border-b border-[#E5E5E5]">
          <h2 id="choose-organizer-title" className="text-base font-medium text-gray-900">Who is this event for?</h2>
          <p className="mt-1 text-sm text-[#4B4F52]">Choose the organizer first. You choose the template next.</p>
        </div>
        <div className="px-6 pt-4 space-y-3">
          <label className="block">
            <span className="sr-only">Search organizers</span>
            <input type="search" autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search organizer by name or email" className="w-full h-[44px] px-3.5 text-sm bg-[#FAFAFA] border border-[#E0E0E0] rounded-md focus:outline-none focus:border-black" />
          </label>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2 min-h-[200px]" role="radiogroup" aria-label="Organizer">
          <button type="button" role="radio" aria-checked={picked === null} onClick={() => setPicked(null)} className={row(picked === null)}>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#15191C]">My admin account</span>
              <span className="block text-xs text-[#6B6B6B]">The event is created under your own account, with no organizer.</span>
            </span>
          </button>
          {error ? (
            <p role="alert" className="py-4 text-center text-sm text-rose-600">{error} <button type="button" onClick={() => setAttempt((n) => n + 1)} className="underline cursor-pointer">Try again</button></p>
          ) : organizers === null ? (
            <p role="status" className="py-4 text-center text-sm text-[#6B6B6B]">Loading organizers…</p>
          ) : options.length === 0 ? (
            <p className="py-4 text-center text-sm text-[#6B6B6B]">{search.trim() ? "No organizer matches your search." : "There are no active organizers yet."}</p>
          ) : (
            options.map((o) => (
              <button key={o.value} type="button" role="radio" aria-checked={picked === o.value} onClick={() => setPicked(o.value)} onDoubleClick={() => onChoose(o.value)} className={row(picked === o.value)}>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#15191C] break-words">{o.label}</span>
                  <span className="block text-xs text-[#6B6B6B] break-all">{o.hint}</span>
                </span>
              </button>
            ))
          )}
        </div>
        <div className="px-6 py-4 border-t border-[#E5E5E5] flex items-center justify-between gap-3">
          <button type="button" onClick={onLeave} className="text-sm text-gray-700 hover:underline cursor-pointer">Leave Add Event</button>
          <button type="submit" disabled={picked === undefined} className="px-6 py-2.5 bg-[#1F65FF] hover:bg-[#1A56DB] text-white text-sm font-medium rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Continue</button>
        </div>
      </form>
    </div>
  );
}

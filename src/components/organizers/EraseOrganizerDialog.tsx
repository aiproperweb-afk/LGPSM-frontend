"use client";

import React, { useEffect, useState } from "react";
import AlertIcon from "@/components/common/AlertIcon";
import { userService, type OrganizerEraseSummary } from "@/services/userService";
import { formatMoney } from "@/utils/money";

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The warning shown before an organizer is deleted for good: exactly what goes with them */
export default function EraseOrganizerDialog({ organizerId, name, onClose, onErased }: { organizerId: string; name: string; onClose: () => void; onErased: () => void }) {
  const [summary, setSummary] = useState<OrganizerEraseSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    userService.getEraseSummary(organizerId).then((r) => {
      if (!live) return;
      if (r.success && r.data) setSummary(r.data);
      else setError(r.message || "What would be deleted could not be loaded, so nothing can be deleted yet.");
    });
    return () => { live = false; };
  }, [organizerId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const erase = async () => {
    setBusy(true);
    setError(null);
    const r = await userService.eraseOrganizer(organizerId);
    setBusy(false);
    if (!r.success) return setError(r.message || "The organizer could not be deleted. Press Delete again to finish.");
    onErased();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="erase-organizer-title" aria-describedby="erase-organizer-text">
      <div className="w-full max-w-[460px] bg-white border border-[#E5E5E5] rounded-lg overflow-y-auto max-h-[calc(100dvh-2rem)]">
        <div className="px-6 pt-7 pb-5 flex flex-col items-center text-center gap-3">
          <AlertIcon kind="warning" className="w-14 h-14" />
          <h2 id="erase-organizer-title" className="text-lg font-bold text-[#15191C] break-words">Delete “{name}” permanently?</h2>
          <div id="erase-organizer-text" className="w-full text-sm text-[#4B4F52] space-y-3">
            <p>This cannot be undone. To only stop them signing in, use <b>Deactivate</b> instead.</p>
            {!summary && !error && <p role="status">Checking what would be deleted…</p>}
            {summary && (
              <>
                <p className="break-words">The account <b>{summary.email}</b> is deleted together with:</p>
                <ul className="mx-auto w-fit text-left list-disc pl-5 space-y-1">
                  <li>{count(summary.events, "event")}</li>
                  <li>{count(summary.invitees, "invitee")} and {count(summary.checkIns, "check-in record")}</li>
                  <li>{count(summary.invoices, "invoice")} and their payment records</li>
                  <li>{count(summary.systemUsers, "system user")} and {count(summary.templates, "template")} of theirs</li>
                </ul>
                {summary.openEvents > 0 && <p className="rounded-md bg-[#FEF3F2] px-3 py-2 text-[#B42318]">{count(summary.openEvents, "event")} {summary.openEvents === 1 ? "has" : "have"} not ended. The guests&apos; QR codes stop working at once, and they are not told.</p>}
                {summary.amountDue > 0 && <p className="rounded-md bg-[#FFFBEB] px-3 py-2 text-[#854D0E]">{formatMoney(summary.amountDue)} is still owed by this organizer. Deleting removes that record.</p>}
              </>
            )}
            {error && <p role="alert" className="text-[#D92D20]">{error}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#E5E5E5]">
          <button type="button" autoFocus onClick={onClose} disabled={busy} className="px-6 py-[11px] bg-white border border-[#DDD] rounded-lg text-base font-semibold text-black cursor-pointer disabled:opacity-50">Cancel</button>
          <button type="button" onClick={() => void erase()} disabled={busy || !summary} className="px-6 py-[11px] bg-[#D92D20] hover:bg-[#B42318] rounded-lg text-base font-semibold text-white cursor-pointer disabled:opacity-60">{busy ? "Deleting…" : "Delete permanently"}</button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Icon from "@/components/icons/Icon";
import PhoneInput from "@/components/common/PhoneInput";
import { userService } from "@/services/userService";
import type { UserData } from "@/services/tokenStorage";
import { organizerChanges, organizerForm, organizerFormProblem, type OrganizerForm } from "@/utils/organizerForm";

const field = "w-full h-[47px] px-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-md text-sm font-medium text-[#15191C] focus:outline-none focus:border-[#1F65FF]";
const label = "block text-xs font-medium text-[#15191C] mb-2";

/** Admin: change an organizer's type, names, email and mobile number */
export default function EditOrganizerModal({ organizer, onClose, onSaved }: { organizer: UserData; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<OrganizerForm>(() => organizerForm(organizer));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<OrganizerForm>) => { setForm((f) => ({ ...f, ...patch })); setError(null); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = organizerFormProblem(form);
    if (problem) return setError(problem);
    const changes = organizerChanges(organizer, form);
    if (!changes) return onClose();
    setBusy(true);
    const res = await userService.updateUser(organizer._id, changes);
    setBusy(false);
    if (!res.success) return setError(res.message || "The changes could not be saved.");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-organizer-title">
      <form onSubmit={save} noValidate className="w-full max-w-[486px] bg-white border border-[#E5E5E5] rounded-lg overflow-y-auto max-h-[calc(100dvh-2rem)]">
        <div className="flex items-center gap-5 px-6 py-5 border-b border-[#E0E0E0]">
          <h2 id="edit-organizer-title" className="flex-1 min-w-0 text-base font-medium text-[#15191C]">Edit Organizer</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="shrink-0 cursor-pointer disabled:opacity-40"><Icon name="events/close" width={16} height={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <fieldset>
            <legend className={label}>Organizer type</legend>
            <div className="flex gap-2">
              {([["INDIVIDUAL", "Individual"], ["ORGANIZATION", "Organization"]] as const).map(([value, text]) => (
                <label key={value} className={`flex-1 flex items-center gap-2 h-[47px] px-3 rounded-md border text-sm cursor-pointer ${form.type === value ? "border-[#1F65FF] bg-[#EAF1FF] font-semibold" : "border-[#E0E0E0] bg-[#FAFAFA]"}`}>
                  <input type="radio" name="edit-organizer-type" checked={form.type === value} onChange={() => set({ type: value })} className="accent-[#1F65FF]" />
                  {text}
                </label>
              ))}
            </div>
          </fieldset>
          {form.type === "ORGANIZATION" && (
            <div>
              <label htmlFor="edit-organizer-org" className={label}>Organization name<span className="text-[#D92D20]">*</span></label>
              <input id="edit-organizer-org" maxLength={150} value={form.organizationName} onChange={(e) => set({ organizationName: e.target.value })} className={field} />
            </div>
          )}
          <div>
            <label htmlFor="edit-organizer-name" className={label}>Account name<span className="text-[#D92D20]">*</span></label>
            <input id="edit-organizer-name" maxLength={120} value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} className={field} />
          </div>
          <div>
            <label htmlFor="edit-organizer-email" className={label}>Email<span className="text-[#D92D20]">*</span></label>
            <input id="edit-organizer-email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={field} />
          </div>
          <div>
            <label htmlFor="edit-organizer-phone" className={label}>Mobile number</label>
            <PhoneInput id="edit-organizer-phone" value={form.phone} onValueChange={(phone) => set({ phone })} className={field} />
          </div>
          <p className="text-xs text-[#6B6B6B]">The organizer is told what was changed. A changed mobile number has to be verified again.</p>
          {error && <p role="alert" className="text-sm text-[#D92D20]">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#E5E5E5]">
          <button type="button" onClick={onClose} disabled={busy} className="px-6 py-[11px] bg-white border border-[#DDD] rounded-lg text-base font-semibold text-black cursor-pointer disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={busy} className="px-6 py-[11px] bg-[#1F65FF] hover:bg-[#1A56DB] rounded-lg text-base font-semibold text-white cursor-pointer disabled:opacity-60">{busy ? "Saving…" : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useDashboardCopy } from "@/components/cms/DashboardCopyProvider";

import PhoneInput from "@/components/common/PhoneInput";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

const field = "w-full h-[47px] px-4 bg-white border border-[#E0E0E0] rounded-md text-[13px] text-[#15191C] focus:outline-none focus:border-black";
const bad = (v: string, on: boolean) => (on && !v.trim() ? " !border-rose-500" : "");
const label = "block text-sm font-medium text-[#15191C] mb-2";

type Org = { name: string; phone: string; whatsapp: string; email: string; website: string; address: string; gstNumber: string };

const fromUser = (user: unknown): Org => {
  const profile = ((user as { profile?: { organization?: Partial<Org>; organizationName?: string } } | null)?.profile) || {};
  const o = profile.organization || {};
  return { name: profile.organizationName || o.name || "", phone: o.phone || "", whatsapp: o.whatsapp || "", email: o.email || "", website: o.website || "", address: o.address || "", gstNumber: o.gstNumber || "" };
};

/**
 * The organiser's organisation details as a self-contained form: the same fields on My Profile and in Settings, each
 * saving through the profile API on its own. Only organisers see it.
 */
export default function OrganisationDetailsForm() {
  const cmsText = useDashboardCopy();
  const { user, updateProfile } = useAuth();
  const { showAlert } = useAlert();
  // what the organiser has typed on top of the saved details; empty means "as saved"
  const [edits, setEdits] = useState<Partial<Org>>({});
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  if (user?.role !== "ORGANIZER") return null;
  // an individual organiser has no organisation, so there are no organisation details to keep (same rule the organiser list uses)
  const profile = (user as { profile?: { organizationType?: string; organizationName?: string } }).profile;
  if ((profile?.organizationType ?? (profile?.organizationName ? "ORGANIZATION" : "INDIVIDUAL")) === "INDIVIDUAL") return null;

  const saved = fromUser(user);
  const org: Org = { ...saved, ...edits };
  const dirty = (Object.keys(org) as (keyof Org)[]).some((k) => org[k] !== saved[k]);
  const set = (k: keyof Org) => (e: React.ChangeEvent<HTMLInputElement>) => { setEdits((o) => ({ ...o, [k]: e.target.value })); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    const problem = !org.name.trim() ? "Organisation name is required." : !org.phone.trim() ? "Organisation phone is required." : !org.email.trim() ? "Organisation email is required." : !org.whatsapp.trim() ? "WhatsApp number is required." : org.gstNumber.trim() && !/^[0-9A-Z]{15}$/.test(org.gstNumber.trim()) ? "A GST number has 15 letters and digits. Correct it, or leave it empty." : null;
    if (problem) {
      showAlert(problem, "error");
      return;
    }
    setSaving(true);
    const res = await updateProfile({ organization: { name: org.name.trim(), phone: org.phone.trim(), whatsapp: org.whatsapp.trim(), email: org.email.trim(), address: org.address.trim(), website: org.website.trim(), gstNumber: org.gstNumber.trim() } });
    setSaving(false);
    if (res.success) setEdits({});
    if (res.success) showAlert("Organisation details updated.", "success");
    else showAlert(res.message || "Could not update the organisation details.", "error");
  };

  return (
    <section className="border border-[#E5E5E5] bg-[#F8F8F8] rounded-lg p-6 sm:p-8" aria-label={cmsText("organisationDetails", "Organisation details")}>
      <h2 className="text-xl font-medium text-black mb-1">{cmsText("organisationDetails2", "Organisation Details")}</h2>
      <p className="text-xs text-[#6B6B6B] mb-5">{cmsText("shownOnYourAccountOrganisationNamePhoneEmail", "Shown on your account. Organisation name, phone, email and WhatsApp number are required.")}</p>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
          <div>
            <label htmlFor="org-name" className={label}>{cmsText("organisationName2", "Organisation name") + " "}<span className="text-rose-600">*</span></label>
            <input id="org-name" value={org.name} onChange={set("name")} maxLength={150} className={field + bad(org.name, showErrors)} />
          </div>
          <div>
            <label htmlFor="org-phone" className={label}>{cmsText("organisationPhone", "Organisation phone") + " "}<span className="text-rose-600">*</span></label>
            <PhoneInput id="org-phone" value={org.phone} onValueChange={(v) => { setEdits((o) => ({ ...o, phone: v })); }} className={field + bad(org.phone, showErrors)} />
          </div>
          <div>
            <label htmlFor="org-whatsapp" className={label}>{cmsText("whatsappNumber", "WhatsApp number") + " "}<span className="text-rose-600">*</span></label>
            <PhoneInput id="org-whatsapp" value={org.whatsapp} onValueChange={(v) => { setEdits((o) => ({ ...o, whatsapp: v })); }} className={field + bad(org.whatsapp, showErrors)} />
          </div>
          <div>
            <label htmlFor="org-email" className={label}>{cmsText("organisationEmail", "Organisation email") + " "}<span className="text-rose-600">*</span></label>
            <input id="org-email" type="email" value={org.email} onChange={set("email")} maxLength={150} className={field + bad(org.email, showErrors)} />
          </div>
          <div>
            <label htmlFor="org-website" className={label}>{cmsText("website", "Website") + " "}<span className="text-[#6B6B6B] font-normal text-xs ml-1">{cmsText("optional", "(optional)")}</span></label>
            <input id="org-website" value={org.website} onChange={set("website")} placeholder="https://" maxLength={200} className={field} />
          </div>
          <div>
            <label htmlFor="org-address" className={label}>{cmsText("address", "Address") + " "}<span className="text-[#6B6B6B] font-normal text-xs ml-1">{cmsText("optional", "(optional)")}</span></label>
            <input id="org-address" value={org.address} onChange={set("address")} maxLength={300} className={field} />
          </div>
          <div>
            <label htmlFor="org-gst" className={label}>{cmsText("gstNo", "GST No") + " "}<span className="text-[#6B6B6B] font-normal text-xs ml-1">{cmsText("optional", "(optional)")}</span></label>
            <div className="flex items-center gap-2">
              <input id="org-gst" value={org.gstNumber} onChange={(e) => setEdits((o) => ({ ...o, gstNumber: e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "") }))} maxLength={15} autoComplete="off" aria-describedby="org-gst-status" placeholder={cmsText("text15CharacterGstin", "15-character GSTIN")} className={`${field} min-w-0 flex-1`} />
              {/* nothing verifies the number yet */}
              <span id="org-gst-status" title={cmsText("thisGstNumberHasNotBeenVerified", "This GST number has not been verified")} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#FACC15] bg-[#FEF9C3] px-2.5 py-1.5 text-xs font-medium text-[#854D0E]">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>{cmsText("unverified", "Unverified")}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving || !dirty} className="px-6 py-[11px] bg-[#1F65FF] hover:bg-[#1A56DB] rounded-lg text-base font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? cmsText("saving", "Saving...") : cmsText("save", "Save")}
          </button>
          {dirty && !saving && (
            <button type="button" onClick={() => { setEdits({}); }} className="px-6 py-[11px] bg-white border border-[#E0E0E0] hover:bg-gray-50 rounded-lg text-base font-semibold text-[#15191C] cursor-pointer">{cmsText("cancel2", "Cancel")}</button>
          )}
        </div>
      </form>
    </section>
  );
}

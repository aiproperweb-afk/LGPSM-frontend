"use client";

import { useDashboardCopy } from "@/components/cms/DashboardCopyProvider";

import React, { useCallback, useEffect, useState } from "react";
import ModalClose from "@/components/common/ModalClose";
import { inviteeService, type InviteeSetInfo, type InviteeSetMember, type RemovedInviteeList } from "@/services/inviteeService";
import { formatDateTime } from "@/utils/dateTime";
import { DELIVERY_LABEL, listDisplayName, stateExplanation } from "@/utils/inviteeLists";

interface Props {
  eventId: string;
  /** Called after a list was changed, so the page can reload its guest list */
  onChanged: () => void;
  onClose: () => void;
  /** Opens the add-invitees window (only that window) on top of this one */
  onAddInvitees?: () => void;
  /** Changes after guests were added elsewhere, so the lists are fetched again */
  reloadSignal?: number;
}

// Shown only once every guest in the list has been sent their invitation: one time when they all went together, otherwise the first and the latest
const allSentLine = (s: { total: number; sent: number; firstSentAt?: string | null; lastSentAt?: string | null }): string | null => {
  if (s.total === 0 || s.sent < s.total) return null;
  if (!s.firstSentAt || !s.lastSentAt) return null;
  const first = formatDateTime(s.firstSentAt, "");
  const last = formatDateTime(s.lastSentAt, "");
  if (!first || !last) return null;
  return first === last ? first : `${first} – ${last}`;
};
const pill = (cls: string, text: string, title?: string, icon?: React.ReactNode) => <span title={title} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>{icon}{text}</span>;
const PencilIcon = () => <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 20h4l10.5-10.5a2.5 2.5 0 00-3.536-3.536L4.5 16.5V20z" /></svg>;
const BinIcon = () => <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5h6v2m-8 0l1 12h8l1-12" /></svg>;
const Lock = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z" /></svg>;

// The same shell as the Delivery History dialog: centred modal, title bar with close, table body.
// A list's Open/Locked state (a property of the list, decided by the server) is kept apart from each guest's delivery state.
export default function InviteeListsModal({ eventId, onChanged, onClose, onAddInvitees, reloadSignal = 0 }: Props) {
  const cmsText = useDashboardCopy();
  const [sets, setSets] = useState<InviteeSetInfo[] | null>(null);
  const [removedLists, setRemovedLists] = useState<RemovedInviteeList[]>([]);
  // an empty list the organizer is about to delete (asked first)
  const [dropList, setDropList] = useState<InviteeSetInfo | null>(null);
  const [dropping, setDropping] = useState(false);
  // an open list being renamed
  const [renameList, setRenameList] = useState<InviteeSetInfo | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [setsError, setSetsError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, { rows: InviteeSetMember[]; total: number; page: number } | "loading" | string>>({});

  const [outcome, setOutcome] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const loadSets = useCallback(async () => {
    setSetsError(null);
    try {
      const res = await inviteeService.getInviteeSets(eventId);
      if (res.success && res.data) { setSets([...res.data.sets, ...(res.data.sessionLists ?? [])]); setRemovedLists(res.data.removedLists ?? []); }
      else setSetsError(res.message || "The invitee lists could not be loaded.");
    } catch { setSetsError("The invitee lists could not be loaded. Check your connection and try again."); }
  }, [eventId]);

  useEffect(() => { void Promise.resolve().then(loadSets); }, [loadSets, reloadSignal]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggleSet = async (id: string) => {
    if (open === id) { setOpen(null); return; }
    setOpen(id);
    if (members[id] && members[id] !== "loading" && typeof members[id] !== "string") return;
    setMembers((m) => ({ ...m, [id]: "loading" }));
    try {
      const res = await inviteeService.getSetMembers(eventId, id);
      setMembers((m) => ({ ...m, [id]: res.success && res.data ? { rows: res.data.members, total: res.data.total, page: res.data.page } : res.message || "The guests of this list could not be loaded." }));
    } catch { setMembers((m) => ({ ...m, [id]: "The guests of this list could not be loaded." })); }
  };

  const doDropList = async () => {
    if (!dropList) return;
    setDropping(true);
    try {
      const res = await inviteeService.removeList(eventId, dropList.id);
      setOutcome(res.success
        ? { tone: "success", message: `“${listDisplayName(dropList.name)}” was deleted. It stays under Deleted lists as history.` }
        : { tone: "error", message: res.message || "The list could not be deleted." });
      if (res.success) onChanged();
    } catch { setOutcome({ tone: "error", message: "The request could not reach the server. Nothing was changed." }); }
    setDropping(false);
    setDropList(null);
    await loadSets();
  };

  const doRename = async () => {
    if (!renameList || !renameValue.trim()) return;
    setRenaming(true);
    try {
      const res = await inviteeService.renameList(eventId, renameList.id, renameValue.trim());
      setOutcome(res.success ? { tone: "success", message: "The list was renamed." } : { tone: "error", message: res.message || "The list could not be renamed." });
    } catch { setOutcome({ tone: "error", message: "The request could not reach the server. Nothing was changed." }); }
    setRenaming(false);
    setRenameList(null);
    await loadSets();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="lists-title">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <h2 id="lists-title" className="text-base font-medium text-gray-900">{cmsText("inviteesDataset2", "Invitees Dataset")}</h2>
          <div className="flex items-center gap-3">
            {onAddInvitees && (
              <button type="button" onClick={onAddInvitees} className="px-4 py-2 bg-[#1F65FF] hover:bg-[#1A56DB] text-white text-sm font-semibold rounded-md cursor-pointer">{cmsText("addInvitees", "Add Invitees")}</button>
            )}
            <button type="button" onClick={onClose} aria-label={cmsText("close", "Close")} className="size-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="p-6 overflow-auto flex-1">
          {outcome && (
            <div role="status" className={`mb-4 rounded-md border px-4 py-3 text-sm ${outcome.tone === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
              <p>{outcome.message}</p>
            </div>
          )}

              {setsError && <p role="alert" className="text-sm text-rose-600">{setsError} <button type="button" onClick={loadSets} className="underline cursor-pointer">{cmsText("tryAgain", "Try again")}</button></p>}
              {!sets && !setsError && <p className="text-sm text-[#6B6B6B]">{cmsText("loading2", "Loading…")}</p>}
              {sets && sets.length === 0 && <p className="text-sm text-[#6B6B6B]">{cmsText("noListsYetUploadAnExcelFileWith", "No lists yet. Upload an Excel file with Add Invitees.")}</p>}
              {sets && sets.length > 0 && (
                <table className="w-full text-left text-sm min-w-[760px]">
                  <thead className="text-[#6B6B6B] border-b border-[#D3D3D3]">
                    <tr>
                      <th className="py-2 pr-3 font-medium">{cmsText("list", "List")}</th>
                      <th className="py-2 pr-3 font-medium">{cmsText("guests2", "Guests")}</th>
                      <th className="py-2 pr-3 font-medium">{cmsText("deliveryOfInvitations", "Delivery of invitations")}</th>
                      <th className="py-2 pr-3 font-medium">{cmsText("listState", "List state")}</th>
                      <th className="py-2 font-medium text-right">{cmsText("action", "Action")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEEE] text-[#4B4F52]">
                    {sets.map((s) => (
                      <React.Fragment key={s.id}>
                        <tr className="align-top">
                          <td className="py-3 pr-3 max-w-[220px]">
                            <button type="button" onClick={() => toggleSet(s.id)} aria-expanded={open === s.id} className="text-left text-gray-900 font-medium hover:text-[#1A56DB] cursor-pointer break-words" title={s.name}>{listDisplayName(s.name)}</button>
                            {s.source === "SESSION" && <span className="block text-xs text-[#6B6B6B]">{cmsText("theGuestsOfThisSessionTakenFromThe", "The guests of this session, taken from the other lists (not an upload)")}</span>}
                            {s.createdAt && <span className="block text-xs text-[#6B6B6B]">{s.source === "MANUAL" ? cmsText("added", "Added") : cmsText("uploaded", "Uploaded")} {formatDateTime(s.createdAt, "")}{s.uploadedBy ? ` · by ${s.uploadedBy.name}` : ""}</span>}
                            <span className="sm:hidden mt-1 inline-block">{s.locked ? pill("bg-[#EDEDED] text-[#4B4F52]", "Locked") : pill("border border-[#1A9242] text-[#0F7A33] bg-white", "Open")}</span>
                          </td>
                          <td className="py-3 pr-3 whitespace-nowrap">{s.total}{s.importedCount !== null ? <span className="block text-xs text-[#6B6B6B]">{s.importedCount}{" " + cmsText("addedByThisUpload", "added by this upload")}</span> : null}</td>
                          <td className="py-3 pr-3 text-xs space-y-0.5">
                            {allSentLine(s) && <span className="block mb-1"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F7A33] font-medium">{cmsText("invitationsSent", "Invitations sent")}</span><span className="block text-[#6B6B6B] mt-0.5">{allSentLine(s)}</span></span>}
                            <span className="block">{cmsText("sent", "Sent") + " "}<b className="text-[#0F7A33]">{s.sent}</b>{" " + cmsText("notSent2", "· Not sent") + " "}<b>{s.notSent}</b></span>
                            <span className="block">{cmsText("failed", "Failed") + " "}<b className={s.failed ? "text-rose-600" : ""}>{s.failed}</b>{" " + cmsText("unknown", "· Unknown") + " "}<b className={s.unknown ? "text-amber-700" : ""} title={cmsText("deliveryWasAttemptedButTheOutcomeWasNever", "Delivery was attempted but the outcome was never settled. The guest may have received it.")}>{s.unknown}</b></span>
                          </td>
                          <td className="py-3">
                            {s.source === "SESSION" ? pill("bg-[#EDEDED] text-[#4B4F52]", "From other lists", "This session uses guests from the lists above, so it has no list of its own to change.") : s.locked ? pill("bg-[#EDEDED] text-[#4B4F52]", "Locked", "Invitations were sent, a guest answered, or a guest checked in. This list is kept as it is.", <Lock />) : pill("border border-[#1A9242] text-[#0F7A33] bg-white", "Open", "No invitation has been sent successfully from this list.")}
                          </td>
                          <td className="py-3 text-right">
                            {(() => {
                              // an open upload can be renamed or deleted; a locked list, a session's derived list and the hand-added guests cannot
                              const why = s.source === "SESSION" ? "This session's guests come from the other lists. Change those lists instead." : s.source === "MANUAL" ? "Guests added by hand are not an uploaded list. Edit or delete them from the guest list." : s.locked ? "Locked: invitations were sent from this list, a guest answered, or a guest checked in. It is kept as it is." : "";
                              const off = "inline-flex size-8 items-center justify-center rounded-md text-gray-300 cursor-not-allowed";
                              return (
                                <span className="inline-flex items-center gap-1">
                                  {why ? (
                                    <span role="img" aria-label={`Edit list not available: ${why}`} title={why} className={off}><PencilIcon /></span>
                                  ) : (
                                    <button type="button" onClick={() => { setOutcome(null); setRenameValue(listDisplayName(s.name)); setRenameList(s); }} aria-label={`Rename ${listDisplayName(s.name)}`} title={cmsText("editListName", "Edit list name")} className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"><PencilIcon /></button>
                                  )}
                                  {why ? (
                                    <span role="img" aria-label={`Delete list not available: ${why}`} title={why} className={off}><BinIcon /></span>
                                  ) : (
                                    <button type="button" onClick={() => { setOutcome(null); setDropList(s); }} aria-label={`Delete ${listDisplayName(s.name)}`} title={cmsText("deleteList", "Delete list")} className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"><BinIcon /></button>
                                  )}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                        {open === s.id && (
                          <tr>
                            <td colSpan={5} className="pb-4">
                              <div className="rounded-md bg-[#F8F8F8] border border-[#E5E5E5] p-4 text-sm">
                                <p className="text-[#4B4F52]">{s.source === "SESSION" ? cmsText("theseAreTheGuestsWhoCanAttendThis", "These are the guests who can attend this session, taken from the lists above. To change them, change the lists they came from.") : stateExplanation(s)}</p>
                                <GuestTable state={members[s.id]} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
              {removedLists.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">{cmsText("deletedListsHistory", "Deleted lists (history)")}</h3>
                  <table className="w-full text-left text-xs min-w-[760px]">
                    <thead className="text-[#6B6B6B] border-b border-[#D3D3D3]"><tr><th className="py-1.5 pr-3 font-medium">{cmsText("list", "List")}</th><th className="py-1.5 pr-3 font-medium">{cmsText("uploaded", "Uploaded")}</th><th className="py-1.5 pr-3 font-medium">{cmsText("addedByUpload", "Added by upload")}</th><th className="py-1.5 font-medium">{cmsText("deleted", "Deleted")}</th></tr></thead>
                    <tbody className="divide-y divide-[#EEEEEE] text-[#4B4F52]">
                      {removedLists.map((r) => (
                        <tr key={r.id} className="align-top">
                          <td className="py-2 pr-3 text-gray-900 break-words" title={r.name}>{listDisplayName(r.name)}</td>
                          <td className="py-2 pr-3">{r.createdAt ? formatDateTime(r.createdAt, "") : "—"}{r.uploadedBy ? <span className="block text-[#6B6B6B]">{cmsText("by", "by") + " "}{r.uploadedBy.name}</span> : null}</td>
                          <td className="py-2 pr-3">{r.importedCount ?? "—"}</td>
                          <td className="py-2">{formatDateTime(r.removedAt, "")}{r.removedBy ? <span className="block text-[#6B6B6B]">{cmsText("by", "by") + " "}{r.removedBy.name}</span> : null}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
      </div>

      {renameList && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="rename-title">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <ModalClose onClick={() => setRenameList(null)} disabled={renaming} />
            <h3 id="rename-title" className="pr-8 text-base font-semibold text-gray-900">{cmsText("editListName", "Edit list name")}</h3>
            <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} maxLength={200} aria-label={cmsText("listName", "List name")} className="w-full px-3.5 py-2.5 text-sm border border-[#E0E0E0] rounded-md bg-[#FAFAFA] focus:outline-none focus:border-black" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setRenameList(null)} disabled={renaming} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium cursor-pointer disabled:opacity-60">{cmsText("cancel2", "Cancel")}</button>
              <button type="button" onClick={doRename} disabled={renaming || !renameValue.trim()} className="px-4 py-2 bg-[#1F65FF] hover:bg-[#1A56DB] text-white rounded-md text-sm font-medium cursor-pointer disabled:opacity-60">{renaming ? cmsText("saving2", "Saving…") : cmsText("save", "Save")}</button>
            </div>
          </div>
        </div>
      )}

      {dropList && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="drop-title">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 overflow-y-auto max-h-[calc(100dvh-2rem)] relative">
            <ModalClose onClick={() => setDropList(null)} disabled={dropping} />
            <h3 id="drop-title" className="pr-8 text-base font-semibold text-gray-900">{cmsText("delete2", "Delete “")}{listDisplayName(dropList.name)}”?</h3>
            <p className="text-sm text-[#4B4F52]">{cmsText("doYouWantToDeleteThisSetOf", "Do you want to delete this set of list?") + " "}{dropList.total > 0 ? `Its ${dropList.total} ${dropList.total === 1 ? "guest has" : "guests have"} not been contacted and will be deleted with it. ` : cmsText("itHasNoGuestsLeft", "It has no guests left.")}{cmsText("theListIsRemovedFromUploadedListsAnd", "The list is removed from Uploaded lists, and its history (when it was uploaded and by whom) stays under Deleted lists.")}</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDropList(null)} disabled={dropping} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium cursor-pointer disabled:opacity-60">{cmsText("noKeepIt", "No, keep it")}</button>
              <button type="button" onClick={doDropList} disabled={dropping} className="px-4 py-2 bg-[#D92D20] hover:bg-[#B42318] text-white rounded-md text-sm font-medium cursor-pointer disabled:opacity-60">{dropping ? cmsText("deleting", "Deleting…") : cmsText("yesDelete2", "Yes, delete")}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function GuestTable({ state }: { state: { rows: InviteeSetMember[]; total: number; page: number } | "loading" | string | undefined }) {
  const cmsText = useDashboardCopy();
  if (!state || state === "loading") return <p className="mt-3 text-[#6B6B6B]">{cmsText("loadingGuests", "Loading guests…")}</p>;
  if (typeof state === "string") return <p role="alert" className="mt-3 text-rose-600">{state}</p>;
  if (state.rows.length === 0) return <p className="mt-3 text-[#6B6B6B]">{cmsText("noActiveGuestsInThisList", "No active guests in this list.")}</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-xs min-w-[520px]">
        <thead className="text-[#6B6B6B] border-b border-[#D3D3D3]"><tr><th className="py-1.5 pr-3 font-medium">{cmsText("guest", "Guest")}</th><th className="py-1.5 pr-3 font-medium">{cmsText("invitation", "Invitation")}</th><th className="py-1.5 pr-3 font-medium">{cmsText("rsvp", "RSVP")}</th><th className="py-1.5 font-medium">{cmsText("checkedIn", "Checked in")}</th></tr></thead>
        <tbody className="divide-y divide-[#EEEEEE]">
          {state.rows.map((m) => (
            <tr key={m.id}>
              <td className="py-1.5 pr-3 text-gray-900">{m.name}<span className="block text-[#6B6B6B] break-all">{m.email || m.mobile || "—"}</span></td>
              <td className="py-1.5 pr-3">{m.delivery === "SENT" ? pill("bg-[#C0FFD5] text-[#0F7A33]", DELIVERY_LABEL.SENT) : m.delivery === "FAILED" ? pill("bg-rose-100 text-rose-700", DELIVERY_LABEL.FAILED) : m.delivery === "UNKNOWN" ? pill("bg-amber-100 text-amber-800", DELIVERY_LABEL.UNKNOWN, "The guest may already have received it") : pill("bg-[#EDEDED] text-[#6E6E6E]", DELIVERY_LABEL.NOT_SENT)}</td>
              <td className="py-1.5 pr-3">{m.rsvpStatus === "PENDING" ? "—" : m.rsvpStatus === "ACCEPTED" ? cmsText("accepted", "Accepted") : cmsText("declined", "Declined")}</td>
              <td className="py-1.5">{m.checkedIn ? cmsText("yes", "Yes") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {state.total > state.rows.length && <p className="mt-2 text-[#6B6B6B]">{cmsText("showingTheFirst", "Showing the first") + " "}{state.rows.length}{" " + cmsText("of", "of") + " "}{state.total}{" " + cmsText("guests3", "guests.")}</p>}
    </div>
  );
}

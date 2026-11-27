"use client";

import { useDashboardCopy } from "@/components/cms/DashboardCopyProvider";

import React, { useState } from "react";
import { eventService } from "@/services/eventService";
import { copyText } from "@/utils/copyText";

interface EventCleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle?: string;
  onCleanupSuccess?: () => void;
  /** "delete" removes the event itself too ("Delete Event" on a past event); "cleanup" keeps the event record (admin) */
  mode?: "cleanup" | "delete";
}

export default function EventCleanupModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onCleanupSuccess,
  mode = "cleanup",
}: EventCleanupModalProps) {
  const cmsText = useDashboardCopy();
  const [clearing, setClearing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [typed, setTyped] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const canDelete = !!eventTitle && typed.trim() === eventTitle.trim();

  if (!isOpen) return null;

  const copyTitle = async () => {
    if (!eventTitle) return;
    if (!(await copyText(eventTitle))) { setErrorMessage("The title could not be copied. Please type it."); return; }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleClearData = async () => {
    setErrorMessage(null);
    setClearing(true);
    try {
      const res = mode === "delete" ? await eventService.deleteEventPermanently(eventId, typed) : await eventService.cleanupEventData(eventId, typed);
      if (res.success) {
        setClearing(false);
        if (onCleanupSuccess) {
          onCleanupSuccess();
        } else {
          onClose();
        }
      } else {
        setErrorMessage(res.message || res.error || "Failed to clear event operational data.");
        setClearing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during cleanup.");
      setClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-overlay">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-y-auto animate-modal max-h-[calc(100dvh-2rem)]">
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 block">{cmsText("permanentDeletion", "Permanent deletion")}</span>
              <h3 className="text-sm font-bold text-white truncate max-w-[280px]">
                {eventTitle || "Event Operations"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={clearing}
            className="text-gray-500 hover:text-white p-1 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs text-gray-700">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
            <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>{cmsText("thisCannotBeUndone", "This cannot be undone.")}</h4>
            <p className="text-amber-800 leading-relaxed">
              {mode === "delete" ? cmsText("theEventAndAllOfItsDataAre", "The event and all of its data are removed for good.") : cmsText("thisIsDifferentFromClosingAnEventClosing", "This is different from closing an event. Closing keeps everything; this removes it for good.")}
            </p>
          </div>

          <p className="text-gray-500 leading-normal">
            {mode === "delete" ? cmsText("permanentlyDeletesThisEventAndEverythingInIt", "Permanently deletes this event and everything in it: its invitees, invitations (including RSVP answers), sessions, check-in records, staff assignments and uploaded image. It disappears from every list and report. The activity log of who did what is kept.") : <>{cmsText("permanentlyDeletesThisEventSInviteesInvitationsIncluding", "Permanently deletes this event's invitees, invitations (including RSVP answers), sessions, check-in records and staff assignments. The event record, its activity log and all user accounts are kept.")}</>}</p>

          {/* not a wrapping label: a button inside one would take the label's click away from the box */}
          <div className="text-[11px] text-gray-700 space-y-1">
            <div className="flex flex-wrap items-center gap-x-1.5">
              <span><label htmlFor="confirm-event-title">{cmsText("typeTheEventTitleToConfirm", "Type the event title to confirm:")}</label> <strong className="text-gray-900 break-words">{eventTitle}</strong></span>
              {eventTitle ? (
                <button type="button" onClick={copyTitle} aria-label={copied ? cmsText("eventTitleCopied", "Event title copied") : cmsText("copyTheEventTitle", "Copy the event title")} title={copied ? cmsText("copied", "Copied") : cmsText("copyToClipboard", "Copy to clipboard")} className="inline-flex size-6 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
                  {copied ? (
                    <svg className="size-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><rect x="9" y="9" width="11" height="11" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h3" /></svg>
                  )}
                </button>
              ) : null}
              <span role="status" className="sr-only">{copied ? cmsText("eventTitleCopied", "Event title copied") : ""}</span>
            </div>
            <input
              id="confirm-event-title"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={clearing}
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={clearing}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
          >{cmsText("keepData", "Keep data")}</button>
          <button
            type="button"
            onClick={handleClearData}
            disabled={clearing || !canDelete}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {clearing && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{clearing ? cmsText("deleting", "Deleting…") : cmsText("deletePermanently", "Delete permanently")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

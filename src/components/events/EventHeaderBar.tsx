"use client";

import { useDashboardCopy } from "@/components/cms/DashboardCopyProvider";

import React from "react";
import Link from "next/link";
import { formatDateTime } from "@/utils/dateTime";
import { formatEventId } from "@/utils/formatId";

const statusTone: Record<string, string> = {
  "Invitation not sent": "bg-[#FFE9C0] text-[#6F5600]",
  Upcoming: "bg-[#C0FFD5] text-[#0F7A33]",
  Ongoing: "bg-[#CCD2FF] text-[#2C2EB5]",
  Completed: "bg-[#D6E4FF] text-[#1A56DB]",
  Cancelled: "bg-gray-200 text-gray-700",
};

export interface EventHeaderBarProps {
  eventId: string;
  title: string;
  categoryPill?: string;
  status: string;
  organizer?: string;
  start?: string;
  end?: string;
  venue?: string;
  isAdmin: boolean;
  eventStatus?: string;
  eventEnded: boolean;
  eventOver: boolean;
  dataCleared: boolean;
  editLocked: boolean;
  reportLoaded: boolean;
  onDelete: () => void;
  onCancel: () => void;
  onCleanup: () => void;
}

/** The event's title, status, organizer, dates, venue and its Cancel / Delete / Edit buttons: shown at the top of every tab of the event. */
export default function EventHeaderBar({ eventId, title, categoryPill, status, organizer, start, end, venue, isAdmin, eventStatus, eventEnded, eventOver, dataCleared, editLocked, reportLoaded, onDelete, onCancel, onCleanup }: EventHeaderBarProps) {
  const cmsText = useDashboardCopy();
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="min-w-0 md:flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl sm:text-[28px] font-medium text-black break-words">{title}</h2>
          {categoryPill && <span className="px-2.5 py-0.5 border border-[#1F65FF] text-[#1F65FF] text-xs font-medium rounded">{categoryPill}</span>}
        </div>
        {/* from tablet width up the status, organizer, dates and venue stay on one line, whatever the status says; a long venue is shortened, not moved down */}
        <div className="mt-3 flex items-center gap-x-3 gap-y-2 flex-wrap md:flex-nowrap text-xs text-[#4B4F52]">
          <span className={`px-3 py-1 rounded-full font-medium whitespace-nowrap shrink-0 ${statusTone[status] || statusTone.Upcoming}`}>{status}</span>
          {/* the event ID is for administrators; organizers don't see it */}
          {isAdmin && <span className="text-[#6B6B6B]">{formatEventId(eventId)}</span>}
          {organizer && <span className="whitespace-nowrap shrink-0"><span className="font-medium text-gray-900">{cmsText("organizedBy", "Organized by:")}</span> {organizer}</span>}
          <span className="text-[#D3D3D3] hidden sm:inline">|</span>
          <span className="whitespace-nowrap shrink-0">
            <span className="font-medium text-gray-900">{cmsText("start", "Start:")}</span> {formatDateTime(start, "—")}
            <span className="mx-2 text-[#D3D3D3]">|</span>
            <span className="font-medium text-gray-900">{cmsText("end", "End:")}</span> {formatDateTime(end, "—")}
          </span>
          {venue && (
            <>
              <span className="text-[#D3D3D3] hidden sm:inline">|</span>
              <span className="inline-flex items-start gap-1.5 min-w-0 md:items-center" title={venue}>
                <svg className="w-4 h-4 shrink-0 text-[#1F65FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={cmsText("location", "Location")}>
                  <path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
                <span className="min-w-0 break-words md:truncate text-[#6B6B6B]">{venue}</span>
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {(eventEnded || eventStatus === "CANCELLED") && (
          <button type="button" onClick={() => onDelete()} className="px-4 py-2 border border-rose-600 text-rose-700 hover:bg-rose-50 text-sm font-medium rounded-md cursor-pointer">{cmsText("deleteEvent", "Delete Event")}</button>
        )}
        {(eventStatus === "PUBLISHED" || eventStatus === "DRAFT") && !eventEnded && (
          <button type="button" onClick={() => onCancel()} className="px-4 py-2 border border-rose-600 text-rose-700 hover:bg-rose-50 text-sm font-medium rounded-md cursor-pointer">{cmsText("cancelEvent", "Cancel Event")}</button>
        )}
        {isAdmin && eventOver && !dataCleared && (
          <button type="button" onClick={() => onCleanup()} className="px-4 py-2 border border-red-600 text-red-700 hover:bg-red-50 text-sm font-medium rounded-md cursor-pointer">{cmsText("deleteDataPermanently", "Delete Data Permanently")}</button>
        )}
        {/* After sending, Figma 426:2 keeps Edit visible but faded: the event is locked (the API refuses edits too) */}
        {reportLoaded ? (
          <Link href={`/events/${eventId}/edit`} title={editLocked ? cmsText("editingIsClosedForThisEventItsDetails", "Editing is closed for this event: its details are shown as saved") : undefined} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F65FF] hover:bg-[#1A56DB] text-white text-sm font-medium rounded-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>{cmsText("edit", "Edit")}</Link>
        ) : (
          <button type="button" disabled title={editLocked ? cmsText("thisEventCanTBeEditedAfterInvitations", "This event can’t be edited after invitations have been sent or cards have been downloaded") : cmsText("checkingWhetherThisEventCanStillBeEdited", "Checking whether this event can still be edited…")} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F65FF] text-white text-sm font-medium rounded-md opacity-50 cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>{cmsText("edit", "Edit")}</button>
        )}
      </div>
    </div>
  );
}

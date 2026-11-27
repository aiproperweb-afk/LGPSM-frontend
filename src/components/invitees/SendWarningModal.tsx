"use client";

import { useDashboardCopy } from "@/components/cms/DashboardCopyProvider";

import React, { useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/icons/Icon";
import CustomDropdown from "@/components/common/CustomDropdown";
import { CHANNEL_OPTIONS, type Channel } from "./channelOptions";

/** What the organiser is about to do: send invitations, print cards, or (Print and Digital both) send them and then make the cards */
export type ActionMode = "send" | "both" | "download";
/** the same window also confirms sending a failed invitation again, so its channel can be chosen */
type WindowMode = ActionMode | "resend";

interface SendWarningModalProps {
  eventId: string;
  eventTitle: string;
  mode: WindowMode;
  /** nothing has gone out or been printed yet: the event is about to be locked, so the organiser may still edit it */
  firstTime: boolean;
  /** how many guests the action covers */
  count: number;
  /** what will be asked for next, worked out from the event's price and what is already paid (not shown while it is being worked out) */
  billNote?: string | null;
  channel: Channel;
  onChannelChange: (c: Channel) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const secondary = "inline-flex items-center justify-center px-6 py-[11px] bg-[#E6EAED] hover:bg-[#DCE1E5] rounded-lg text-base font-semibold text-[#595D60] cursor-pointer";

const CONFIRM_LABEL: Record<WindowMode, string> = { send: "Send Invitation", both: "Send Invitation & Download cards", download: "Download Cards", resend: "Resend Invitation" };

/**
 * The window before an action goes ahead (Figma 198:2162). The first send or card download locks the event, so the organiser gets a last
 * chance to edit it or change its card design; the button names what will happen for this event's invitation type (Digital only: send,
 * Print only: download, both: send and download), and the delivery channel is chosen here whenever an invitation is sent.
 */
export default function SendWarningModal({ eventId, eventTitle, mode, firstTime, count, billNote, channel, onChannelChange, onCancel, onConfirm }: SendWarningModalProps) {
  const cmsText = useDashboardCopy();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const sending = mode !== "download";
  const guests = `${count} ${count === 1 ? "guest" : "guests"}`;
  const text = mode === "resend"
    ? `Send the invitation for this event again to ${guests}? They will receive it straight away.`
    : firstTime
    ? sending
      ? "Once you start sending the invitations, you will not be able to edit this event any further. Do you want to start sending your invitations now?"
      : "Once you download the cards, you will not be able to edit this event any further. Do you want to download the cards now?"
    : sending
      ? `Send the invitation for this event to ${guests}? They will receive it straight away${mode === "both" ? ", and their cards are made once it has been sent" : ""}.`
      : `Download the printable cards for ${guests}?`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="send-warning-title">
      <div className="w-full max-w-[648px] bg-white border border-[#E5E5E5] rounded-lg overflow-y-auto max-h-[calc(100dvh-2rem)]">
        <div className="flex items-end gap-5 px-6 py-5 border-b border-[#E0E0E0]">
          <p className="flex-1 min-w-0 text-base font-medium text-[#15191C] break-words">
            {mode === "resend" ? cmsText("resendInvitations", "Resend Invitations") : sending ? cmsText("sendInvitations2", "Send Invitations") : cmsText("downloadCards", "Download Cards")}{" " + cmsText("for", "for") + " "}<span className="font-semibold text-[#1F65FF]">{eventTitle}</span>
          </p>
          <button type="button" onClick={onCancel} aria-label={cmsText("close", "Close")} className="shrink-0 cursor-pointer">
            <Icon name="events/inv-panel-close" width={16} height={16} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-6 px-6 pt-[48px] pb-8 text-center">
          <Icon name="events/warning" width={34} height={32} />
          <div className="flex flex-col gap-2 max-w-[442px] font-medium">
            <h2 id="send-warning-title" className="text-[26px] text-[#15191C]">{firstTime ? cmsText("warning", "Warning") : cmsText("confirm", "Confirm")}</h2>
            <p className="text-base text-[#15191C]/80">{text}</p>
          </div>
          {firstTime && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={`/events/${eventId}/edit`} className={secondary}>{cmsText("editEvent", "Edit Event")}</Link>
              {/* The template is chosen from the card preview on the edit form's first step */}
              <Link href={`/events/${eventId}/edit`} className={secondary}>{cmsText("changeTemplate", "Change Template")}</Link>
              <button type="button" onClick={onCancel} className={secondary}>{cmsText("iLlDoLater", "I’ll do later")}</button>
            </div>
          )}
          {/* what comes next sits last, just above the send button */}
          {billNote && <p className="max-w-[442px] text-sm font-medium text-[#1D3A8A] bg-[#EEF4FF] border border-[#C7D7FE] rounded-md px-3 py-2">{billNote}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 p-4 border-t border-[#E5E5E5]">
          {sending && (
            <div className="w-[220px]">
              <CustomDropdown value={channel} onChange={(v) => onChannelChange(v as Channel)} ariaLabel="Delivery channel" portal options={CHANNEL_OPTIONS} />
            </div>
          )}
          <button type="button" onClick={onConfirm} autoFocus className="inline-flex items-center justify-center px-6 py-[11px] bg-[#1F65FF] hover:bg-[#1A56DB] rounded-lg text-base font-semibold text-white cursor-pointer">
            {CONFIRM_LABEL[mode]}
          </button>
        </div>
      </div>
    </div>
  );
}

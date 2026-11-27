"use client";

import { filterPrimaryButtonClass, filterSecondaryButtonClass } from "@/components/common/filterButtons";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "@/components/icons/Icon";
import CustomDropdown from "@/components/common/CustomDropdown";
import { NO_FILTERS, type InviteeFilters, type InvitationFilter, type CardsFilter, type RsvpFilter, type SortOrder } from "@/utils/inviteeFilters";

interface Props {
  open: boolean;
  onClose: () => void;
  eventTitle: string;
  /** the event's sessions (a single one is the whole event) */
  sessions: { id: string; name: string }[];
  /** the filters in force */
  value: InviteeFilters;
  /** Invitees group: only for events whose invitations are sent digitally */
  showInvitation: boolean;
  /** Cards group: only for events that print cards */
  showCards: boolean;
  /** Food Preference: only for events whose invitations are sent digitally, where guests answer */
  showFood: boolean;
  /** the food questions the event asks and their choices (none: the section says so) */
  food: { title: string; options: string[] }[];
  /** RSVP group: only when the event asks guests to respond */
  showRsvp: boolean;
  onApply: (f: InviteeFilters) => void;
}

// the dropdown shows a blank value as "nothing chosen" (grey), so "everyone" travels as a value of its own
const EVERY = "__every__";

/** One group of choices (Figma 195:1834): a dropdown showing the chosen one; the list is whatever the event really has */
function Group<T extends string>({ title, options, value, onPick }: { title: string; options: { value: T; label: string }[]; value: T; onPick: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-sm font-medium text-[#000B2C]">{title}</p>
      <CustomDropdown portal ariaLabel={title} value={value || EVERY} onChange={(v) => onPick((v === EVERY ? "" : v) as T)} options={options.map((o) => ({ value: o.value || EVERY, label: o.label }))} />
    </div>
  );
}

/** The Filter & Sorting panel of the invitee list (Figma 195:1813): session, invitation, food, RSVP and alphabetical order, with Clear and Apply */
export default function InviteeFilterPanel(props: Props) {
  // mounted only while open, so each time it opens it starts from what is in force
  return props.open ? <PanelBody {...props} /> : null;
}

function PanelBody({ onClose, eventTitle, sessions, value, showInvitation, showCards, showFood, food, showRsvp, onApply }: Props) {
  const [draft, setDraft] = useState<InviteeFilters>(value);
  useEffect(() => {
    // Escape closes an open dropdown first, and the panel only when none is open
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !document.querySelector('[role="listbox"]')) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (typeof document === "undefined") return null;

  const sessionOptions = sessions.length === 1
    ? [{ value: "", label: sessions[0].name }]
    : [{ value: "", label: "All Sessions" }, ...sessions.map((s) => ({ value: s.id, label: s.name }))];
  const sortOptions: { value: SortOrder; label: string }[] = [{ value: "ANY", label: "Any" }, { value: "AZ", label: "Name (A to Z)" }, { value: "ZA", label: "Name (Z to A)" }];

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="invitee-filter-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[311px] bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Icon name="events/inv-panel-filter" width={20} height={20} />
            <h2 id="invitee-filter-title" className="text-base font-medium text-[#000B2C]">Filter &amp; Sorting</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer"><Icon name="events/inv-panel-close" width={16} height={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-3 flex flex-col gap-[18px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Icon name="events/inv-panel-check" width={11} height={8} />
              <p className="text-sm font-medium text-black break-words min-w-0">{eventTitle}</p>
            </div>
            <CustomDropdown portal ariaLabel="Session" value={draft.session || EVERY} onChange={(v) => setDraft((d) => ({ ...d, session: v === EVERY ? "" : v }))} options={sessionOptions.map((o) => ({ value: o.value || EVERY, label: o.label }))} />
          </div>

          {showInvitation && (
            <Group<InvitationFilter>
              title="Invitees"
              value={draft.invitation}
              onPick={(v) => setDraft((d) => ({ ...d, invitation: v }))}
              options={[{ value: "", label: "All Invitees" }, { value: "SENT", label: "Invitation Sent" }, { value: "NOT_SENT", label: "Invitation Not Sent" }]}
            />
          )}

          {showCards && (
            <Group<CardsFilter>
              title="Cards"
              value={draft.cards}
              onPick={(v) => setDraft((d) => ({ ...d, cards: v }))}
              options={[{ value: "", label: "All Cards" }, { value: "DOWNLOADED", label: "Cards Downloaded" }, { value: "NOT_DOWNLOADED", label: "Cards Not Downloaded" }]}
            />
          )}

          {showFood && food.length === 0 && (
            <div className="flex flex-col gap-2 w-full">
              <p className="text-sm font-medium text-[#000B2C]">Food Preference</p>
              <p className="rounded-md border border-[#E0E0E0] bg-[#F8F9FA] px-3 py-2.5 text-xs text-[#6B6B6B]">This event does not ask guests about food.</p>
            </div>
          )}

          {showFood && food.map((q) => (
            <Group<string>
              key={q.title}
              title={food.length === 1 ? "Food Preference" : q.title}
              value={draft.food?.title === q.title ? draft.food.value : ""}
              onPick={(v) => setDraft((d) => ({ ...d, food: v ? { title: q.title, value: v } : null }))}
              options={[{ value: "", label: "All choices" }, ...q.options.map((o) => ({ value: o, label: o }))]}
            />
          ))}

          {showRsvp && (
            <Group<RsvpFilter>
              title="RSVP"
              value={draft.rsvp}
              onPick={(v) => setDraft((d) => ({ ...d, rsvp: v }))}
              options={[{ value: "", label: "All Invited Guests" }, { value: "ACCEPTED", label: "Who Accepted Invitation" }, { value: "DECLINED", label: "Who Declined Invitation" }, { value: "PENDING", label: "Not Responded" }]}
            />
          )}

          <div className="flex flex-col gap-2 w-full" role="radiogroup" aria-label="Alphabetical Order">
            <p className="text-sm font-medium text-[#000B2C]">Alphabetical Order</p>
            {sortOptions.map((o) => (
              <button key={o.value} type="button" role="radio" aria-checked={draft.sort === o.value} onClick={() => setDraft((d) => ({ ...d, sort: o.value }))} className="flex items-center justify-between gap-2 text-left text-xs text-[#000B2C] cursor-pointer">
                {o.label}
                {draft.sort === o.value && <Icon name="events/inv-panel-check" width={11} height={8} />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-[#EEE]">
          <button type="button" onClick={() => { setDraft(NO_FILTERS); onApply(NO_FILTERS); onClose(); }} className={filterSecondaryButtonClass}>Clear</button>
          <button type="button" onClick={() => { onApply(draft); onClose(); }} className={filterPrimaryButtonClass}>Apply</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

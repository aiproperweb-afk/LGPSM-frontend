"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import ColumnPicker from "@/components/common/ColumnPicker";
import SearchSelect from "@/components/common/SearchSelect";
import Pagination from "@/components/common/Pagination";
import Icon from "@/components/icons/Icon";
import { TableSkeleton } from "@/components/common/Skeleton";
import { eventService } from "@/services/eventService";
import { sessionService, type SessionData } from "@/services/sessionService";
import { inviteeService } from "@/services/inviteeService";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { allowedIn } from "@/utils/sessionAccess";
import { dietaryAnswer, dietaryQuestionTitles } from "@/utils/dietaryAnswers";
import { additionalColumns } from "@/utils/inviteeFields";
import { formatPhoneNumber } from "@/utils/eventUtils";
import { paginate } from "@/utils/pagination.mjs";

interface Guest {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  companyName?: string;
  professionalIdentity?: string;
  secondaryIdentity?: string;
  guestCount?: number;
  invitationStatus: "PENDING" | "SENT" | "FAILED";
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED";
  sessionAccess?: { sessionId: string; allowed: boolean }[];
  dietaryPreference?: string;
  dietarySelections?: { title: string; value: string }[];
}

interface EventInfo {
  title?: string;
  dietaryPreference?: { enabled?: boolean; title?: string; options?: unknown[] };
  cardInfo?: { primary?: string | null; secondary?: string | null };
}

const PAGE_SIZE = 50;

const statusOf = (g: Guest): { label: string; cls: string } =>
  g.invitationStatus === "FAILED" ? { label: "Sending Failed", cls: "bg-[#FDE2E1] text-[#B42318]" }
    : g.invitationStatus === "PENDING" ? { label: "Not Yet Sent", cls: "bg-[#EDEDED] text-[#6E6E6E]" }
      : g.rsvpStatus === "ACCEPTED" ? { label: "Accepted", cls: "bg-[#15803D] text-white" }
        : g.rsvpStatus === "DECLINED" ? { label: "Declined", cls: "bg-[#FFE9C0] text-[#6F5600]" }
          : { label: "Successfully Sent", cls: "bg-[#C0FFD5] text-[#0F7A33]" };

export default function AllInviteesPage() {
  return (
    <Suspense fallback={null}>
      <AllInvitees />
    </Suspense>
  );
}

// Everyone invited to one event, across all of its sessions. Nothing is shown until an event is chosen.
function AllInvitees() {
  const router = useRouter();
  const eventId = useSearchParams().get("event") || "";
  const [events, setEvents] = useState<{ value: string; label: string }[] | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  // the answer is tagged with the event it belongs to: "loading" is simply "no answer for the chosen event yet"
  const [result, setResult] = useState<{ eventId: string; event: EventInfo | null; sessions: SessionData[]; guests: Guest[]; error: string | null } | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [foodView, setFoodView] = useState("");
  const [tick, setTick] = useState(0);
  useLiveRefresh(() => setTick((n) => n + 1), 30_000, !!eventId);

  useEffect(() => {
    let live = true;
    eventService.getEvents().then((res) => {
      if (!live) return;
      if (!res.success || !Array.isArray(res.data)) { setEventsError(res.message || "Your events could not be loaded."); setEvents([]); return; }
      setEvents(res.data.map((e) => ({ value: e._id || e.id || "", label: e.title || "Untitled event" })));
    });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!eventId) return;
    let live = true;
    Promise.all([eventService.getEvent(eventId), sessionService.getSessions(eventId), inviteeService.getInvitees(eventId)]).then(([evt, sess, guests]) => {
      if (!live) return;
      const failed = !evt.success || !guests.success;
      setResult((before) => {
        // a refresh that fails keeps what is on screen
        if (failed && before?.eventId === eventId && !before.error) return before;
        return {
          eventId,
          event: (evt.data as EventInfo | undefined) ?? null,
          sessions: sess.success && Array.isArray(sess.data) ? sess.data : [],
          guests: guests.success && Array.isArray(guests.data) ? (guests.data as unknown as Guest[]) : [],
          error: failed ? evt.message || guests.message || "The invitees could not be loaded." : null,
        };
      });
    });
    return () => { live = false; };
  }, [eventId, tick]);

  const choose = (id: string) => {
    setPage(1);
    setSearch("");
    router.replace(id ? `/events/all-invitees?event=${id}` : "/events/all-invitees");
  };

  const data = result && result.eventId === eventId ? result : null;
  const loading = !!eventId && !data;
  const sessions = data?.sessions ?? [];
  const guests = data?.guests ?? [];
  const foodTitles = dietaryQuestionTitles(data?.event?.dietaryPreference);
  const foodTitle = foodTitles.includes(foodView) ? foodView : foodTitles[0] || "";
  const extra = additionalColumns(data?.event?.cardInfo);
  const term = search.trim().toLowerCase();
  const matching = guests.filter((g) => !term || [g.name, g.email, g.mobile, g.companyName].some((v) => (v || "").toLowerCase().includes(term)));
  const { current, totalPages, rows } = paginate(matching, page, PAGE_SIZE);
  const sessionsOf = (g: Guest) => {
    const names = sessions.filter((s) => allowedIn(g, s)).map((s) => s.name);
    return sessions.length > 1 && names.length === sessions.length ? "All sessions" : names.join(", ") || "—";
  };
  const people = guests.reduce((n, g) => n + (g.guestCount || 1), 0);

  return (
    <div className="w-full min-h-full bg-white">
      <PageHeader title="All Invitees" />
      <div className="px-4 sm:px-6 py-4 sm:py-6 w-full space-y-5 pb-24">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-[1_1_300px] items-center gap-2.5 min-w-0">
            <label htmlFor="all-invitee-search" className="text-[17px] font-medium text-black shrink-0">Invitees</label>
            <div className="relative flex-1 min-w-0">
              <Icon name="events/search" width={18} height={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                id="all-invitee-search"
                type="search"
                value={search}
                disabled={!eventId}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search invitees"
                className="w-full h-[47px] pl-12 pr-4 bg-[#FAFAFA] border border-[#E0E0E0] rounded-md text-xs font-medium text-gray-900 placeholder:text-[#6B6B6B] focus:outline-none focus:border-black disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <SearchSelect className="w-full sm:w-[320px]" ariaLabel="Select event" placeholder={events === null ? "Loading events…" : "Select Event"} value={eventId} onChange={choose} options={events ?? []} emptyMessage={events === null ? "Loading…" : "No events found"} />
        </div>

        {eventsError && <p role="alert" className="text-sm text-rose-600">{eventsError}</p>}

        {!eventId ? (
          <div className="py-[110px] flex flex-col items-center text-center gap-4">
            <svg className="w-20 h-20 text-[#BDBDBD]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            <p className="max-w-[320px] text-base text-[#4B4F52]">Select an event to see all of its invitees.</p>
          </div>
        ) : loading ? (
          <TableSkeleton rows={6} cols={7} label="Loading invitees" />
        ) : data?.error ? (
          <p role="alert" className="py-12 text-center text-sm text-rose-600 break-words">{data.error} <button type="button" onClick={() => setTick((n) => n + 1)} className="underline cursor-pointer">Retry</button></p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#4B4F52]">
              <span>{guests.length} invitee{guests.length === 1 ? "" : "s"} · {people} {people === 1 ? "person" : "people"} admitted by their passes</span>
              <Link href={`/events/${eventId}/invitees`} className="font-semibold text-[#1F65FF] underline">Add or manage invitees</Link>
            </div>
            {guests.length === 0 ? (
              <p className="py-[90px] text-center text-base text-[#4B4F52]">This event has no invitees yet.</p>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[760px]">
                    <thead className="text-[#6B6B6B] border-b border-[#D3D3D3]">
                      <tr>
                        <th className="h-[46px] px-2.5 font-medium w-12">#</th>
                        <th className="h-[46px] px-2.5 font-medium">Name</th>
                        <th className="h-[46px] px-2.5 font-medium">Email</th>
                        <th className="h-[46px] px-2.5 font-medium whitespace-nowrap">Phone Number</th>
                        <th className="h-[46px] px-2.5 font-medium whitespace-nowrap">No of Guests</th>
                        {extra.map((c) => <th key={c.key} className="h-[46px] px-2.5 font-medium whitespace-nowrap">{c.header}</th>)}
                        <th className="h-[46px] px-2.5 font-medium">Sessions</th>
                        <th className="h-[46px] px-2.5 font-medium">Status</th>
                        {foodTitle && (
                          <th className="h-[46px] px-2.5 py-1 font-medium whitespace-nowrap align-middle">
                            <ColumnPicker label="Food Preference" ariaLabel="Food question shown in the Food Preference column" value={foodTitle} options={foodTitles.map((t) => ({ value: t, label: t }))} onChange={setFoodView} />
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D3D3D3] text-[#15191C] border-b border-[#D3D3D3]">
                      {rows.map((g, i) => {
                        const status = statusOf(g);
                        return (
                          <tr key={g._id} className="hover:bg-gray-50/70">
                            <td className="py-3 px-2.5 text-[#6B6B6B]">{(current - 1) * PAGE_SIZE + i + 1}</td>
                            <td className="py-3 px-2.5 whitespace-nowrap">{g.name}</td>
                            <td className="py-3 px-2.5 whitespace-nowrap">{g.email || "—"}</td>
                            <td className="py-3 px-2.5 whitespace-nowrap">{formatPhoneNumber(g.mobile) || "—"}</td>
                            <td className="py-3 px-2.5">{g.guestCount || 1}</td>
                            {extra.map((c) => <td key={c.key} className="py-3 px-2.5 whitespace-nowrap">{g[c.key] || "—"}</td>)}
                            <td className="py-3 px-2.5">{sessionsOf(g)}</td>
                            <td className="py-3 px-2.5"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${status.cls}`}>{status.label}</span></td>
                            {foodTitle && <td className="py-3 px-2.5 whitespace-nowrap">{dietaryAnswer(g, foodTitle, foodTitles) || "--"}</td>}
                          </tr>
                        );
                      })}
                      {matching.length === 0 && <tr><td colSpan={9 + extra.length} className="py-10 text-center text-[#6B6B6B]">No invitees match your search.</td></tr>}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E0E0E0] px-3 py-2.5 text-xs text-[#4B4F52]">
                    <Pagination page={current} totalPages={totalPages} onChange={setPage} label="Invitee pages" />
                    <span>Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, matching.length)} of {matching.length}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { eventService } from "@/services/eventService";
import { reportService, EventReportData } from "@/services/reportService";
import { getDynamicEventStatus } from "@/utils/eventUtils";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import EventHeaderBar from "@/components/events/EventHeaderBar";
import EventCancelModal from "@/components/events/EventCancelModal";
import EventCleanupModal from "@/components/events/EventCleanupModal";

interface HeaderEvent {
  title: string;
  status?: string;
  schedule?: { start?: string; end?: string };
  categoryId?: { name?: string } | string;
  subcategory?: { name?: string } | null;
  organizerId?: { profile?: { organizationName?: string } } | string;
  location?: { address?: string } | string;
  operationalDataCleared?: boolean;
  cardsDownloadedAt?: string;
}

/**
 * The same event header the Overview tab has (title, status, organizer, dates, venue, Cancel / Delete / Edit), for the other tabs
 * (Sessions, Invitees List, Assign System Users). It reads the event itself and keeps itself current.
 */
export default function EventHeader({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<HeaderEvent | null>(null);
  const [report, setReport] = useState<EventReportData | null>(null);
  const [reportLoaded, setReportLoaded] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const live = useRef(0);
  // the clock the header judges "over" by; moved on each time the event is read
  const [now, setNow] = useState(0);

  const load = useCallback(async () => {
    const id = ++live.current;
    const [evRes, repRes] = await Promise.all([eventService.getEvent(eventId), reportService.getEventReport(eventId)]);
    if (id !== live.current) return;
    setNow(Date.now());
    if (evRes.success && evRes.data) setEvent(evRes.data as unknown as HeaderEvent);
    setReport(repRes.success && repRes.data ? repRes.data : null);
    setReportLoaded(true);
  }, [eventId]);

  useEffect(() => {
    if (eventId) void load();
    return () => { live.current += 1; };
  }, [eventId, load]);
  // an invitation sent, a card downloaded or an edit made on this tab changes what the header shows
  useEffect(() => {
    const again = () => { void load(); };
    window.addEventListener("lgpsm-db-update", again);
    return () => window.removeEventListener("lgpsm-db-update", again);
  }, [load]);
  useLiveRefresh(() => load(), 30_000, !!eventId);

  if (!event) return <div className="h-[84px]" aria-hidden />;

  const delivery = report?.deliverySummary || { SENT: 0, PENDING: 0, FAILED: 0 };
  const categoryName = typeof event.categoryId === "object" ? event.categoryId?.name : "";
  const categoryPill = [categoryName, event.subcategory?.name].filter(Boolean).join(" · ");
  const organizer = typeof event.organizerId === "object" ? event.organizerId?.profile?.organizationName || "Organisation not set" : "Organisation not set";
  const venue = typeof event.location === "string" ? event.location : event.location?.address;
  const endMs = event.schedule?.end ? new Date(event.schedule.end).getTime() : NaN;
  const eventEnded = event.status === "COMPLETED" || (!Number.isNaN(endMs) && endMs <= now);
  const eventOver = event.status === "COMPLETED" || (event.status === "PUBLISHED" && !Number.isNaN(endMs) && endMs <= now);
  const editLocked = delivery.SENT > 0 || delivery.FAILED > 0 || !!report?.invitationsStarted || !!event.cardsDownloadedAt || event.status === "COMPLETED" || event.status === "CANCELLED";
  const timeStatus = event.status === "CANCELLED" ? "Cancelled" : event.status === "COMPLETED" ? "Completed" : getDynamicEventStatus(event.schedule?.start, event.schedule?.end, "Upcoming");
  const status = reportLoaded && timeStatus === "Upcoming" && delivery.SENT === 0 && delivery.FAILED === 0 ? "Invitation not sent" : timeStatus;

  return (
    <>
      <EventHeaderBar
        eventId={eventId} title={event.title} categoryPill={categoryPill} status={status} organizer={organizer}
        start={event.schedule?.start} end={event.schedule?.end} venue={venue} isAdmin={user?.role === "ADMIN"} eventStatus={event.status}
        eventEnded={eventEnded} eventOver={eventOver} dataCleared={!!event.operationalDataCleared} editLocked={editLocked} reportLoaded={reportLoaded}
        onDelete={() => setDeleteOpen(true)} onCancel={() => setCancelOpen(true)} onCleanup={() => setCleanupOpen(true)}
      />
      <EventCancelModal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} eventId={eventId} eventTitle={event.title} onCancelled={async () => { setCancelOpen(false); await load(); }} />
      <EventCleanupModal isOpen={deleteOpen} mode="delete" onClose={() => setDeleteOpen(false)} eventId={eventId} eventTitle={event.title} onCleanupSuccess={() => { setDeleteOpen(false); router.push("/events"); }} />
      <EventCleanupModal isOpen={cleanupOpen} onClose={() => setCleanupOpen(false)} eventId={eventId} eventTitle={event.title} onCleanupSuccess={async () => { setCleanupOpen(false); await load(); }} />
    </>
  );
}

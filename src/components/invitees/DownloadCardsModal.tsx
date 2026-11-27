"use client";

import { useDashboardCopy } from "@/components/cms/DashboardCopyProvider";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/icons/Icon";
import CustomDropdown from "@/components/common/CustomDropdown";
import { cardDownloadService, type CardJobStatus, type CardPlan } from "@/services/cardDownloadService";

interface DownloadCardsModalProps {
  eventId: string;
  eventTitle?: string;
  /** the ticked guests: cards are made for these and nobody else */
  inviteeIds: string[];
  /** the session the list is filtered to; the file is named after it. Empty for all sessions. */
  sessionId?: string;
  onClose: () => void;
}

type Phase = "planning" | "ready" | "working" | "done" | "failed";
const btn = "px-6 py-[11px] rounded-lg text-base font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";
const POLL_MS = 2_000;

/**
 * Printable cards for the ticked guests, as ONE zip file. The cards are prepared in the background while this window shows the progress;
 * when they are ready the single zip downloads by itself. For a large list that zip holds smaller zips (up to 100 guests each), so the
 * browser never has to download many files.
 */
export default function DownloadCardsModal({ eventId, inviteeIds, sessionId, onClose }: DownloadCardsModalProps) {
  const cmsText = useDashboardCopy();
  const [plan, setPlan] = useState<CardPlan | null>(null);
  const [phase, setPhase] = useState<Phase>("planning");
  const [job, setJob] = useState<CardJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  // the kind of file the cards are made as (the choices come from the server; the first one is the default)
  const [format, setFormat] = useState<string>("");
  const jobId = useRef<string | null>(null);
  const alive = useRef(true);
  const started = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  // when it opens, the ticked guests are planned (this only works out the size; nothing is built yet)
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    cardDownloadService.plan(eventId, inviteeIds, sessionId).then((r) => {
      if (!alive.current) return;
      if (r.success && r.data) { setPlan(r.data); setFormat(r.data.formats?.[0]?.value ?? ""); setPhase("ready"); } else { setError(r.message || "We could not work out your download. Please try again."); setPhase("failed"); }
    });
    // the selection is fixed while this window is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && phase !== "working") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, phase]);

  const begin = useCallback(async (id: string) => {
    jobId.current = id;
    setPhase("working");
    // ask how it is going until it is ready (or has failed); closing the window just stops asking, the work carries on
    for (;;) {
      const s = await cardDownloadService.status(eventId, id);
      if (!alive.current) return;
      if (!s.success || !s.data) { setError(s.message || "We lost track of your download. Please start it again."); setPhase("failed"); return; }
      setJob(s.data);
      if (s.data.status === "FAILED") { setError(s.data.error || "The cards could not be prepared. Please try again."); setPhase("failed"); return; }
      if (s.data.status === "DONE") break;
      await new Promise((r) => setTimeout(r, POLL_MS));
      if (!alive.current) return;
    }
    const d = await cardDownloadService.download(eventId, id);
    if (!alive.current) return;
    if (!d.ok) { setError(d.message); setPhase("failed"); return; }
    setPhase("done");
  }, [eventId]);

  const start = async () => {
    if (!plan) return;
    setError(null);
    const r = await cardDownloadService.start(eventId, plan.planId, format || plan.formats?.[0]?.value);
    if (r.success && r.data) return begin(r.data.jobId);
    // already preparing (for example this window was closed and opened again): carry on watching that one
    if (r.code === "JOB_ALREADY_RUNNING" && r.jobId) return begin(r.jobId);
    setError(r.message || "We could not start your download. Please try again.");
    setPhase("failed");
  };

  const again = async () => {
    if (!jobId.current) return;
    const d = await cardDownloadService.download(eventId, jobId.current);
    if (!d.ok) setError(d.message);
  };

  const guests = plan?.total ?? inviteeIds.length;
  const percent = job && job.total > 0 ? Math.min(100, Math.round((job.doneGuests / job.total) * 100)) : 0;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="download-cards-title">
      <div className="w-full max-w-[480px] bg-white border border-[#E5E5E5] rounded-lg overflow-y-auto max-h-[calc(100dvh-2rem)]">
        <div className="flex items-end gap-5 px-6 py-5 border-b border-[#E0E0E0]">
          <h2 id="download-cards-title" className="flex-1 min-w-0 text-base font-medium text-[#15191C] break-words">{cmsText("downloadInviteeCard", "Download Invitee Card")}</h2>
          <button type="button" onClick={onClose} aria-label={cmsText("close", "Close")} className="shrink-0 cursor-pointer"><Icon name="events/close" width={16} height={16} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {(phase === "planning" || phase === "ready") && (
            <>
              <p className="text-sm text-[#4B4F52] leading-relaxed">{cmsText("weLlPrepareTheCardsForThe", "We'll prepare the cards for the") + " "}<b className="text-[#15191C]">{guests.toLocaleString("en-IN")}</b>{" " + cmsText("guest2", "guest")}{guests === 1 ? "" : "s"}{" " + cmsText("youTickedAndGiveYou", "you ticked and give you") + " "}<b className="text-[#15191C]">{cmsText("oneZipFile", "one ZIP file")}</b>.{" "}
                {!plan ? "" : plan.nested
                  ? `A long list is grouped into ${plan.zips} smaller ZIP files inside it, each holding up to ${Math.max(...plan.sizes)} cards.`
                  : cmsText("insideItYouLlFindOneFileFor", "Inside it you'll find one file for each guest.")}
              </p>
              <div>
                <span className="block text-sm font-medium text-[#15191C] mb-2">{cmsText("selectCardFormat", "Select Card Format")}<span className="text-[#D92D20]">*</span></span>
                {plan?.formats && plan.formats.length > 0 ? (
                  <CustomDropdown portal ariaLabel="Card format" value={format} onChange={setFormat} options={plan.formats.map((f) => ({ value: f.value, label: f.label }))} />
                ) : (
                  <div className="h-[47px] rounded-md border border-[#E0E0E0] bg-[#FAFAFA] px-4 flex items-center text-sm text-[#6B6B6B]" aria-live="polite">{!plan ? cmsText("gettingYourDownloadReady", "Getting your download ready…") : cmsText("printPdfHighResolution", "Print PDF (High Resolution)")}</div>
                )}
              </div>
              {plan && <p className="text-xs text-[#6B6B6B] break-words">{cmsText("file", "File:") + " "}<span className="font-medium text-[#15191C]">{plan.fileName}</span>{cmsText("forALongListThisCanTakeA", ". For a long list this can take a few minutes; you can keep working, we'll carry on in the background.")}</p>}
            </>
          )}

          {phase === "working" && (
            <div role="status" aria-live="polite" className="space-y-3">
              <p className="text-sm font-medium text-[#15191C]">{cmsText("preparingYourCards", "Preparing your cards…")}</p>
              <div className="h-2.5 w-full rounded-full bg-[#E1EAF8] overflow-hidden"><div className="h-full rounded-full bg-[#1F65FF] transition-all duration-500" style={{ width: `${Math.max(percent, 3)}%` }} /></div>
              <p className="text-sm text-[#4B4F52]">
                {job ? `${job.doneGuests.toLocaleString("en-IN")} of ${job.total.toLocaleString("en-IN")} guests` : cmsText("starting", "Starting…")}
                {job && job.nested ? ` · zip ${Math.min(job.doneParts + 1, job.zips)} of ${job.zips}` : ""}
              </p>
              <p className="text-xs text-[#6B6B6B]">{cmsText("yourDownloadStartsByItselfWhenItIs", "Your download starts by itself when it is ready. If you close this window, press Download Cards again and Download to pick it up.")}</p>
            </div>
          )}

          {phase === "done" && (
            <p className="text-sm text-[#15803D] font-medium" role="status">{cmsText("yourDownloadHasStarted", "Your download has started:") + " "}<span className="break-words">{plan?.fileName}</span>{cmsText("youLlFindItInYourBrowserS", ". You'll find it in your browser's downloads folder.")}</p>
          )}
          {error && <p role="alert" className="text-sm text-[#D92D20]">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#E5E5E5]">
          {phase === "working" ? (
            <button type="button" onClick={onClose} className={`${btn} bg-white border border-[#DDD] text-black`}>{cmsText("close", "Close")}</button>
          ) : (
            <>
              <button type="button" onClick={onClose} className={`${btn} bg-white border border-[#DDD] text-black`}>{phase === "done" ? cmsText("close", "Close") : cmsText("cancel2", "Cancel")}</button>
              {(phase === "planning" || phase === "ready") && (
                <button type="button" onClick={start} disabled={!plan} style={{ backgroundImage: "linear-gradient(180deg, #1F65FF 0%, #2071FF 33%, #2181FF 69%, #1F65FF 100%)" }} className={`${btn} text-white hover:brightness-95 inline-flex items-center gap-2`}><Icon name="events/inv-download-white" width={16} height={16} />{cmsText("downloadCards", "Download Cards")}</button>
              )}
              {phase === "done" && <button type="button" onClick={again} className={`${btn} text-white bg-[#1F65FF] hover:bg-[#1A56DB]`}>{cmsText("downloadAgain", "Download again")}</button>}
              {phase === "failed" && plan && <button type="button" onClick={() => { setError(null); setPhase("ready"); }} className={`${btn} text-white bg-[#1F65FF] hover:bg-[#1A56DB]`}>{cmsText("tryAgain", "Try again")}</button>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

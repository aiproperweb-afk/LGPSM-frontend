"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SelectedTemplate, cardDisplayForServer } from "./eventDraft";
import { templateService, TemplatePreviewPayload } from "@/services/templateService";
import CustomDropdown from "@/components/common/CustomDropdown";
import { resolveImageUrl } from "@/utils/mediaUrl";

interface MobileCardPreviewProps {
  template: SelectedTemplate | null;
  eventTitle: string;
  eventStart: string;
  eventEnd: string;
  venue: string;
  contactNumber?: string;
  /** the host named for the event (printed where the design shows the host) */
  hostName?: string;
  cardDisplay?: TemplatePreviewPayload["cardDisplay"];
  logoKey: string | null;
  categoryName: string;
  subcategoryName: string;
  /** left out when the card can no longer be changed: there is then no "Change Template" button */
  onOpenTemplateModal?: () => void;
  /** Saved "Additional Info" choice (null = not set), printed on the preview with sample labels */
  cardInfo?: TemplatePreviewPayload["cardInfo"] | null;
  /** Opens "Customize Information" with the payload this preview renders */
  onOpenAdditionalInfo?: (payload: TemplatePreviewPayload) => void;
  /** Add Event before a template is chosen: nothing is drawn, a "selecting template" loader stands in */
  awaitingTemplate?: boolean;
}

const ZOOM_SCALE: Record<string, number> = { "100%": 1, "75%": 0.75, "50%": 0.5 };
// the phone frame at 100%, in pixels
const PHONE = { width: 270, radius: 38, bezel: 8 };

export default function MobileCardPreview({
  template,
  eventTitle,
  eventStart,
  eventEnd,
  venue,
  contactNumber,
  hostName,
  cardDisplay,
  logoKey,
  categoryName,
  subcategoryName,
  onOpenTemplateModal,
  cardInfo,
  onOpenAdditionalInfo,
  awaitingTemplate = false,
}: MobileCardPreviewProps) {
  const [zoomLevel, setZoomLevel] = useState("100%");
  const zoom = ZOOM_SCALE[zoomLevel] ?? 1;
  // An uploaded design is the card exactly as it is: no data is drawn on it, so there is nothing to render. Its own picture is shown.
  const staticUrl = template?.staticCard ? resolveImageUrl(template.previewKey) : null;

  // The card is always the real one: the server renders the chosen template with what has been entered so far (title,
  // dates, address, event type, image), so the wording written for this kind of event is visible while filling in the
  // form and follows every change. Nothing static or made up is shown in its place.
  const uploadedLogo = logoKey && /^media:[0-9a-fA-F]{24}$/.test(logoKey) ? logoKey : undefined;
  const payload = useMemo<TemplatePreviewPayload>(
    () => ({
      title: eventTitle.trim() || undefined,
      startIso: eventStart || undefined,
      endIso: eventEnd || undefined,
      venue: venue.trim() || undefined,
      contactNumber: contactNumber?.trim() || undefined,
      hostName: hostName?.trim() || undefined,
      categoryName: categoryName || undefined,
      subcategoryName: subcategoryName || undefined,
      logoKey: uploadedLogo,
      ...(cardInfo ? { cardInfo } : {}),
      // without a logo the card has none, so the preview must not show the designers' sample one in its place
      ...(cardDisplay ? { cardDisplay: { ...cardDisplayForServer(cardDisplay), ...(uploadedLogo ? {} : { logo: false }) } } : {}),
    }),
    [eventTitle, eventStart, eventEnd, venue, contactNumber, hostName, categoryName, subcategoryName, uploadedLogo, cardInfo, cardDisplay]
  );
  // the parent builds cardDisplay/cardInfo afresh on every render, so the payload's identity changes constantly even when nothing was
  // typed: depend on its content, or the card is re-requested (and the spinner flashes) over and over
  const payloadKey = JSON.stringify(payload);
  const payloadRef = useRef(payload);
  const [live, setLive] = useState<{ key: string; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const liveUrl = useRef<string | null>(null);

  useEffect(() => { payloadRef.current = payload; });

  useEffect(() => {
    // No template chosen: the card is still shown, in the design that suits the event type
    // nothing is drawn until the template has been chosen: no stand-in design is shown meanwhile
    if (awaitingTemplate || staticUrl) return;
    const templateId = template?.id ?? null;
    const key = templateId ?? "by-event-type";
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      templateService
        .previewCard(templateId, payloadRef.current, controller.signal)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          if (liveUrl.current) URL.revokeObjectURL(liveUrl.current);
          liveUrl.current = url;
          setLive({ key, url });
          setFailed(false);
        })
        .catch(() => {
          // a card that no longer matches what has been entered is worse than none: drop it and offer "Try again"
          if (controller.signal.aborted) return;
          if (liveUrl.current) { URL.revokeObjectURL(liveUrl.current); liveUrl.current = null; }
          setLive(null);
          setFailed(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [template?.id, payloadKey, attempt, awaitingTemplate, staticUrl]);

  useEffect(
    () => () => {
      if (liveUrl.current) URL.revokeObjectURL(liveUrl.current);
    },
    []
  );

  const showLive = !awaitingTemplate && !staticUrl && live?.key === (template?.id ?? "by-event-type");
  const hasCard = (showLive && !!live) || !!staticUrl;

  return (
    <div className="h-full bg-[#EEF4FF] p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-gray-900">Card Preview</h2>
        <div className="w-28">
          <CustomDropdown
            value={zoomLevel}
            onChange={setZoomLevel}
            options={Object.keys(ZOOM_SCALE).map((z) => ({ value: z, label: z }))}
            ariaLabel="Preview zoom"
          />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div
          className="relative max-w-full aspect-[1/2] bg-[#1E2A33] shadow-xl transition-[width,border-radius,padding] duration-200"
          style={{ width: PHONE.width * zoom, borderRadius: PHONE.radius * zoom, padding: PHONE.bezel * zoom }}
          aria-label="Invitation card preview"
        >
          <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center" style={{ borderRadius: (PHONE.radius - PHONE.bezel) * zoom }}>
            {hasCard && (
              // The screen is taller than the card, so the card is shown whole (nothing trimmed) and the space above and below it is black, like the phone
              // eslint-disable-next-line @next/next/no-img-element -- blob URL rendered by the API, or the uploaded design
              <img src={staticUrl ?? live!.url} alt={`${template?.name || "Template"} invitation card`} className="block h-full w-full object-contain" />
            )}
            {!awaitingTemplate && loading && (
              <div role="status" aria-label="Updating preview" className="absolute top-3 right-3 h-6 w-6 rounded-full bg-white/90 shadow flex items-center justify-center">
                <svg className="h-4 w-4 animate-spin text-[#1F65FF]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
              </div>
            )}
            {awaitingTemplate && (
              <div role="status" aria-live="polite" className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-center bg-gradient-to-b from-[#F3F3F3] to-[#E4E4E4]">
                <svg className="h-9 w-9 animate-spin text-[#1F65FF]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
                <p className="text-xs font-medium text-[#4B4F52]">Selecting template…</p>
                <p className="text-[11px] text-[#6B6B6B]">Your card appears here once you choose one.</p>
              </div>
            )}
            {!awaitingTemplate && !staticUrl && !showLive && !failed && <div aria-hidden className="absolute inset-0 animate-pulse bg-gradient-to-b from-[#F3F3F3] to-[#E4E4E4]" />}
            {!awaitingTemplate && !staticUrl && !showLive && failed && (
              <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-center">
                <p className="text-xs text-[#4B4F52]">The card preview could not be loaded.</p>
                <button type="button" onClick={() => { setFailed(false); setAttempt((n) => n + 1); }} className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E0E0E0] rounded-md cursor-pointer hover:bg-gray-50">
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* said in words, or the unchanged picture looks like a preview that is not updating */}
        {staticUrl && !awaitingTemplate && (
          <p role="status" className="mt-3 max-w-[300px] rounded-md border border-[#C7D7FE] bg-white px-3 py-2 text-center text-xs text-[#1D3A8A]">
            This is an uploaded card. It is sent exactly as it is, so changes to the event details do not appear on it.
          </p>
        )}

        {/* Figma Event_Add event-1: "Change Template" and "Additional Info" side by side ("Edit Additional Info" once set) */}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {onOpenTemplateModal && (
          <button
            type="button"
            onClick={onOpenTemplateModal}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-[#E0E0E0] text-gray-900 text-sm font-medium rounded-md cursor-pointer"
          >
            {template ? "Change Template" : "Select Template"}
          </button>
          )}
          {onOpenAdditionalInfo && (
            <button
              type="button"
              onClick={() => onOpenAdditionalInfo(payload)}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-[#E0E0E0] text-gray-900 text-sm font-medium rounded-md cursor-pointer"
            >
              {cardInfo ? "Edit Additional Info" : "Additional Info"}
            </button>
          )}
        </div>
        <p className="text-xs text-[#4B4F52] mt-3 text-center">
          Looking for custom card design?{" "}
          <Link href="/contact" className="text-[#15803D] font-medium underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}

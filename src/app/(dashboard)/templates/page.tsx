"use client";

import React, { useState, useEffect } from "react";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import PopupMessage from "@/components/common/PopupMessage";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import CustomDropdown from "@/components/common/CustomDropdown";
import TemplateThumb from "@/components/settings/TemplateThumb";
import { useCategories } from "@/hooks/useCategories";
import UploadTemplateModal from "@/components/templates/UploadTemplateModal";
import TextAreasEditor from "@/components/templates/TextAreasEditor";
import EditTemplateModal from "@/components/settings/modals/EditTemplateModal";
import type { TemplateItem } from "@/types/settings";
import { templateService, Template } from "@/services/templateService";
import { eventService, EventData } from "@/services/eventService";
import { useAlert } from "@/context/AlertContext";
import { Skeleton, SkeletonRegion } from "@/components/common/Skeleton";

export interface LivePreview {
  url: string | null;
  eventTitle: string;
  loading: boolean;
}

interface TemplateCard {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  imageKey: string | null;
  isDraft: boolean;
  /** AI-generated or uploaded (drawn from a stored design) */
  isCustom: boolean;
  /** the organizer's own uploaded design */
  isUploaded: boolean;
  /** an administrator's upload whose own wording the event's details replace */
  isDynamic: boolean;
  kind: "INVITATION" | "POSTER";
  /** made by the signed-in user */
  isMine: boolean;
  /** what the edit window starts from */
  item: TemplateItem;
}

// Browse templates; organizers see published ones (backend-enforced), admins also see drafts and manage them
export default function TemplatesPage() {
  const { user } = useAuth();
  const { showAlert, confirm } = useAlert();
  const categories = useCategories();
  const [result, setResult] = useState<{ key: string; templates: TemplateCard[]; error: string | null } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [preview, setPreview] = useState<TemplateCard | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<TemplateCard | null>(null);
  const [areasFor, setAreasFor] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  // bumped by the live refresh: the list is fetched again quietly (the request key is unchanged, so no loading state shows)
  const [liveTick, setLiveTick] = useState(0);
  useLiveRefresh(() => setLiveTick((n) => n + 1), 30_000);
  // the template drawn with the event chosen in the preview panel (null = show the stored sample preview)
  const [livePreview, setLivePreview] = useState<LivePreview | null>(null);
  const requestKey = `${reload}:${user?._id || ""}`;
  const loading = result?.key !== requestKey;
  const templates = result?.templates ?? [];
  const loadError = result?.key === requestKey ? result.error : null;

  useEffect(() => {
    let cancelled = false;
    const toCard = (t: Template): TemplateCard => ({
      id: t._id || t.id || "",
      name: t.name,
      categoryId: typeof t.categoryId === "object" && t.categoryId ? t.categoryId._id : t.categoryId || "",
      subcategoryId: t.subcategoryId || "",
      imageKey: t.previewImageKey || null,
      isDraft: t.isPublished === false,
      isCustom: t.cardDesign === "CUSTOM",
      isUploaded: !!t.templateData?.uploaded,
      isDynamic: !!t.templateData?.dynamicDetails,
      kind: t.kind === "POSTER" ? "POSTER" : "INVITATION",
      isMine: !!user?._id && t.ownerId === user._id,
      item: {
        id: t._id || t.id || "",
        name: t.name,
        categoryId: typeof t.categoryId === "object" && t.categoryId ? t.categoryId._id : t.categoryId || "",
        subcategoryId: t.subcategoryId || "",
        imageKey: t.previewImageKey || null,
        status: t.isPublished === false ? "Saved on Draft" : "Published",
        createdAt: t.createdAt || "",
        cardDesign: t.cardDesign || "CLASSIC",
      },
    });
    templateService.getTemplates().then((res) => {
      if (cancelled) return;
      setResult(
        res.success && Array.isArray(res.data)
          ? { key: requestKey, templates: res.data.map(toCard), error: null }
          : { key: requestKey, templates: [], error: res.message || "Failed to load templates." }
      );
    });
    return () => {
      cancelled = true;
    };
    // requestKey is derived from the two values below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, user?._id, liveTick]);

  const isAdmin = user?.role === "ADMIN";
  /** an administrator manages every template, anyone else their own */
  const canManage = (t: TemplateCard) => isAdmin || t.isMine;
  // every event can fall back on the Master Card, so it is not deleted
  const isMaster = (t: TemplateCard) => t.item.cardDesign === "MASTER";

  /** An administrator's private card (uploaded during Add Event): publishing it shares it with the organizers and writes event details over it */
  const isPrivateAdminCard = (t: TemplateCard) => user?.role === "ADMIN" && t.isMine && t.isUploaded && !t.isDynamic && t.isDraft;

  const togglePublish = async (t: TemplateCard) => {
    const sharing = isPrivateAdminCard(t);
    if (sharing && !(await confirm({ title: "Publish this card", message: "Every organizer will be able to use it. Each event's own name, date and venue are then written over the wording in your picture, and a QR code is added. You can check those places next.", confirmText: "Publish" }))) return;
    const res = await templateService.updateTemplate(t.id, { isPublished: t.isDraft });
    if (res.success) {
      setPreview(null);
      setReload((n) => n + 1);
      if (sharing && (res.data as Template | undefined)?.templateData?.dynamicDetails) setAreasFor(t.id);
    } else {
      showAlert(res.message || "The template could not be updated.", "error");
    }
  };

  const deleteById = async (id: string) => {
    const res = await templateService.deleteTemplate(id);
    if (res.success) {
      setPreview(null);
      setReload((n) => n + 1);
    } else {
      showAlert(res.message || "The template could not be deleted.", "error");
    }
    return !!res.success;
  };
  const removeTemplate = async (t: TemplateCard) => {
    if (!(await confirm({ title: "Delete template", message: `Delete "${t.name}"? ${t.isDraft ? "" : "It will no longer be offered to anyone. "}Events already using it will switch to the default design for their type.`, confirmText: "Delete", tone: "danger" }))) return;
    await deleteById(t.id);
  };
  const saveTemplate = async (t: TemplateCard, next: TemplateItem) => {
    const res = await templateService.updateTemplate(t.id, {
      name: next.name,
      ...(next.categoryId ? { categoryId: next.categoryId, subcategoryId: next.subcategoryId || null } : {}),
      ...(t.isUploaded ? {} : { previewImageKey: next.imageKey || undefined }),
      ...(t.isCustom ? {} : { cardDesign: next.cardDesign }),
      ...(isPrivateAdminCard(t) ? {} : { isPublished: next.status === "Published" }),
    });
    if (!res.success) {
      showAlert(res.message || "The template could not be updated.", "error");
      return false;
    }
    setPreview(null);
    setReload((n) => n + 1);
    showAlert("Template updated.", "success");
    return true;
  };

  const visible = templates.filter(
    (t) => (!selectedCategory || t.categoryId === selectedCategory) && (!selectedSubcategory || t.subcategoryId === selectedSubcategory)
  );
  const labelFor = (t: TemplateCard) =>
    [categories.categoryName(t.categoryId), categories.subcategoryName(t.categoryId, t.subcategoryId)].filter(Boolean).join(" · ") || "Uncategorized";

  return (
    <div className="w-full min-h-full bg-white">
      <PageHeader title="Templates" actions={
        // "Design with AI" is switched off for now: bring its link to /templates/ai back here to switch it on
        <button type="button" onClick={() => setUploadOpen(true)} className="mr-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#1F65FF] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#1A56DB] cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add New Template
        </button>
      } icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>} />
      {uploadOpen && (
        <UploadTemplateModal
          publish
          title="Add New Template"
          onClose={() => setUploadOpen(false)}
          onCreated={() => { setUploadOpen(false); setReload((n) => n + 1); showAlert(isAdmin ? "The template was published. Every organizer can now use it." : "Your template was saved.", "success"); }}
        />
      )}
      <div className="p-4 sm:p-6 w-full space-y-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-[18px]">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Event Category</label>
            <CustomDropdown
              value={selectedCategory}
              onChange={(v) => {
                setSelectedCategory(v);
                setSelectedSubcategory("");
              }}
              options={[{ value: "", label: "All Categories" }, ...categories.categoryOptions]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Event Subcategory</label>
            <CustomDropdown
              value={selectedSubcategory}
              onChange={setSelectedSubcategory}
              disabled={!selectedCategory}
              placeholder={selectedCategory ? "All Subcategories" : "Select a category first"}
              options={selectedCategory ? [{ value: "", label: "All Subcategories" }, ...categories.subcategoryOptionsFor(selectedCategory)] : []}
            />
          </div>
        </div>

        {loading ? (
          <SkeletonRegion label="Loading templates" className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5">
{Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[393/682]" />)}
</SkeletonRegion>
        ) : loadError ? (
          <p role="alert" className="py-16 text-center text-sm text-rose-600 break-words">{loadError}</p>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#6B6B6B]">
            {templates.length === 0 ? "No templates are available yet. Use “Add New Template” to add one." : "No templates match the selected category."}
          </p>
        ) : (
          // Figma Templates: full-width cards (140 x 210 minimum, 2:3), as many per row as fit, with an expand glyph and a
          // "Use This Template" chip on hover; the name and category stay available as the tooltip / accessible name
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5">
            {visible.map((t) => (
              <button
                key={t.id}
                type="button"
                title={`${t.name} · ${labelFor(t)}${t.isCustom && !t.isMine && !t.isUploaded ? " · AI design shared with all organizers" : t.isMine ? " · Yours" : ""}`}
                aria-label={`Preview template ${t.name}`}
                onClick={() => { setLivePreview(null); setPreview(t); }}
                className="group relative text-left bg-white border border-[#E0E0E0] rounded-md overflow-hidden hover:bg-[#EEF3FF] focus-visible:border-black focus:outline-none transition-colors cursor-pointer"
              >
                <TemplateThumb imageKey={t.imageKey} name={t.name} className="" />
                <span aria-hidden className="absolute top-2 right-2 size-6 rounded bg-black/55 text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
                </span>
                {t.isDraft && <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/95 border border-gray-200 text-xs text-gray-700">Draft</span>}
                {(t.isCustom || t.kind === "POSTER") && <span className={`absolute left-2 px-2 py-0.5 rounded bg-black/70 text-xs text-white ${t.isDraft ? "top-9" : "top-2"}`}>{t.kind === "POSTER" ? "Poster" : t.isUploaded ? "Own" : "AI"}</span>}
                <span aria-hidden className="absolute inset-x-2 bottom-2 rounded bg-white px-2 py-1.5 text-center text-xs font-medium text-[#15191C] shadow opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">Use This Template</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <EditTemplateModal
          key={editing.id}
          template={editing.item}
          categories={categories}
          uploaded={editing.isUploaded}
          noPublish={isPrivateAdminCard(editing) || isMaster(editing)}
          noDelete={isMaster(editing)}
          onClose={() => setEditing(null)}
          onSave={(next) => saveTemplate(editing, next)}
          onDelete={deleteById}
        />
      )}
      {areasFor && <TextAreasEditor templateId={areasFor} onClose={(changed) => { setAreasFor(null); if (changed) setReload((n) => n + 1); }} />}

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="template-preview-title">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-auto">
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 id="template-preview-title" className="text-base font-medium text-gray-900">Template Preview</h3>
              <button type="button" onClick={() => { setLivePreview(null); setPreview(null); }} aria-label="Close" className="text-gray-500 hover:text-gray-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="relative">
                {preview.isDynamic && !livePreview ? (
                  <SamplePreview key={preview.id} template={preview} />
                ) : livePreview?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={livePreview.url} alt={`${preview.name} with ${livePreview.eventTitle}`} className="w-full aspect-[393/682] object-contain rounded-md border border-[#E0E0E0] bg-[#F4F5F8]" />
                ) : (
                  <TemplateThumb imageKey={preview.imageKey} name={preview.name} className="rounded-md border border-[#E0E0E0]" />
                )}
                {livePreview?.loading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white/70" role="status" aria-label="Updating preview">
                    <span className="inline-block h-6 w-6 rounded-full border-2 border-[#1F65FF] border-t-transparent animate-spin" />
                  </div>
                )}
                {livePreview?.url && !livePreview.loading && (
                  <p className="mt-2 text-xs text-[#4B4F52] text-center">Showing &ldquo;{livePreview.eventTitle}&rdquo;</p>
                )}
              </div>
              <div className="space-y-4 min-w-0">
                <div>
                  <h4 className="text-xl font-medium text-gray-900 break-words">{preview.name}</h4>
                  <p className="text-sm text-[#4B4F52] mt-1">{labelFor(preview)}</p>
                </div>
                {!preview.isCustom && (
                  <p className="text-sm text-gray-800 bg-[#FEF9C3] border border-[#FEF08A] rounded-md p-3">
                    Create an event with this template to preview it with your event details.
                  </p>
                )}
                {preview.isDraft ? (
                  <p className="text-sm text-[#6B6B6B]">
                    {isPrivateAdminCard(preview) ? "Your own card: you can use it in Add Event exactly as it is (Digital only). Publish it to share it with all organizers." : "This template is a draft. Publish it before it can be used."}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  {preview.isMine && preview.isDynamic && (
                    <button type="button" onClick={() => setAreasFor(preview.id)} className="px-5 py-2.5 border border-[#1F65FF] text-[#1F65FF] hover:bg-[#EAF1FF] text-sm font-medium rounded-md cursor-pointer">
                      Text areas
                    </button>
                  )}
                  {!preview.isDraft && preview.kind === "INVITATION" && (
                    <Link href={`/events/add?template=${preview.id}`} className="px-5 py-2.5 bg-[#1F65FF] hover:bg-[#1A56DB] text-white text-sm font-medium rounded-md">
                      Create an Event
                    </Link>
                  )}
                  {/* "Edit with AI" is switched off for now: uncomment to bring it back
                  {preview.isMine && (
                    <Link href={`/templates/ai?edit=${preview.id}`} className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-medium rounded-md">
                      Edit with AI
                    </Link>
                  )}
                  */}
                  {canManage(preview) && (
                    <button type="button" onClick={() => setEditing(preview)} className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-medium rounded-md cursor-pointer">
                      Edit
                    </button>
                  )}
                  {canManage(preview) && !isMaster(preview) && (isAdmin || preview.isCustom) && (
                    <button type="button" onClick={() => togglePublish(preview)} className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-medium rounded-md cursor-pointer">
                      {preview.isDraft ? "Publish" : "Unpublish"}
                    </button>
                  )}
                  {canManage(preview) && !isMaster(preview) && (
                    <button type="button" onClick={() => removeTemplate(preview)} className="px-5 py-2.5 text-rose-700 hover:bg-rose-50 text-sm font-medium rounded-md cursor-pointer">
                      Delete
                    </button>
                  )}
                </div>
                {preview.isCustom && <EventRenderPanel key={preview.id} template={preview} onLivePreview={setLivePreview} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Draws an AI template with a real event's details for download (posters get a registration QR when a link is given)
function EventRenderPanel({ template, onLivePreview }: { template: TemplateCard; onLivePreview: (p: LivePreview | null) => void }) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [eventsState, setEventsState] = useState<"loading" | "ready" | "error">("loading");
  const [eventId, setEventId] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState<"png" | "jpeg" | null>(null);
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    eventService.getEvents({ limit: 100 }).then((res) => {
      if (cancelled) return;
      // the events API answers with the list itself (older shapes wrapped it in { events })
      const raw: unknown = res.data;
      const list = Array.isArray(raw) ? (raw as EventData[]) : Array.isArray((raw as { events?: EventData[] } | undefined)?.events) ? (raw as { events: EventData[] }).events : [];
      setEvents(list);
      setEventsState(res.success === false ? "error" : "ready");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Redraw the preview with the chosen event (and registration link, for posters). Debounced so typing a link does not
  // fire a request per keystroke; a newer choice cancels an older one still in flight.
  const eventTitle = events.find((e) => (e._id || e.id) === eventId)?.title || "";
  useEffect(() => {
    if (!eventId) {
      onLivePreview(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    const timer = setTimeout(async () => {
      onLivePreview({ url: null, eventTitle, loading: true });
      const res = await templateService.renderForEvent(template.id, { eventId, format: "jpeg", ...(template.kind === "POSTER" && link.trim() ? { registrationUrl: link.trim() } : {}) });
      if (cancelled) return;
      if (!res.ok) {
        onLivePreview(null);
        setMessage({ tone: "error", text: res.message });
        return;
      }
      setMessage(null);
      objectUrl = URL.createObjectURL(res.blob);
      onLivePreview({ url: objectUrl, eventTitle, loading: false });
    }, link ? 600 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl as string), 1000);
    };
    // eventTitle follows eventId; onLivePreview is a state setter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, link, template.id, template.kind]);

  // leaving the panel (closing the modal, choosing another template) returns the stored sample preview
  useEffect(() => () => onLivePreview(null), [onLivePreview]);

  const download = async (format: "png" | "jpeg") => {
    if (!eventId) return;
    setBusy(format);
    setMessage(null);
    const res = await templateService.renderForEvent(template.id, { eventId, format, ...(template.kind === "POSTER" && link.trim() ? { registrationUrl: link.trim() } : {}) });
    setBusy(null);
    if (!res.ok) return setMessage({ tone: "error", text: res.message });
    const url = URL.createObjectURL(res.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.replace(/[^\w-]+/g, "-").toLowerCase() || "template"}.${format === "jpeg" ? "jpg" : "png"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    if (res.qr === "NONE") setMessage({ tone: "info", text: "Downloaded without a QR code: add a registration link to include one." });
    else if (res.qr === "SAMPLE") setMessage({ tone: "info", text: "The QR code on this image is a sample. Each guest's own code is added when you send invitations." });
  };

  return (
    <div className="border-t border-[#E5E5E5] pt-4 space-y-3">
      <h5 className="text-sm font-medium text-gray-900">{template.kind === "POSTER" ? "Download a poster for an event" : "Preview with a real event"}</h5>
      <span className="block text-xs text-[#4B4F52]">Event</span>
      <CustomDropdown
        ariaLabel="Event"
        value={eventId}
        onChange={(v) => {
          setEventId(v);
          setMessage(null);
        }}
        placeholder={eventsState === "loading" ? "Loading events…" : "Choose an event"}
        disabled={eventsState === "loading"}
        emptyMessage={eventsState === "error" ? "Your events could not be loaded" : "You have no events yet"}
        options={events.map((ev) => ({ value: ev._id || ev.id, label: ev.title }))}
      />
      {template.kind === "POSTER" && (
        <>
          <label className="block text-xs text-[#4B4F52]" htmlFor="render-link">Registration link for the QR code (https)</label>
          <input id="render-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" inputMode="url" className="w-full rounded-md border border-[#D9D9D9] bg-white px-3 py-2 text-sm" />
        </>
      )}
      <div className="flex gap-2">
        {(["png", "jpeg"] as const).map((f) => (
          <button key={f} type="button" disabled={!eventId || busy !== null} onClick={() => download(f)} className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-sm rounded-md cursor-pointer">
            {busy === f ? "Preparing…" : f === "png" ? "Download PNG" : "Download JPG"}
          </button>
        ))}
      </div>
      <PopupMessage message={message?.text} type={message?.tone === "error" ? "error" : "info"} />
    </div>
  );
}

// An administrator's uploaded design as an event's card will look: the server draws it with sample details in the marked places
function SamplePreview({ template }: { template: TemplateCard }) {
  const [shown, setShown] = useState<{ url: string | null; failed: boolean }>({ url: null, failed: false });
  useEffect(() => {
    const abort = new AbortController();
    let objectUrl: string | null = null;
    const start = new Date(Date.now() + 30 * 86_400_000);
    start.setHours(18, 0, 0, 0);
    templateService
      .previewCard(template.id, { title: "Sample Event Name", startIso: start.toISOString(), endIso: new Date(start.getTime() + 3 * 3_600_000).toISOString(), venue: "Sample Venue, City", hostName: "Sample Host" }, abort.signal)
      .then((blob) => { objectUrl = URL.createObjectURL(blob); setShown({ url: objectUrl, failed: false }); })
      .catch(() => { if (!abort.signal.aborted) setShown({ url: null, failed: true }); });
    return () => { abort.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [template.id]);

  return (
    <div>
      {shown.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shown.url} alt={`${template.name} with sample event details`} className="w-full aspect-[393/682] object-contain rounded-md border border-[#E0E0E0] bg-[#F4F5F8]" />
      ) : (
        <TemplateThumb imageKey={template.imageKey} name={template.name} className="rounded-md border border-[#E0E0E0]" />
      )}
      <p role="status" className="mt-2 text-xs text-[#4B4F52] text-center">
        {shown.url ? "Shown with sample event details" : shown.failed ? "The preview could not be drawn; this is the picture as uploaded." : "Drawing the preview…"}
      </p>
    </div>
  );
}

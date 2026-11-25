"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import PopupMessage from "@/components/common/PopupMessage";
import PageHeader from "@/components/common/PageHeader";
import Icon from "@/components/icons/Icon";
import BillingDateField, { formatDay } from "@/components/billing/BillingDateField";
import { Invoice, filterInvoices, groupByEvent, validateRange } from "@/components/billing/billingStatement";
import { formatMoney } from "@/utils/money";
import { billingService, type EventBill } from "@/services/billingService";
import { openRazorpayCheckout } from "@/utils/razorpayCheckout";
import { useAuth } from "@/context/AuthContext";

// Organiser Billing (Figma 217:24385 list, 217:23316 filter, and the Download Statement dialog).
//
// The organiser pays for the invitations sent on each event through Razorpay (due = invitations sent x the rate locked on the event,
// minus what was already paid). Paid payments become the invoices listed below; nothing here is invented.

const money = (amount: number) => formatMoney(amount, { minFractionDigits: 1, maxFractionDigits: 1 });

function saveFile(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  // the browser reads the file after the click returns
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export default function BillingPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bills, setBills] = useState<EventBill[]>([]);
  const [paying, setPaying] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = () => Promise.all([billingService.getEventBills(), billingService.getInvoices()]).then(([b, i]) => {
    if (b.success && b.data) setBills(b.data.events);
    if (i.success && i.data) setInvoices(i.data);
    setLoaded(true);
  });
  useEffect(() => { refresh(); }, []);

  const pay = async (bill: EventBill) => {
    setNotice(null);
    setPaying(bill.eventId);
    try {
      const start = await billingService.startPayment(bill.eventId);
      if (!start.success || !start.data) { setNotice({ text: start.message || "Could not start the payment.", ok: false }); return; }
      const result = await openRazorpayCheckout({
        keyId: start.data.keyId, orderId: start.data.providerOrderId, amount: start.data.amount, currency: start.data.currency,
        name: "EventQRapp", description: `${bill.eventName} (${start.data.invitees} invitation${start.data.invitees === 1 ? "" : "s"})`,
        prefill: { name: user?.fullName, email: user?.email },
      });
      if (result.status === "cancelled") { setNotice({ text: "Payment cancelled. Nothing was charged.", ok: false }); return; }
      if (result.status === "failed") { setNotice({ text: result.message, ok: false }); return; }
      const confirmed = await billingService.confirmPayment({ providerOrderId: result.providerOrderId, providerPaymentId: result.providerPaymentId, signature: result.signature });
      if (!confirmed.success) { setNotice({ text: confirmed.message || "We could not confirm the payment. If money was debited it will be matched shortly; check the invoices below.", ok: false }); return; }
      setNotice({ text: `Payment received for ${bill.eventName}. Your invoice is in the list below.`, ok: true });
      await refresh();
    } finally {
      setPaying(null);
    }
  };
  const outstanding = bills.filter((b) => b.due > 0);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState(range);
  const [statementOpen, setStatementOpen] = useState(false);
  const [statement, setStatement] = useState({ from: "", to: "" });
  const [statementError, setStatementError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => filterInvoices(invoices, range, search), [invoices, range, search]);
  // events with something still to pay: they sit at the top of the list with a Pay now button (a date range filters payments, and these have none yet)
  const dueRows = useMemo(() => {
    if (range.from || range.to) return [];
    const q = search.trim().toLowerCase();
    return outstanding.filter((b) => !q || b.eventName.toLowerCase().includes(q));
  }, [outstanding, range.from, range.to, search]);
  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const filtering = !!(range.from || range.to || search.trim());

  useEffect(() => {
    if (!filterOpen) return;
    const close = (e: MouseEvent) => { if (!filterRef.current?.contains(e.target as Node)) setFilterOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setFilterOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [filterOpen]);

  const [downloading, setDownloading] = useState(false);
  /** One PDF per event: several payments of one event share a statement, different events get a file each */
  const downloadPdfs = async (list: Invoice[]) => {
    if (downloading || list.length === 0) return;
    setNotice(null);
    setDownloading(true);
    try {
      const groups = groupByEvent(list);
      for (let n = 0; n < groups.length; n++) {
        const { blob, fileName } = await billingService.statementPdf(groups[n].map((i) => i.id));
        // two events with the same title would otherwise share a file name
        saveFile(groups.length > 1 ? fileName.replace(/\.pdf$/, `-${n + 1}.pdf`) : fileName, blob);
        // browsers drop downloads started in the same instant (and may ask once to allow several)
        if (n < groups.length - 1) await new Promise((r) => window.setTimeout(r, 500));
      }
      if (groups.length > 1) setNotice({ text: `${groups.length} PDFs downloaded, one for each event. If only one appeared, allow multiple downloads for this site.`, ok: true });
    } catch (e) {
      setNotice({ text: e instanceof Error ? e.message : "The PDF could not be made. Please try again.", ok: false });
    } finally {
      setDownloading(false);
    }
  };
  const chosen = invoices.filter((i) => selected.includes(i.id));

  const downloadStatement = () => {
    const problem = validateRange(statement);
    if (problem) { setStatementError(problem); return; }
    const inRange = filterInvoices(invoices, statement, "");
    if (inRange.length === 0) { setStatementError("There are no invoices between these dates, so there is nothing to download."); return; }
    setStatementOpen(false);
    void downloadPdfs(inRange);
  };

  const openStatement = () => { setStatement({ from: "", to: "" }); setStatementError(null); setStatementOpen(true); };

  return (
    <div className="w-full min-h-full bg-white">
      <PageHeader title="Billing" />
      <div className="px-4 sm:px-6 pt-[30px] pb-24 w-full space-y-6">
        {/* Controls: label, a compact search, then the statement action and the date filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5 min-w-0 sm:flex-1">
            <label htmlFor="billing-search" className="text-[17px] font-medium text-black shrink-0">Billing</label>
            <div className="relative w-full sm:max-w-[198px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"><Icon name="reports/search" width={16} height={16} /></span>
              <input
                id="billing-search"
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[47px] pl-11 pr-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-md text-xs font-medium text-gray-900 placeholder:text-[#6B6B6B] focus:outline-none focus:border-black"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 relative" ref={filterRef}>
            {/* with invoices ticked, those are downloaded; with none, a period is asked for */}
            <button type="button" disabled={downloading} onClick={() => (chosen.length ? void downloadPdfs(chosen) : openStatement())} className="h-[46px] px-6 bg-[#1F65FF] hover:bg-[#1A56DB] disabled:opacity-60 disabled:cursor-wait text-white text-base font-semibold rounded-lg cursor-pointer">
              {downloading ? "Preparing PDF…" : chosen.length ? `Download Statement (${chosen.length})` : "Download Statement"}
            </button>
            <button
              type="button"
              aria-label="Filter by date"
              aria-expanded={filterOpen}
              onClick={() => { setDraft(range); setFilterOpen((o) => !o); }}
              className={`size-[22px] flex items-center justify-center cursor-pointer text-[#15191C] ${filterOpen || range.from || range.to ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
            >
              <Icon name="billing/filter" width={22} height={13.2} />
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-[279px] max-w-[calc(100vw-2rem)] z-30" role="dialog" aria-label="Filter by date">
                <div className="flex justify-end px-[21px]" aria-hidden>
                  <svg width="19.5" height="8.5" viewBox="0 0 19.5 8.5" fill="none"><path d="M0 8.5L10 0L19.5 8.5H0Z" fill="#F4F4F4" /></svg>
                </div>
                <div className="bg-[#F4F4F4] rounded-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#E0E0E0] text-base font-medium text-[#15191C]">Filter by date</div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <BillingDateField label="From date" placeholder="From" value={draft.from} onChange={(from) => setDraft((d) => ({ ...d, from, to: d.to && from > d.to ? from : d.to }))} />
                      <BillingDateField label="To date" placeholder="To" value={draft.to} min={draft.from || undefined} onChange={(to) => setDraft((d) => ({ ...d, to }))} />
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setFilterOpen(false)} className="flex-1 py-1.5 bg-white border border-[#DDD] rounded text-[13px] font-semibold text-black cursor-pointer">Cancel</button>
                      <button type="button" onClick={() => { setRange(draft); setFilterOpen(false); }} className="flex-1 py-1.5 bg-[#1F65FF] hover:bg-[#1A56DB] rounded text-[13px] font-semibold text-white cursor-pointer">Apply</button>
                    </div>
                    {(range.from || range.to) && (
                      <button type="button" onClick={() => { setRange({ from: "", to: "" }); setDraft({ from: "", to: "" }); setFilterOpen(false); }} className="w-full text-xs text-[#1F65FF] underline cursor-pointer">Clear dates</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <PopupMessage message={notice && !notice.ok ? notice.text : null} />
        {notice?.ok && <p role="status" className="rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#15803D]">{notice.text}</p>}

        {(range.from || range.to) && (
          <p className="text-xs text-[#4B4F52]">
            Showing payments {range.from ? `from ${formatDay(range.from)}` : ""}{range.from && range.to ? " " : ""}{range.to ? `to ${formatDay(range.to)}` : ""}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
          <input
            id="billing-select-all"
            type="checkbox"
            checked={allSelected}
            disabled={rows.length === 0}
            onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))}
            className="size-4 rounded-sm border-gray-300 cursor-pointer disabled:cursor-not-allowed check-green"
          />
          <label htmlFor="billing-select-all" className={rows.length === 0 ? "" : "cursor-pointer"}>Select All</label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#E0E0E0] text-[#6B6B6B] font-medium text-sm">
                <th className="relative py-3 px-4 w-10"><span className="sr-only">Select</span></th>
                <th className="py-3 px-4 font-medium">Invoice ID</th>
                <th className="py-3 px-4 font-medium">Event Name</th>
                <th className="py-3 px-4 font-medium">No Invitees</th>
                <th className="py-3 px-4 font-medium">Payment Date</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-[#4B4F52]">
              {rows.length === 0 && dueRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center whitespace-normal">
                    <p className="text-base font-medium text-[#15191C]">{filtering ? "No invoices match your search or dates" : loaded ? "No invoices yet" : "Loading…"}</p>
                    <p className="mt-1 text-sm text-[#6B6B6B] max-w-md mx-auto">
                      {filtering
                        ? "Try a different search or clear the dates."
                        : "When you pay for an event's invitations, the invoice is listed here."}
                    </p>
                  </td>
                </tr>
              ) : (
                <>
                {dueRows.map((b) => (
                  <tr key={`due-${b.eventId}`} className="border-b border-[#E0E0E0] h-[46px] bg-[#F8FAFF]">
                    <td className="px-4" />
                    <td className="px-4 text-[#6B6B6B]">Not paid yet</td>
                    <td className="px-4">{b.eventName}</td>
                    <td className="px-4">{b.dueInvitees}</td>
                    <td className="px-4 text-[#6B6B6B]">—</td>
                    <td className="px-4 font-medium text-[#15191C]" title={`${b.dueInvitees} invitation${b.dueInvitees === 1 ? "" : "s"} × ${money(b.ratePerInvitee ?? 0)} + ${b.gstPercent ?? 0}% GST`}>{money(b.due)}</td>
                    <td className="px-4 text-right">
                      {/* unpaid: only Pay now (nothing to download until it is paid) */}
                      <button type="button" disabled={paying !== null} onClick={() => pay(b)} className="h-[34px] px-4 bg-[#1F65FF] hover:bg-[#1A56DB] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg cursor-pointer">
                        {paying === b.eventId ? "Opening…" : "Pay now"}
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#E0E0E0] h-[46px]">
                    <td className="px-4">
                      <input
                        type="checkbox"
                        aria-label={`Select invoice ${r.invoiceId}`}
                        checked={selected.includes(r.id)}
                        onChange={() => setSelected((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]))}
                        className="size-4 rounded-sm border-gray-300 cursor-pointer check-green"
                      />
                    </td>
                    <td className="px-4">{r.invoiceId}</td>
                    <td className="px-4">{r.eventName}</td>
                    <td className="px-4">{r.invitees}</td>
                    <td className="px-4">{formatDay(r.paymentDate.slice(0, 10))}</td>
                    <td className="px-4">{money(r.amount)}</td>
                    <td className="px-4 text-right">
                      <button
                        type="button"
                        aria-label={`Download invoice ${r.invoiceId} as PDF`}
                        title="Download PDF"
                        disabled={downloading}
                        onClick={() => void downloadPdfs([r])}
                        className="group inline-flex items-center justify-center size-6 cursor-pointer disabled:cursor-wait text-[#4B4F52]"
                      >
                        <span className="group-hover:hidden opacity-70"><Icon name="billing/download" width={15.83} height={19.22} /></span>
                        <span className="hidden group-hover:block"><Icon name="billing/download-active" width={15.83} height={19.22} /></span>
                      </button>
                    </td>
                  </tr>
                ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {statementOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="statement-title">
          <div className="bg-white border border-[#E5E5E5] rounded-lg w-full max-w-[488px] overflow-y-auto max-h-[calc(100dvh-2rem)]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5]">
              <h2 id="statement-title" className="text-base font-medium text-[#15191C]">Download Statement</h2>
              <button type="button" onClick={() => setStatementOpen(false)} aria-label="Close" className="text-[#15191C] cursor-pointer"><Icon name="billing/close" width={16} height={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="block text-xs font-medium text-[#15191C] mb-2">From<span className="text-red-500">*</span></span>
                <BillingDateField label="Statement from date" placeholder="Select Date" value={statement.from} onChange={(from) => { setStatement((s) => ({ ...s, from, to: s.to && from > s.to ? from : s.to })); setStatementError(null); }} />
              </div>
              <div>
                <span className="block text-xs font-medium text-[#15191C] mb-2">To<span className="text-red-500">*</span></span>
                <BillingDateField label="Statement to date" placeholder="Select Date" value={statement.to} min={statement.from || undefined} onChange={(to) => { setStatement((s) => ({ ...s, to })); setStatementError(null); }} />
              </div>
              <p className="text-xs text-[#6B6B6B]">You get one PDF for each event paid for between these dates.</p>
              <PopupMessage message={statementError} />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E5E5]">
              <button type="button" onClick={downloadStatement} className="px-6 py-2.5 bg-[#1F65FF] hover:bg-[#1A56DB] rounded-md text-base font-semibold text-white cursor-pointer">Download Statement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

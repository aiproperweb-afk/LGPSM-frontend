import { tokenStorage } from "./tokenStorage";
import { API_BASE_URL, apiClient } from "./apiClient";
import type { Invoice } from "@/components/billing/billingStatement";

export interface EventBill {
  eventId: string;
  eventName: string;
  eventStart?: string;
  invitesSent: number;
  ratePerInvitee: number | null;
  billed: number;
  paid: number;
  due: number;
  dueInvitees: number;
  /** of the amount due, the guests an administrator is waiting to invite on WhatsApp */
  requestedInvitees?: number;
  /** Pay Later: when the amount due has to be paid by (the event's end), and whether that has passed */
  payBy?: string;
  overdue?: boolean;
  dueSubtotal?: number;
  dueTax?: number;
  gstPercent?: number;
  currency: string;
}
export interface BillQuote { invitees: number; rate: number | null; subtotal: number; gstPercent: number; tax: number; total: number; currency: string; selected: number; alreadyPaid: number; payable: boolean; /** email costs nothing */ free?: boolean; /** the server cannot send WhatsApp, so nothing is charged */ whatsappUnavailable?: boolean; organizerName?: string; /** administrator only: everything owed so far with these guests, which an offline payment settles */ owed?: BillAmount; /** administrator only: the Pay Later deadline (the event's end) */ payBy?: string; /** administrator only: something on this event was sent on Pay Later */ payLater?: boolean }
export interface BillAmount { invitees: number; rate: number; subtotal: number; gstPercent: number; tax: number; total: number; currency: string }
/** What a bill is for: invitations going by this channel (email is free), or printed cards */
export type BillFor = { channel: "EMAIL" | "WHATSAPP" | "BOTH" } | { purpose: "CARDS" };
/** A payment that went through (never one that was only started or failed) */
export interface PaidPayment { eventId: string; eventName: string; amount: number; at: string }
export interface EventBills { currency: string; totalDue: number; totalPaid: number; /** everything really paid, across all the organizer's events */ paidTotal?: number; payments?: PaidPayment[]; events: EventBill[] }
export interface PaymentStart { keyId: string; providerOrderId: string; amount: number; currency: string; eventId: string; eventName: string; invitees: number; subtotal: number; tax: number; total: number; gstPercent: number }

export const billingService = {
  getEventBills: () => apiClient<EventBills>("/api/v1/billing/events", { method: "GET" }, true),
  /** The bill for these guests (guests x rate, GST, total); creates nothing. An administrator may ask too, and sees the organizer's bill. */
  quote: (eventId: string, inviteeIds: string[], what: BillFor) => apiClient<BillQuote>("/api/v1/billing/quote", { method: "POST", body: JSON.stringify({ eventId, inviteeIds, ...what }) }, true),
  /** Administrator: ask the organizer to pay for these guests' WhatsApp invitations (shown as due on their Billing page) */
  requestPayment: (eventId: string, inviteeIds: string[]) => apiClient<BillQuote & { requested: boolean }>("/api/v1/billing/request", { method: "POST", body: JSON.stringify({ eventId, inviteeIds }) }, true),
  /** Administrator: record that the organizer paid outside the platform: everything owed so far, with these guests */
  settle: (eventId: string, inviteeIds: string[], note?: string) => apiClient<BillAmount & { invoiceNumber: string }>("/api/v1/billing/settle", { method: "POST", body: JSON.stringify({ eventId, inviteeIds, note: note || undefined }) }, true),
  /** Starts the Razorpay payment: for these guests when given, otherwise for what is due on the event */
  startPayment: (eventId: string, inviteeIds?: string[], what?: BillFor) => apiClient<PaymentStart>("/api/v1/billing/pay", { method: "POST", body: JSON.stringify({ eventId, inviteeIds, ...what }) }, true),
  confirmPayment: (p: { providerOrderId: string; providerPaymentId: string; signature: string }) =>
    apiClient<unknown>("/api/v1/payments/verify", { method: "POST", body: JSON.stringify(p) }, true),
  getInvoices: () => apiClient<Invoice[]>("/api/v1/billing/invoices", { method: "GET" }, true),

  /** One PDF for these invoices (all of the same event): an invoice, or a statement of several payments */
  async statementPdf(ids: string[]): Promise<{ blob: Blob; fileName: string }> {
    const ask = () => {
      const token = tokenStorage.getAccessToken();
      return fetch(`${API_BASE_URL}/api/v1/billing/statement.pdf?ids=${ids.join(",")}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    };
    let res = await ask();
    if (res.status === 401) {
      // an ordinary signed-in read renews the session, then the file is asked for again
      await apiClient("/api/v1/billing/invoices", { method: "GET", cache: "no-store" }, true);
      res = await ask();
    }
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message || "The PDF could not be made. Please try again.");
    }
    const named = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") || "")?.[1];
    return { blob: await res.blob(), fileName: named || "invoice.pdf" };
  },
};

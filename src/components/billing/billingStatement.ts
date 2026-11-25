// Billing data helpers: filtering the invoices, checking a statement's dates, and splitting a download into one document per event.

export interface Invoice {
  id: string;
  invoiceId: string;
  eventId?: string;
  eventName: string;
  invitees: number;
  /** ISO date or date-time of the payment */
  paymentDate: string;
  amount: number;
  currency?: string;
}

export interface DateRange { from: string; to: string }

const dayOf = (iso: string) => iso.slice(0, 10);

/** Inclusive on both ends; an empty side is open. Dates are compared as calendar days (YYYY-MM-DD). */
export function filterInvoices(invoices: Invoice[], range: Partial<DateRange>, search: string): Invoice[] {
  const q = search.trim().toLowerCase();
  return invoices.filter((i) => {
    const day = dayOf(i.paymentDate);
    if (range.from && day < range.from) return false;
    if (range.to && day > range.to) return false;
    return !q || [i.invoiceId, i.eventName].some((v) => v.toLowerCase().includes(q));
  });
}

export function validateRange(range: DateRange): string | null {
  if (!range.from) return "Choose a From date.";
  if (!range.to) return "Choose a To date.";
  if (range.from > range.to) return "The From date must not be after the To date.";
  return null;
}

/** Each event's invoices together, in the order the events first appear: payments of different events are never put in one document */
export function groupByEvent(invoices: Invoice[]): Invoice[][] {
  const groups = new Map<string, Invoice[]>();
  for (const i of invoices) {
    const key = i.eventId || `name:${i.eventName}`;
    groups.set(key, [...(groups.get(key) ?? []), i]);
  }
  return [...groups.values()];
}

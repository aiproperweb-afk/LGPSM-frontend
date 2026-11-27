export interface EarningsRecord {
  id: string;
  organizer: string;
  eventName: string;
  dateOfPayment: string;
  invites: number;
  /** null when no rate was in force for this event */
  rate: number | null;
  /** an organizer's row whose events are charged at different rates */
  mixedRates?: boolean;
  amount: number;
  // ISO start of the event, used for the date-range filter
  eventStart?: string;
}

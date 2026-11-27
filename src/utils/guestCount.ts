// "No of Guests": how many people one guest's pass admits (a family invited on one card). The heading rule is the server's
// (Backend utils/guestCount.ts), so the preview shows what will be imported.

export const MAX_GUESTS_PER_PASS = 100;
export const GUEST_COUNT_HEADER = "No of Guests";

/** Is this column heading the number of guests? A heading that only says "Guest" is the name column, so a count word is needed. */
export function isGuestCountHeader(title: string | null | undefined): boolean {
  const t = String(title ?? "").toLowerCase().replace(/[^a-z]+/g, "");
  return /^(no|nos|num|number|count|total|qty|quantity)(of)?(guests?|persons?|people|members?|pax|attendees?)$/.test(t)
    || /^(guests?|persons?|people|members?|attendees?)count$/.test(t)
    || /^(pax|headcount|noofpax)$/.test(t);
}

/** The number written in a cell, or null when it is not a whole number from 1 to the maximum */
export function parseGuestCount(value: unknown): number | null {
  const text = String(value ?? "").trim();
  if (!/^\d{1,4}$/.test(text)) return null;
  const n = Number(text);
  return n >= 1 && n <= MAX_GUESTS_PER_PASS ? n : null;
}

/** What is wrong with a guest count as typed, or null */
export function guestCountProblem(value: unknown): string | null {
  if (!String(value ?? "").trim()) return `${GUEST_COUNT_HEADER} is required`;
  return parseGuestCount(value) === null ? `${GUEST_COUNT_HEADER} must be a whole number from 1 to ${MAX_GUESTS_PER_PASS}` : null;
}

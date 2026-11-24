// The invitee list's Filter & Sorting panel: which guests are shown and in what order. Everything here is worked out from the guests'
// own data (their delivery status, RSVP and food choices), so the options only appear when the event actually has them.
import { dietaryAnswer } from "./dietaryAnswers.ts";

export type InvitationFilter = "" | "SENT" | "NOT_SENT";
export type RsvpFilter = "" | "ACCEPTED" | "DECLINED" | "PENDING";
export type CardsFilter = "" | "DOWNLOADED" | "NOT_DOWNLOADED";
export type SortOrder = "ANY" | "AZ" | "ZA";
export interface FoodFilter { title: string; value: string }

export interface InviteeFilters {
  /** a session's id, or "" for the whole event */
  session: string;
  invitation: InvitationFilter;
  /** printed cards: guests whose card was downloaded, or not yet (events that print cards) */
  cards: CardsFilter;
  food: FoodFilter | null;
  rsvp: RsvpFilter;
  sort: SortOrder;
}

export const NO_FILTERS: InviteeFilters = { session: "", invitation: "", cards: "", food: null, rsvp: "", sort: "ANY" };

interface GuestLike {
  name: string;
  invitationStatus?: string;
  cardDownloadedAt?: string;
  rsvpStatus?: string;
  dietaryPreference?: string;
  dietarySelections?: { title: string; value: string }[];
}

/** How many choices are active (shown as the number on the Filter button); the session is chosen in its own dropdown, so it counts too */
export const activeFilterCount = (f: InviteeFilters): number =>
  (f.session ? 1 : 0) + (f.invitation ? 1 : 0) + (f.cards ? 1 : 0) + (f.food ? 1 : 0) + (f.rsvp ? 1 : 0) + (f.sort !== "ANY" ? 1 : 0);

/** The panel's choices (invitation, food, RSVP, order) applied to guests already narrowed by search and session */
export function applyInviteeFilters<T extends GuestLike>(guests: T[], f: Pick<InviteeFilters, "invitation" | "cards" | "food" | "rsvp" | "sort">, foodTitles: string[]): T[] {
  const kept = guests.filter((g) =>
    (!f.invitation || (f.invitation === "SENT") === (g.invitationStatus === "SENT")) &&
    (!f.cards || (f.cards === "DOWNLOADED") === !!g.cardDownloadedAt) &&
    (!f.rsvp || (g.rsvpStatus || "PENDING") === f.rsvp) &&
    (!f.food || dietaryAnswer(g, f.food.title, foodTitles) === f.food.value)
  );
  if (f.sort === "ANY") return kept;
  const dir = f.sort === "AZ" ? 1 : -1;
  return [...kept].sort((a, b) => dir * a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

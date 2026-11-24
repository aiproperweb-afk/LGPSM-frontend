import test from "node:test";
import assert from "node:assert/strict";
import { applyInviteeFilters, activeFilterCount, NO_FILTERS } from "./inviteeFilters.ts";
import { dietaryQuestionOptions } from "./dietaryAnswers.ts";

const g = (name: string, invitationStatus: string, rsvpStatus: string, food?: string, cardDownloadedAt?: string) => ({ name, invitationStatus, rsvpStatus, cardDownloadedAt, dietarySelections: food ? [{ title: "Lunch", value: food }] : [] });
const guests = [g("Zed", "SENT", "ACCEPTED", "Veg", "2026-11-24"), g("amy", "PENDING", "PENDING"), g("Bob", "SENT", "DECLINED", "Non-veg")];
const names = (l: { name: string }[]) => l.map((x) => x.name);

test("invitation, RSVP and food choices narrow the list", () => {
  assert.deepEqual(names(applyInviteeFilters(guests, { ...NO_FILTERS, invitation: "SENT" }, ["Lunch"])), ["Zed", "Bob"]);
  assert.deepEqual(names(applyInviteeFilters(guests, { ...NO_FILTERS, invitation: "NOT_SENT" }, ["Lunch"])), ["amy"]);
  assert.deepEqual(names(applyInviteeFilters(guests, { ...NO_FILTERS, rsvp: "PENDING" }, ["Lunch"])), ["amy"]);
  assert.deepEqual(names(applyInviteeFilters(guests, { ...NO_FILTERS, food: { title: "Lunch", value: "Veg" } }, ["Lunch"])), ["Zed"]);
});
test("printed cards: downloaded or not yet", () => {
  assert.deepEqual(names(applyInviteeFilters(guests, { ...NO_FILTERS, cards: "DOWNLOADED" }, [])), ["Zed"]);
  assert.deepEqual(names(applyInviteeFilters(guests, { ...NO_FILTERS, cards: "NOT_DOWNLOADED" }, [])), ["amy", "Bob"]);
});
test("alphabetical order ignores case and does not touch the original array", () => {
  assert.deepEqual(names(applyInviteeFilters(guests, { ...NO_FILTERS, sort: "AZ" }, [])), ["amy", "Bob", "Zed"]);
  assert.deepEqual(names(applyInviteeFilters(guests, { ...NO_FILTERS, sort: "ZA" }, [])), ["Zed", "Bob", "amy"]);
  assert.deepEqual(names(guests), ["Zed", "amy", "Bob"]);
});
test("the Filter button counts each active choice", () => {
  assert.equal(activeFilterCount(NO_FILTERS), 0);
  assert.equal(activeFilterCount({ session: "s1", invitation: "SENT", cards: "DOWNLOADED", food: null, rsvp: "ACCEPTED", sort: "AZ" }), 5);
});
test("the food choices come from the event's own questions", () => {
  assert.deepEqual(dietaryQuestionOptions({ enabled: true, options: [{ title: "Lunch", options: ["Veg", "Non-veg", "Veg"] }, { title: "Drinks", options: [] }] }), [{ title: "Lunch", options: ["Veg", "Non-veg"] }]);
  assert.deepEqual(dietaryQuestionOptions({ enabled: true, title: "Food", options: ["A", "B"] }), [{ title: "Food", options: ["A", "B"] }]);
  assert.deepEqual(dietaryQuestionOptions({ enabled: false, options: ["A"] }), []);
});

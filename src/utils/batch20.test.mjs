// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { isGuestCountHeader, parseGuestCount, guestCountProblem } from "./guestCount.ts";
import { planSameList, sheetSignature } from "./sameSheet.ts";
import { sessionsToSave, scopeForSession } from "./assignScope.ts";
import { matchOptions } from "./searchOptions.ts";
import { movedBox, resizedBox } from "./areaBox.ts";
import { organizerForm, organizerFormProblem, organizerChanges } from "./organizerForm.ts";
import { allowedIn } from "./sessionAccess.ts";
import { pendingText } from "./verification.ts";

test("guest count headings and values", () => {
  for (const h of ["No of Guests", "No. of Guests", "NUMBER OF GUESTS", "Guest Count", "Pax", "No of Persons"]) assert.ok(isGuestCountHeader(h), h);
  for (const h of ["Guest", "Guests", "Guest Name", "Name", "Mobile No", "Guest No", "Number", "Table No"]) assert.ok(!isGuestCountHeader(h), h);
  assert.deepEqual(["1", "10", "100"].map(parseGuestCount), [1, 10, 100]);
  assert.deepEqual(["0", "101", "-1", "2.5", "ten", ""].map(parseGuestCount), [null, null, null, null, null, null]);
  assert.equal(guestCountProblem("4"), null);
  assert.match(guestCountProblem(""), /required/);
});

const row = (name, email, extra = {}) => ({ name, email, phone: "", guests: "1", company: "", ...extra });
const session = (key, source = null) => ({ key, name: key, inviteeSource: source ? "COPY_SESSION" : "NEW_LIST", sourceSessionKey: source });

test("the same guest list is recognised whatever the row order, and a changed one is not", () => {
  const a = [row("A", "a@x.com", { phone: "+91 98765 43210" }), row("B", "b@x.com")];
  assert.equal(sheetSignature(a), sheetSignature([row("B", "B@X.COM"), row("A", "a@x.com", { phone: "919876543210" })]));
  assert.notEqual(sheetSignature(a), sheetSignature([a[0]]));
  assert.notEqual(sheetSignature(a), sheetSignature([a[0], row("B", "b@x.com", { guests: "3" })]));
});

test("a later session given an earlier session's file keeps its invitees", () => {
  const sessions = [session("entry"), session("lunch"), session("dinner")];
  const plan = planSameList(sessions, { entry: "x", lunch: "y" }, "dinner", "x");
  assert.equal(plan.copy, "dinner");
  assert.equal(plan.source, "entry");
  assert.deepEqual(plan.sessions[2], { ...sessions[2], inviteeSource: "COPY_SESSION", sourceSessionKey: "entry" });
  assert.equal(planSameList(sessions, { entry: "x" }, "dinner", "z"), null);
  assert.equal(planSameList(sessions, { dinner: "x" }, "dinner", "x"), null);
});

test("an earlier session given a later session's file takes it over, and whoever copied the later one follows", () => {
  const sessions = [session("entry"), session("lunch"), session("dinner"), session("bar", "dinner")];
  const plan = planSameList(sessions, { dinner: "x" }, "lunch", "x");
  assert.equal(plan.source, "lunch");
  assert.equal(plan.copy, "dinner");
  assert.deepEqual(plan.sessions.map((s) => [s.key, s.sourceSessionKey]), [["entry", null], ["lunch", null], ["dinner", "lunch"], ["bar", "lunch"]]);
});

test("assigning from a chosen session adds it without taking sessions away", () => {
  assert.deepEqual(scopeForSession("b", null), ["b"]);
  assert.deepEqual(scopeForSession("b", ["a"]), ["a", "b"]);
  assert.equal(scopeForSession("b", []), null); // already on every session
  assert.deepEqual(sessionsToSave(null, ["a"], true), []);
  assert.deepEqual(sessionsToSave(["b"], ["a"], true), ["a", "b"]);
  assert.deepEqual(sessionsToSave(["b"], [], true), []);
  assert.deepEqual(sessionsToSave(["b"], null, true), ["b"]);
  assert.deepEqual(sessionsToSave(["b"], ["a"], false), ["b"]);
});

test("the organizer search matches names and emails, word by word", () => {
  const options = [{ value: "", label: "All Organizers" }, { value: "1", label: "Soil Trust", hint: "Asha Rao · asha@x.com" }];
  assert.deepEqual(matchOptions(options, "").map((o) => o.value), ["", "1"]);
  assert.deepEqual(matchOptions(options, "asha soil").map((o) => o.value), ["1"]);
  assert.deepEqual(matchOptions(options, "all").map((o) => o.value), [""]);
  assert.deepEqual(matchOptions(options, "zzz"), []);
});

test("marked boxes stay in the middle of the card's width", () => {
  const canvas = { width: 1000, height: 2000 };
  assert.deepEqual(movedBox({ x: 0, y: 100, w: 400, h: 80 }, 50, canvas), { x: 300, y: 150 });
  assert.deepEqual(movedBox({ x: 600, y: 100, w: 400, h: 80 }, -500, canvas), { x: 300, y: 0 });
  assert.deepEqual(resizedBox({ x: 300, y: 100, w: 400, h: 80 }, 50, 20, canvas, false), { x: 250, y: 100, w: 500, h: 100 });
  assert.deepEqual(resizedBox({ x: 400, y: 100, w: 200, h: 200 }, 50, 0, canvas, true), { x: 350, y: 100, w: 300, h: 300 });
});

test("editing an organizer sends only what changed", () => {
  const account = { fullName: "Asha Rao", email: "asha@x.com", phone: "919876543210", profile: { organizationName: "Soil Trust", organizationType: "ORGANIZATION" } };
  const form = organizerForm(account);
  assert.equal(form.phone, "9876543210");
  assert.equal(organizerChanges(account, form), null);
  assert.deepEqual(organizerChanges(account, { ...form, email: "NEW@x.com", phone: "9000000000" }), { email: "new@x.com", phone: "9000000000" });
  assert.deepEqual(organizerChanges(account, { ...form, type: "INDIVIDUAL" }), { profile: { organizationType: "INDIVIDUAL" } });
  assert.match(organizerFormProblem({ ...form, organizationName: "" }), /organization name/);
  assert.equal(organizerFormProblem(form), null);
});

test("session access follows the list a session shares", () => {
  const sessions = [{ _id: "a" }, { _id: "b", inviteeSource: "COPY_SESSION", sourceSessionId: "a" }, { _id: "c" }];
  const guest = { sessionAccess: [{ sessionId: "a", allowed: true }, { sessionId: "c", allowed: false }] };
  assert.deepEqual(sessions.map((s) => allowedIn(guest, s)), [true, true, false]);
  assert.ok(allowedIn({ sessionAccess: [] }, sessions[2]));
});

test("what is still to verify is said in words", () => {
  assert.equal(pendingText(null), "");
  assert.equal(pendingText({ email: false, phone: false }), "");
  assert.match(pendingText({ email: true, phone: true }), /email address and mobile number/);
  assert.match(pendingText({ email: false, phone: true }), /your mobile number/);
});

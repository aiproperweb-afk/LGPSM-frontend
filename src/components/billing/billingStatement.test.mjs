// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { filterInvoices, validateRange, groupByEvent } from "./billingStatement.ts";

const inv = (id, event, date, n = 5, amount = 1000) => ({ id, invoiceId: id, eventName: event, invitees: n, paymentDate: date, amount });
const list = [inv("A1", "Gala", "2026-01-04T10:00:00Z"), inv("B2", "Summit", "2026-01-20"), inv("C3", "Gala night", "2026-02-01")];

test("an empty list stays empty whatever is asked", () => {
  assert.deepEqual(filterInvoices([], { from: "2026-01-01", to: "2026-12-31" }, "x"), []);
});

test("the date range is inclusive on both ends and open when a side is empty", () => {
  assert.deepEqual(filterInvoices(list, { from: "2026-01-04", to: "2026-01-20" }, "").map((i) => i.id), ["A1", "B2"]);
  assert.deepEqual(filterInvoices(list, { from: "2026-01-21" }, "").map((i) => i.id), ["C3"]);
  assert.equal(filterInvoices(list, {}, "").length, 3);
});

test("search matches invoice id or event name, ignoring case", () => {
  assert.deepEqual(filterInvoices(list, {}, "gala").map((i) => i.id), ["A1", "C3"]);
  assert.deepEqual(filterInvoices(list, {}, "b2").map((i) => i.id), ["B2"]);
});

test("a statement range needs both dates, in order", () => {
  assert.match(validateRange({ from: "", to: "2026-01-02" }), /From/);
  assert.match(validateRange({ from: "2026-01-02", to: "" }), /To/);
  assert.match(validateRange({ from: "2026-02-01", to: "2026-01-01" }), /not be after/);
  assert.equal(validateRange({ from: "2026-01-01", to: "2026-01-01" }), null);
});

test("a download is split into one document for each event", () => {
  const of = (id, eventId, eventName) => ({ ...inv(id, eventName, "2026-01-04"), eventId });
  const groups = groupByEvent([of("A1", "e1", "Gala"), of("B2", "e2", "Summit"), of("C3", "e1", "Gala")]);
  assert.deepEqual(groups.map((g) => g.map((i) => i.id)), [["A1", "C3"], ["B2"]]);
});

test("two events with the same name stay apart, and an invoice without an event id is grouped by name", () => {
  const of = (id, eventId) => ({ ...inv(id, "Gala", "2026-01-04"), eventId });
  assert.equal(groupByEvent([of("A1", "e1"), of("B2", "e2")]).length, 2);
  assert.equal(groupByEvent([inv("A1", "Gala", "2026-01-04"), inv("B2", "Gala", "2026-01-05")]).length, 1);
  assert.deepEqual(groupByEvent([]), []);
});

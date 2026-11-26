import test from "node:test";
import assert from "node:assert/strict";
import { countSessionStaff } from "./sessionStaff.ts";

test("an assignment with no sessions named counts for every session", () => {
  const { everySession, bySession } = countSessionStaff([{ sessionIds: [] }, {}, { sessionIds: ["a", { _id: "b" }] }, { sessionIds: [{ _id: "a" }] }]);
  assert.equal(everySession, 2);
  assert.equal(everySession + (bySession.get("a") ?? 0), 4);
  assert.equal(everySession + (bySession.get("b") ?? 0), 3);
  assert.equal(everySession + (bySession.get("c") ?? 0), 2);
});

test("no assignments, no staff", () => {
  const { everySession, bySession } = countSessionStaff([]);
  assert.equal(everySession, 0);
  assert.equal(bySession.size, 0);
});

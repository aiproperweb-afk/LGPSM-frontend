// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { savePendingVerification, readPendingVerification, clearPendingVerification } from "./pendingVerification.ts";

const store = () => {
  const data = new Map();
  return { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) };
};

test("a pending sign-up is remembered with the step it is on, and forgotten when done", () => {
  const tab = store();
  assert.equal(readPendingVerification(tab), null);
  savePendingVerification(" rina@example.com ", "email", tab);
  assert.deepEqual(readPendingVerification(tab), { email: "rina@example.com", step: "email" });
  savePendingVerification("rina@example.com", "phone", tab);
  assert.equal(readPendingVerification(tab).step, "phone");
  clearPendingVerification(tab);
  assert.equal(readPendingVerification(tab), null);
});

test("blocked storage never breaks the page", () => {
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  savePendingVerification("a@b.com", "email", blocked);
  clearPendingVerification(blocked);
  assert.equal(readPendingVerification(blocked), null);
});

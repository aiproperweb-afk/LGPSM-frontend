import { test } from "node:test";
import assert from "node:assert/strict";
import { computeResize, formatLength } from "./resizeMath.ts";
import { validateBuilderData, breakpointForWidth, publishProblems, formFields, visitNodes } from "./schema.ts";
import { buildDefaultPage } from "./defaults.ts";

const resize = {
  handle: "se",
  start: { width: 200, height: 100 },
  delta: { x: 50, y: 0 },
  lockAspect: true,
  min: { width: 40, height: 20 },
  max: { width: 300, height: 150 },
  grid: 0,
};

test("corner resize preserves aspect ratio and clamps both dimensions", () => {
  const changed = computeResize(resize);
  assert.deepEqual([changed.width, changed.height], [250, 125]);
  const clamped = computeResize({ ...resize, delta: { x: 500, y: 500 } });
  assert.deepEqual([clamped.width, clamped.height], [300, 150]);
});

test("west handles, alignment snapping and percentage sizes", () => {
  const changed = computeResize({
    ...resize, handle: "w", lockAspect: false, delta: { x: 52, y: 40 },
    snapWidths: [150],
  });
  assert.deepEqual([changed.width, changed.height, changed.snappedWidth], [150, 100, 150]);
  assert.equal(formatLength(changed.width, 300, "%"), "50%");
  assert.deepEqual([390, 768, 1280].map(breakpointForWidth), ["mobile", "tablet", "desktop"]);
});

test("nested dimensions survive validation and duplicate IDs are rejected", () => {
  const heading = { type: "Heading", props: { id: "heading-1", text: "Contact us", style: { mobile: { width: "75%" } } } };
  const page = {
    root: { props: { builder: "contact", schemaVersion: 2 } },
    content: [{ type: "Container", props: { id: "container-1", content: [heading] } }],
  };
  const result = validateBuilderData(page);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.data.content[0].props.content[0].props.style.mobile.width, "75%");
  page.content[0].props.content.push(heading);
  assert.equal(validateBuilderData(page).ok, false);
});

test("the default Contact page passes publishing checks with its original form bindings", () => {
  const result = validateBuilderData(buildDefaultPage());
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.deepEqual(publishProblems(result.data), []);
  let formId;
  visitNodes(result.data.content, node => {
    if (node.type === "ContactForm") formId = node.props.id;
  });
  assert.ok(formId);
  assert.deepEqual(formFields(result.data, formId).map(field => field.binding), ["name", "email", "phone", "message"]);
});

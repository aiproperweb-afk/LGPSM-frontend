import { test } from "node:test";
import assert from "node:assert/strict";
import { computeResize, formatLength } from "./resizeMath.ts";
import { COMPONENTS, validateBuilderData, breakpointForWidth, publishProblems, formFields, visitNodes } from "./schema.ts";
import { buildDefaultPage, componentDefaults } from "./defaults.ts";
import { heroBlocks } from "../heroBlocks.ts";
import { homeContent } from "../homeContent.ts";

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

test("every registered block initializes and site sections require an approved classic contract", () => {
  for (const type of Object.keys(COMPONENTS)) assert.doesNotThrow(() => componentDefaults(type));
  const page = {
    root: { props: { builder: "visual", schemaVersion: 2 } },
    content: [{ type: "ExistingSection", props: { id: "hero", source: "Hero", copy: { id: "Hero" } } }],
  };
  assert.equal(validateBuilderData(page).ok, false);
  assert.equal(validateBuilderData(page, () => false).ok, false);
  const accepted = validateBuilderData(page, (source, copy) => source === copy.id && ["approved-image"]);
  assert.equal(accepted.ok, true);
  assert.deepEqual(accepted.mediaIds, ["approved-image"]);
  assert.equal(accepted.data.root.props.builder, "visual");
});

test("migrated Home and shared branding are independently editable and pass validation", () => {
  const fixtures = [
    { type: "HeroSection", props: { id: "HeroSection", ...homeContent.HeroSection } },
    { type: "SiteChromeCopy", props: { id: "footer", labels: { logoLinkLabel: "Homepage", description: "Footer description" } } },
    { type: "SiteChromeCopy", props: { id: "navbar", labels: { logoLinkLabel: "Homepage" } } },
  ];
  for (const section of fixtures) {
    const hero = heroBlocks(section, section.props.id);
    const data = {
      root: { props: { builder: "visual", schemaVersion: 2 } },
      content: [{ type: "ExistingSection", props: { id: section.props.id, source: section.props.id, copy: section.props, visualHero: true, hero } }],
    };
    const checked = validateBuilderData(data, () => []);
    assert.equal(checked.ok, true, JSON.stringify(checked));
    assert.equal(checked.data.content[0].props.hero.length, hero.length);
  }
});

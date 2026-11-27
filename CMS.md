# EventQRapp Pages CMS

Administrators open Pages, choose a public page, and save a draft or publish from the full-width editor. The app reads the draft from Express. Drafts affect only the editor. Publish atomically updates the live snapshot. The canvas loads the actual page with its styles and images and applies draft edits as you type. Select a section in Outline for Home and Contact. The preview disables form submissions and operational actions.

## Public navbar and footer

Open **Navbar** or **Footer** in Pages to edit shared public text. The Navbar entry covers desktop and mobile navigation, the client-category menu and sign-in buttons. The Footer entry includes group headings, link labels, copyright wording and each page?s closing call to action. Existing destinations and contact details stay configured in the application.

## Public route inventory

| Route | Existing components and content | CMS scope |
| --- | --- | --- |
| `/` | `HeroSection` and eleven landing sections listed below. `Navbar`, `Footer`, `LandingIntro`, `SmoothScroll` and page metadata compose the surrounding page. | The 12 homepage sections are CMS-managed. Navbar and Footer have separate shared CMS entries. The intro and metadata stay in application code. |
| `/contact` | `ContactPage` renders information and contact links from `constants/site.ts`, section headings, introductory copy, and a validated contact form with a live submission. | Managed through ContactContent. Page heading, information heading, form heading, introduction and submit label are editable. Contact destinations and form behavior remain application-owned. |
| `/features` | Dedicated Features page. | Edit the hero, platform overview, feature stages, screenshots, security and pricing copy. |
| `/how-it-works` | Tutorial and step-by-step guide. | Edit headings, tutorial poster and copy, steps, instructions and screenshots. |
| Client category pages | The seven public routes stay available with their published copy. | Category pages are read-only. Edit shared client menu labels in Navbar. |
| `/pricing` | Redirects to `/#pricing`. The legacy route source composes `TopBanner`, `PricingSection` and `PricingFaqSection`. | Edit the canonical homepage `PricingLanding` section. |
| `/signin`, `/signup`, `/forgot-password`, `/verify-email` | Account and credential flows under the auth route group. | Application-owned. |
| `/invitation/[token]` | Token-based invitation page, invitation artwork, guest and session details, and RSVP. | Application-owned. |
| Unmatched URLs | `not-found.tsx` provides the system 404 and recovery link. | Application-owned. |

The homepage includes an editable Testimonials section before the FAQ. Older homepage records keep their existing copy and receive default testimonials in the editor until published.

## Homepage fields

| Component | Editable fields |
| --- | --- |
| `HeroSection` | Badge, heading, description, pricing note, primary and secondary button labels and destinations, screenshot and alt text |
| `StatsClients` | Client-strip caption and four stat values and labels |
| `PainPoints` | Heading and subheading |
| `StepsCarousel` | Heading, description, CTA, five step titles, descriptions, images and alt text |
| `FeatureRows` | Heading, subheading, six feature tags, titles, descriptions, bullet lists, screenshots and alt text |
| `EventDay` | Heading, introduction, detail copy, screenshot and alt text, CTA |
| `ReportsSection` | Heading, introduction, detail copy, screenshot and alt text, CTA |
| `UseCases` | Heading, description and CTA |
| `PricingLanding` | Heading, description, volume-pricing heading and copy, signup and contact CTAs |
| `SecuritySection` | Heading and description |
| `Testimonials` | Heading, quotes, names, roles and initials |\n| `FaqLanding` | Heading, contact CTA and ten questions and answers |

CTA destinations come from an internal allowlist. Image fields accept local PNG, JPEG or WebP assets under `/images/` and existing `media:<id>` references. The editor uses plain text, multiline text and curated links. The current homepage does not need an HTML or rich-text field. The live renderer uses the same components and styles and retains the existing entrance animation. The editor canvas shows section content immediately so scroll-triggered fades do not obstruct editing. The component outline has a fixed section order and Puck disables section insertion, deletion, duplication and drag.

## Compatibility reconciliation

The original backend allowlist described generic Hero, Heading, Grid and zone blocks. The frontend emits twelve fixed homepage sections with stable IDs equal to their component types. Each remaining public page or shared site section uses its own fixed content block. The generated seed defines those exact shapes. Root props and zones are empty, and images use approved repository paths or CMS media references. Admin URLs use slugs for navigation and MongoDB IDs for API requests. The backend keeps separate schema, publication and edit versions.

## v1 content and API contract

Admin endpoints use the existing bearer token. All successful requests return `{ success: true, data }`. Errors return `{ success: false, code, message }` when available.

| Method and path | Request | Successful data |
| --- | --- | --- |
| GET /api/v1/admin/pages | None | Page metadata array with MongoDB `_id`, slug, route, status, schemaVersion, version, editVersion and timestamps |
| GET /api/v1/admin/pages/:id | MongoDB ID | Page metadata plus draftData and publishedData |
| PATCH /api/v1/admin/pages/:id/draft | `If-Match: "<editVersion>"` and `{ data: puckData }` | Updated page document |
| POST /api/v1/admin/pages/:id/publish | Same header and body as draft | Updated page document, with both snapshots replaced and publication version incremented |
| POST /api/v1/admin/pages/:id/discard-draft | Same header, empty body | Updated page with the draft restored from the published snapshot |
| GET /api/v1/public/pages/:slug | Public slug | Published metadata and complete Puck document under `data.content` |

Every successful mutation returns the next editVersion. A `409 CMS_EDIT_CONFLICT` blocks further writes until the editor reloads. Download JSON preserves the local edits for manual reconciliation. The export contains `{ schemaVersion, data }`. API write bodies contain only `{ data }`, with `data` holding Puck root, ordered content, and optional empty zones. The backend is authoritative for role checks, allowed destinations, fixed section order and IDs, field types and sizes, and media validity.

Image uploads use the existing multipart `POST /api/v1/media/upload` with `file` and `purpose=CMS_PAGE`. Store the returned `media:<id>` key and resolve it through `GET /api/v1/media/:id`. The browser follows the redirect to `https://media.eventqrapp.com` when Hostinger delivery is configured. The editor accepts a generated Hostinger image URL and stores its corresponding media key. Required images also accept approved local raster asset paths under `/images/`. The editor waits for uploads before saving or publishing. Existing published image objects are retained.

Home and Contact fetch the published document on each server request. Missing data, timeouts, and incompatible responses are logged and the corresponding bundled content is rendered.

For local testing, set the backend `MEDIA_DIR` to a writable development directory and leave `MEDIA_PUBLIC_URL` unset. The media API streams image bytes locally. The existing `NEXT_PUBLIC_API_URL` (or `NEXT_PUBLIC_API_BASE_URL`) points the frontend at the local API. The Hostinger HTTPS origin is supported by default. The existing `NEXT_PUBLIC_MEDIA_URL` can be set to the production media origin at build time.

## Seed and deployment

1. Generate or verify the backend artifact `src/validators/cms-pages.v1.json` using `node scripts/export-cms-seed.mjs` from the frontend. The backend derives field shapes and order directly from this artifact. Keep explicit link, image, and size rules in sync across both repositories. Use a new schema version and a migration for incompatible changes.
2. Deploy the backend first. Set backend `MEDIA_DIR` to the absolute persistent directory physically served by Hostinger and `MEDIA_PUBLIC_URL=https://media.eventqrapp.com`. Use disk outside application releases. If the hosts are separate, arrange a durable writable shared mount. The public URL alone does not copy the files. Confirm the frontend origin is allowed and CORS allows `If-Match`.
3. Confirm the database target is approved. From the backend, run `npm run seed:cms -- src/validators/cms-pages.v1.json`. An insert-only upsert preserves existing edits, versions, and timestamps.
4. Verify public API responses for `home` and `contact`, then deploy the frontend using the existing API base variable.
5. Verify the live pages and an approved draft/publish test. Verify a CMS image loads through the media delivery endpoint. Auth routes, tokenized invitation pages, and system error pages are outside the CMS. Pricing remains a homepage redirect.

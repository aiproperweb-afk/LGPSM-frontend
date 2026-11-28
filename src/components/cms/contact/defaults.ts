// Default props for every component, the page that reproduces the original Contact design, reusable templates and style
// presets. Pure data: no React, so it can be unit tested and used by both the editor and the public page.
import { CONTACT_ADDRESS, CONTACT_ENQUIRY_EMAIL, CONTACT_ENQUIRY_PHONE, CONTACT_WEBSITE } from "../../../constants/site.ts";
import { contactCopy, type ContactCopy } from "../contactContent.ts";
import { BUILDER_ID, BUILDER_SCHEMA_VERSION, type BuilderData, type BuilderNode, type StyleSet, type StyleValues } from "./schema.ts";

/** A node before it has an id (templates and component defaults). */
export type Draft = { type: string; props: Record<string, unknown> };

const sides = (prefix: "padding" | "margin", y: string, x: string = y): StyleValues => ({
  [`${prefix}Top`]: y, [`${prefix}Right`]: x, [`${prefix}Bottom`]: y, [`${prefix}Left`]: x,
});
const radius = (value: string): StyleValues => ({ borderTopLeftRadius: value, borderTopRightRadius: value, borderBottomRightRadius: value, borderBottomLeftRadius: value });
const border = (width: string, color: string): StyleValues => ({
  borderStyle: "solid", borderColor: color, borderTopWidth: width, borderRightWidth: width, borderBottomWidth: width, borderLeftWidth: width,
});

const container = (style: StyleSet = {}, content: Draft[] = [], extra: Record<string, unknown> = {}): Record<string, unknown> =>
  ({ htmlTag: "div", animation: "none", animationDelay: 0, decoration: "none", style, ...extra, content });

const headingStyle: StyleSet = {
  desktop: { fontFamily: "dm-sans", fontSize: "36px", lineHeight: "1.15", letterSpacing: "-0.6px", color: "#000B2C" },
  mobile: { fontSize: "30px" },
};
const subheadingStyle: StyleSet = { desktop: { fontSize: "20px", fontWeight: "600", lineHeight: "1.3", color: "#000B2C" } };
const bodyStyle: StyleSet = { desktop: { fontSize: "16px", lineHeight: "1.6", color: "#4A5470" } };
const linkStyle: StyleSet = { desktop: { color: "#1F65FF", fontWeight: "600" } };
const cardStyle: StyleSet = {
  desktop: { ...sides("padding", "24px"), ...border("1px", "#E1EAF8"), ...radius("16px"), backgroundColor: "#FFFFFF", gap: "12px" },
};

const make = (type: string, props: Record<string, unknown> = {}): Draft => ({ type, props: { ...componentDefaults(type), ...props } });

const heading = (text: string, level = "h2", style: StyleSet = headingStyle) => make("Heading", { text, level, style });
const subheading = (text: string) => make("Subheading", { text });
const paragraph = (text: string, style: StyleSet = bodyStyle) => make("Paragraph", { text, style });
const icon = (name: string, size = 24) => make("Icon", { icon: name, size });
const textLink = (text: string, href: string, style: StyleSet = linkStyle) => make("Link", { text, href, style });

const phoneHref = (value: string) => "tel:" + value.replace(/[^+\d]/g, "");

const field = (type: string, binding: string, label: string, placeholder: string, extra: Record<string, unknown> = {}): Draft =>
  make(type, { binding, label, placeholder, ...extra });

function standardFields(submitLabel = contactCopy.submitLabel): Draft[] {
  return [
    field("TextInput", "name", "Name", "Enter your name", { required: true, maxLength: 100 }),
    field("EmailInput", "email", "Email", "Enter your email", { required: true }),
    field("PhoneInput", "phone", "Phone", "Enter your phone number", { required: false }),
    field("TextArea", "message", "Comment", "Describe here", { required: true, rows: 4, maxLength: 2000 }),
    make("SubmitButton", { label: submitLabel }),
  ];
}

const listItems = (...values: string[]) => values.map(text => ({ text, href: "" }));

const defaults: Record<string, () => Record<string, unknown>> = {
  StatCard: () => ({ value: "100+", label: "New statistic", style: {} }),
  ExistingSection: () => ({ source: "", style: {} }),
  Section: () => container({ desktop: { ...sides("padding", "48px", "24px"), gap: "16px" }, mobile: sides("padding", "32px", "16px") }, [], { htmlTag: "section" }),
  Container: () => container({ desktop: { gap: "12px" } }),
  Row: () => container({ desktop: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: "16px" }, mobile: { flexDirection: "column", alignItems: "stretch" } }),
  Column: () => container({ desktop: { gap: "12px" } }),
  Flex: () => container({ desktop: { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "16px" } }),
  Grid: () => container({ desktop: { display: "grid", gridColumns: 3, gap: "16px" }, tablet: { gridColumns: 2 }, mobile: { gridColumns: 1 } }),
  Columns: () => container({ desktop: { display: "grid", gridColumns: 2, gap: "24px" }, mobile: { gridColumns: 1 } }, [make("Column"), make("Column")]),
  Wrapper: () => container(),
  Spacer: () => ({ style: { desktop: { height: "32px" } } }),
  Divider: () => ({ style: { desktop: { borderStyle: "solid", borderTopWidth: "1px", borderColor: "#E1EAF8", marginTop: "8px", marginBottom: "8px" } } }),

  Heading: () => ({ text: "Heading", level: "h2", href: "", target: "_self", srOnly: false, style: headingStyle }),
  Subheading: () => ({ text: "Subheading", level: "h3", href: "", target: "_self", srOnly: false, style: subheadingStyle }),
  Paragraph: () => ({ text: "Add your text here.", href: "", target: "_self", htmlTag: "p", style: bodyStyle }),
  RichText: () => ({ html: "<p>Write <strong>rich</strong> text here.</p>", style: bodyStyle }),
  OrderedList: () => ({ items: listItems("First item", "Second item", "Third item"), style: { desktop: { ...bodyStyle.desktop, listStyleType: "decimal" } } }),
  UnorderedList: () => ({ items: listItems("First item", "Second item", "Third item"), style: { desktop: { ...bodyStyle.desktop, listStyleType: "disc" } } }),
  Link: () => ({ text: "Learn more", href: "/features", target: "_self", style: linkStyle }),
  Highlight: () => ({ text: "Highlighted text", href: "", target: "_self", style: { desktop: { textBackground: "#FFF3B0", fontSize: "16px", color: "#000B2C" } } }),
  Quote: () => ({ text: "Tell visitors what others say about you.", cite: "A happy organiser", style: { desktop: { ...bodyStyle.desktop, borderStyle: "solid", borderColor: "#1F65FF", borderLeftWidth: "4px", paddingLeft: "16px", fontStyle: "italic" } } }),

  Image: () => ({ src: "", alt: "", caption: "", href: "", target: "_self", lockAspect: true, imageStyle: { desktop: radius("12px") }, style: { desktop: { width: "100%" } } }),
  Logo: () => ({ src: "", alt: "Logo", caption: "", href: "/", target: "_self", lockAspect: true, imageStyle: { desktop: { objectFit: "contain" } }, style: { desktop: { width: "160px" } } }),
  Gallery: () => ({ images: [{ src: "", alt: "", caption: "" }, { src: "", alt: "", caption: "" }, { src: "", alt: "", caption: "" }], columns: 3, imageStyle: { desktop: radius("12px") }, style: { desktop: { gap: "12px" } } }),
  Video: () => ({ url: "", title: "Video", poster: "", lockAspect: true, style: { desktop: { width: "100%", aspectRatio: "16/9" } } }),
  Icon: () => ({ icon: "mail", label: "", size: 24, strokeWidth: 1.8, style: { desktop: { color: "#1F65FF" } } }),
  BackgroundImage: () => container(
    { desktop: { ...sides("padding", "48px", "32px"), ...radius("20px"), minHeight: "240px", backgroundColor: "#0B1B4D", justifyContent: "center", gap: "12px" } },
    [heading("Talk to our team", "h2", { desktop: { ...headingStyle.desktop, color: "#FFFFFF" }, mobile: headingStyle.mobile }), paragraph("Add a background image in the Background tab.", { desktop: { ...bodyStyle.desktop, color: "#E1EAF8" } })]),
  MapEmbed: () => ({ provider: "google", query: CONTACT_ADDRESS, zoom: 15, title: "Our office on the map", style: { desktop: { width: "100%", height: "320px", ...radius("16px"), overflow: "hidden" } } }),

  Button: () => ({ label: "Get started", href: "/signup", target: "_self", variant: "primary", icon: "none", style: {} }),
  IconButton: () => ({ icon: "mail", ariaText: "Email us", href: "mailto:" + CONTACT_ENQUIRY_EMAIL, target: "_self", style: {} }),
  LinkButton: () => ({ label: "Learn more", href: "/features", target: "_self", style: {} }),
  Accordion: () => ({ style: { desktop: { gap: "12px" } }, content: [make("FaqItem", { question: "How quickly do you reply?" }), make("FaqItem", { question: "Can we book a demo?" })] }),
  FaqItem: () => ({ question: "Frequently asked question", open: false, questionStyle: { desktop: { fontSize: "16px", fontWeight: "600", color: "#000B2C" } }, style: { desktop: { ...sides("padding", "16px", "20px"), ...border("1px", "#E1EAF8"), ...radius("12px"), gap: "8px" } }, content: [paragraph("Write the answer here.")] }),
  Tabs: () => ({ tabStyle: {}, style: {}, tabs: [{ label: "First tab", content: [paragraph("Content of the first tab.")] }, { label: "Second tab", content: [paragraph("Content of the second tab.")] }] }),
  SocialLinks: () => ({ size: 40, itemStyle: {}, style: { desktop: { gap: "12px" } }, links: [
    { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
    { platform: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" },
    { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/" },
  ] }),

  Card: () => container(cardStyle, [subheading("Card title"), paragraph("Describe this card.")]),
  ContactInfoCard: () => container(cardStyle, [icon("globe"), subheading("Website"), textLink(CONTACT_WEBSITE, "https://" + CONTACT_WEBSITE)]),
  AddressCard: () => container(cardStyle, [icon("location"), subheading("Address"), paragraph(CONTACT_ADDRESS)]),
  EmailCard: () => container(cardStyle, [icon("mail"), subheading("Email"), textLink(CONTACT_ENQUIRY_EMAIL, "mailto:" + CONTACT_ENQUIRY_EMAIL)]),
  PhoneCard: () => container(cardStyle, [icon("phone"), subheading("Phone"), textLink(CONTACT_ENQUIRY_PHONE, phoneHref(CONTACT_ENQUIRY_PHONE))]),
  OfficeCard: () => container(cardStyle, [icon("building"), subheading("Our office"), paragraph(CONTACT_ADDRESS), make("LinkButton", { label: "Get directions", target: "_blank", href: "https://www.google.com/maps?q=" + encodeURIComponent(CONTACT_ADDRESS) })]),
  BusinessHoursCard: () => container(cardStyle, [icon("clock"), subheading("Business hours"), make("BusinessHours")]),
  FeatureCard: () => container(cardStyle, [icon("star", 28), subheading("Feature"), paragraph("Explain the benefit in one or two sentences.")]),
  TeamCard: () => container({ desktop: { ...cardStyle.desktop, alignItems: "center", textAlign: "center" } }, [make("Image", { alt: "Team member", style: { desktop: { width: "96px", aspectRatio: "1/1" } }, imageStyle: { desktop: radius("50%") } }), subheading("Team member"), paragraph("Role")]),
  TestimonialCard: () => container(cardStyle, [icon("chat"), make("Quote")]),
  ContactDetails: () => container({ desktop: { gap: "16px" } }, [subheading("Contact details"), make("AddressCard"), make("EmailCard"), make("PhoneCard")]),
  SocialSection: () => container({ desktop: { gap: "12px", alignItems: "center" } }, [subheading("Follow us"), make("SocialLinks")]),

  ContactForm: () => ({ formLabel: "Contact form", successMessage: "", errorMessage: "", invalidMessage: "", sendingLabel: "Sending…", style: { desktop: { gap: "20px" } }, content: standardFields() }),
  FormHeading: () => ({ text: "Contact Us", level: "h2", href: "", target: "_self", srOnly: false, style: headingStyle }),
  FormGroup: () => ({ style: { desktop: { display: "grid", gridColumns: 2, gap: "16px" }, mobile: { gridColumns: 1 } }, content: [] }),
  TextInput: () => fieldDefaults("Text field", "Type here"),
  EmailInput: () => fieldDefaults("Email address", "name@example.com"),
  PhoneInput: () => fieldDefaults("Phone number", "Enter your phone number"),
  NumberInput: () => fieldDefaults("Number", "0"),
  Dropdown: () => ({ ...fieldDefaults("Choose one", "Select an option"), options: [{ label: "Option 1" }, { label: "Option 2" }] }),
  RadioGroup: () => ({ ...fieldDefaults("Choose one", ""), options: [{ label: "Option 1" }, { label: "Option 2" }] }),
  CheckboxField: () => ({ ...fieldDefaults("Preferences", ""), checkboxText: "Yes, please" }),
  TextArea: () => ({ ...fieldDefaults("Message", "Describe here"), rows: 4 }),
  SubmitButton: () => ({ label: "Submit", style: {} }),
  BusinessHours: () => ({ rows: [{ day: "Monday – Friday", hours: "10:00 – 18:00" }, { day: "Saturday", hours: "10:00 – 14:00" }, { day: "Sunday", hours: "Closed" }], style: { desktop: { ...bodyStyle.desktop, gap: "8px" } } }),
};

function fieldDefaults(label: string, placeholder: string): Record<string, unknown> {
  return { binding: "custom", label, placeholder, helpText: "", required: false, optionalText: "(optional)", style: {}, labelStyle: {}, controlStyle: {}, helpStyle: {} };
}

/** A fresh copy of the default props of a component. Nested components carry no ids; Puck assigns them on insert. */
export function componentDefaults(type: string): Record<string, unknown> {
  const factory = defaults[type];
  if (!factory) throw new Error("Unknown component " + type);
  return structuredClone(factory());
}

// ─── The original Contact page, element by element ──────────────────────────────────────────────────────────────────
export type SiteDetails = { address: string; email: string; phone: string; website: string };
const siteDetails: SiteDetails = { address: CONTACT_ADDRESS, email: CONTACT_ENQUIRY_EMAIL, phone: CONTACT_ENQUIRY_PHONE, website: CONTACT_WEBSITE };

function infoItem(type: string, name: string, iconName: string, label: string, value: string, href: string, first: boolean): Draft {
  const valueStyle: StyleSet = { desktop: { fontSize: "16px", fontWeight: "600", color: "#000B2C", wordBreak: "break-word" } };
  const valueNode = href
    ? textLink(value, href, { ...valueStyle, hover: { color: "#1F65FF" } })
    : paragraph(value, valueStyle);
  return make(type, {
    name, htmlTag: "dl",
    style: { desktop: { paddingTop: "20px", paddingBottom: "20px", ...(first ? {} : { borderStyle: "solid", borderColor: "#DCE5F7", borderTopWidth: "1px" }) } },
    content: [
      make("Row", {
        name: "Label", htmlTag: "dt",
        style: { desktop: { flexDirection: "row", flexWrap: "nowrap", alignItems: "center", gap: "10px" } },
        content: [icon(iconName, 20), make("Paragraph", { text: label, htmlTag: "span", style: { desktop: { fontSize: "15px", color: "#4A5470" } } })],
      }),
      make("Container", { name: "Value", htmlTag: "dd", style: { desktop: { marginTop: "8px", paddingLeft: "30px" } }, content: [valueNode] }),
    ],
  });
}

function pageDraft(copy: ContactCopy, site: SiteDetails): Draft[] {
  const information = make("ContactDetails", {
    name: "Contact information card", htmlTag: "section", animation: "left", decoration: "sunburst", ariaLabelledBy: "contact-info-title",
    style: {
      desktop: { ...sides("padding", "40px"), ...border("1px", "#E1EAF8"), ...radius("20px"), backgroundColor: "#F6F6FF", position: "relative", overflow: "hidden" },
      mobile: sides("padding", "32px"),
    },
    content: [
      make("Heading", { text: copy.informationHeading, level: "h2", anchorId: "contact-info-title", style: headingStyle }),
      make("Container", {
        name: "Contact list", style: { desktop: { marginTop: "32px" } },
        content: [
          infoItem("AddressCard", "Address", "location", "Corporate Office:", site.address, "", true),
          infoItem("EmailCard", "Email", "mail", "Email:", site.email, "mailto:" + site.email, false),
          infoItem("PhoneCard", "Phone number", "phone", "Phone Number:", site.phone, phoneHref(site.phone), false),
          infoItem("ContactInfoCard", "Website", "globe", "Visit Us On:", site.website, "https://" + site.website, false),
        ],
      }),
    ],
  });
  const formColumn = make("Container", {
    name: "Form column", htmlTag: "section", animation: "right", animationDelay: 120, ariaLabelledBy: "contact-us-title",
    style: { desktop: { position: "relative" } },
    content: [
      make("FormHeading", { text: copy.formHeading, anchorId: "contact-us-title" }),
      paragraph(copy.introduction, { desktop: { marginTop: "12px", fontSize: "16px", lineHeight: "1.5", color: "#4A5470" } }),
      make("ContactForm", { ariaLabelledBy: "contact-us-title", style: { desktop: { marginTop: "32px", gap: "20px" } }, content: standardFields(copy.submitLabel) }),
    ],
  });
  return [
    make("Heading", { name: "Page title (screen readers)", text: copy.pageHeading, level: "h1", srOnly: true, style: {} }),
    make("Section", {
      name: "Contact layout", htmlTag: "div",
      style: {
        desktop: {
          width: "100%", maxWidth: "1200px", marginLeft: "auto", marginRight: "auto", paddingLeft: "48px", paddingRight: "48px",
          display: "grid", gridColumns: 2, alignItems: "start", gap: "64px",
        },
        tablet: { gridColumns: 1, gap: "40px", paddingLeft: "24px", paddingRight: "24px" },
        mobile: { paddingLeft: "16px", paddingRight: "16px" },
      },
      content: [information, formColumn],
    }),
  ];
}

const PAGE_STYLE: StyleSet = {
  desktop: { paddingTop: "80px", paddingBottom: "80px" },
  tablet: { paddingTop: "64px", paddingBottom: "64px" },
  mobile: { paddingTop: "48px", paddingBottom: "48px" },
};

/** Gives every node of a draft tree an id. `nextId` decides whether ids are stable (default page) or random (templates). */
export function withIds(drafts: Draft[], nextId: (type: string) => string): BuilderNode[] {
  return drafts.map(draft => {
    const props: Record<string, unknown> = { ...draft.props, id: nextId(draft.type) };
    if (Array.isArray(props.content)) props.content = withIds(props.content as Draft[], nextId);
    if (Array.isArray(props.tabs)) {
      props.tabs = (props.tabs as { label: string; content: Draft[] }[]).map(tab => ({ ...tab, content: withIds(tab.content ?? [], nextId) }));
    }
    return { type: draft.type, props: props as BuilderNode["props"] };
  });
}

const builderData = (content: BuilderNode[], style: StyleSet = PAGE_STYLE): BuilderData => ({
  root: { props: { builder: BUILDER_ID, schemaVersion: BUILDER_SCHEMA_VERSION, style: structuredClone(style) } },
  content,
});

/** The original design as an editable document. Text saved with the earlier section editor is carried over. */
export function buildDefaultPage(copy: ContactCopy = contactCopy, site: SiteDetails = siteDetails): BuilderData {
  const counts: Record<string, number> = {};
  return builderData(withIds(pageDraft(copy, site), type => `${type}-default-${(counts[type] = (counts[type] ?? 0) + 1)}`));
}

export const buildBlankPage = (): BuilderData => builderData([]);

/** Converts the single-section document saved by the earlier editor. Returns null for anything else. */
export function migrateLegacyContact(value: unknown): BuilderData | null {
  const section = (value as { content?: { type?: unknown; props?: Record<string, unknown> }[] } | null)?.content?.[0];
  if (section?.type !== "ContactContent" || !section.props) return null;
  const copy = { ...contactCopy };
  for (const key of Object.keys(contactCopy) as (keyof ContactCopy)[]) {
    if (typeof section.props[key] === "string") copy[key] = section.props[key] as string;
  }
  return buildDefaultPage(copy);
}

// ─── Reusable templates ─────────────────────────────────────────────────────────────────────────────────────────────
export type Template = { id: string; name: string; description: string; build: () => Draft };

const section = (name: string, content: Draft[], style: StyleSet = {}): Draft => {
  const base = componentDefaults("Section").style as StyleSet;
  return make("Section", {
    name, content,
    style: {
      desktop: { ...base.desktop, width: "100%", maxWidth: "1200px", marginLeft: "auto", marginRight: "auto", ...style.desktop },
      tablet: { ...style.tablet },
      mobile: { ...base.mobile, ...style.mobile },
    },
  });
};

const twoColumns = (name: string, content: Draft[]) => section(name, content, {
  desktop: { display: "grid", gridColumns: 2, gap: "48px", alignItems: "start" }, mobile: { gridColumns: 1, gap: "32px" }, tablet: { gridColumns: 1 },
});

const formBlock = () => make("Container", { name: "Form column", content: [make("FormHeading"), paragraph(contactCopy.introduction), make("ContactForm")] });

export const TEMPLATES: Template[] = [
  { id: "standard", name: "Standard contact section", description: "Heading, introduction and contact form", build: () => section("Contact section", [make("FormHeading"), paragraph(contactCopy.introduction), make("ContactForm")], { desktop: { maxWidth: "720px" } }) },
  { id: "two-column-form", name: "Two-column contact form", description: "Details on the left, form on the right", build: () => twoColumns("Two-column contact", [make("ContactDetails"), formBlock()]) },
  { id: "info-cards", name: "Contact information cards", description: "Address, email and phone cards in a grid", build: () => section("Contact cards", [heading("Reach us"), make("Grid", { content: [make("AddressCard"), make("EmailCard"), make("PhoneCard")] })]) },
  { id: "office", name: "Office location", description: "Office card beside a map", build: () => twoColumns("Office location", [make("OfficeCard"), make("MapEmbed")]) },
  { id: "map-details", name: "Map and contact details", description: "Full-width map above contact details", build: () => section("Map and details", [make("MapEmbed"), make("ContactDetails")]) },
  { id: "hours", name: "Business hours", description: "Opening hours card", build: () => section("Business hours", [make("BusinessHoursCard")], { desktop: { maxWidth: "640px" } }) },
  { id: "faq", name: "FAQ section", description: "Heading and expandable questions", build: () => section("FAQs", [heading("Frequently asked questions"), make("Accordion")], { desktop: { maxWidth: "800px" } }) },
  { id: "social", name: "Social media section", description: "Heading and social links", build: () => section("Social", [make("SocialSection")]) },
  { id: "blank", name: "Blank section", description: "An empty section", build: () => section("Section", []) },
  { id: "blank-columns", name: "Blank multi-column layout", description: "Two empty columns in a section", build: () => section("Columns", [make("Columns")]) },
];

// ─── Style presets ──────────────────────────────────────────────────────────────────────────────────────────────────
export type Preset = { name: string; types: "text" | "button" | "card" | "section"; style: StyleSet };

export const PRESETS: Preset[] = [
  { name: "Page heading", types: "text", style: headingStyle },
  { name: "Section subheading", types: "text", style: subheadingStyle },
  { name: "Body text", types: "text", style: bodyStyle },
  { name: "Small caption", types: "text", style: { desktop: { fontSize: "13px", color: "#6B7391", lineHeight: "1.5" } } },
  { name: "Eyebrow label", types: "text", style: { desktop: { fontSize: "13px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#1F65FF" } } },
  { name: "Solid blue", types: "button", style: { desktop: { backgroundColor: "#1F65FF", color: "#FFFFFF", ...radius("12px") }, hover: { brightness: 95 } } },
  { name: "Pill", types: "button", style: { desktop: { ...radius("999px"), paddingLeft: "28px", paddingRight: "28px" } } },
  { name: "Outline", types: "button", style: { desktop: { backgroundColor: "transparent", color: "#1F65FF", ...border("1px", "#1F65FF") }, hover: { backgroundColor: "#1F65FF", color: "#FFFFFF" } } },
  { name: "Soft card", types: "card", style: cardStyle },
  { name: "Raised card", types: "card", style: { desktop: { ...cardStyle.desktop, boxShadow: { x: 0, y: 12, blur: 32, spread: -8, color: "rgba(11,27,77,0.18)" } } } },
  { name: "Tinted card", types: "card", style: { desktop: { ...cardStyle.desktop, backgroundColor: "#F6F8FF" } } },
  { name: "Blue gradient", types: "section", style: { desktop: { backgroundGradient: { type: "linear", angle: 180, from: "#F6F8FF", to: "#FFFFFF" } } } },
  { name: "Dark band", types: "section", style: { desktop: { backgroundColor: "#000B2C", color: "#FFFFFF", ...radius("24px") } } },
  { name: "Centred narrow", types: "section", style: { desktop: { maxWidth: "760px", marginLeft: "auto", marginRight: "auto", textAlign: "center" } } },
];

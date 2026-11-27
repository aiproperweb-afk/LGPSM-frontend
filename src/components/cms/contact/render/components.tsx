// How each builder component looks. Shared by the public page (rendered on the server) and the editor canvas.
import type { PuckContext, SlotComponent } from "@puckeditor/core";
import { createElement, type ReactNode, type Ref } from "react";
import { resolveImageUrl } from "@/utils/mediaUrl";
import { isContainerType, isSafeLink, mapEmbedSrc, sanitizeRichText, videoSource, type StyleSet } from "../schema.ts";
import { ContactFormRoot, FormField, SubmitControl, type RootAttributes } from "./ContactFormClient";
import Icon from "./Icon";
import RevealBox from "./RevealBox";
import TabsView from "./TabsView";

export type RenderProps = { id: string; puck: PuckContext } & Record<string, unknown>;

const kebab = (value: string) => value.replace(/[A-Z]/g, (letter, index) => (index ? "-" : "") + letter.toLowerCase());
const str = (value: unknown) => typeof value === "string" ? value : "";
const list = <T,>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];
/** Text props arrive as strings on the public page and as inline-editing elements in the editor. */
const node = (value: unknown) => value as ReactNode;

function attributes(type: string, p: RenderProps, className = ""): RootAttributes {
  return {
    "data-cb": p.id,
    "data-cb-type": type,
    className: `cb-${kebab(type)}${className ? " " + className : ""}`,
    id: str(p.anchorId) || undefined,
    "aria-label": str(p.ariaLabel) || undefined,
    "aria-labelledby": str(p.ariaLabelledBy) || undefined,
  };
}

const dragRef = (p: RenderProps) => p.puck.dragRef ? { ref: p.puck.dragRef as Ref<never> } : {};

const element = (tag: string, type: string, p: RenderProps, children: ReactNode, className = "", extra: Record<string, unknown> = {}) =>
  createElement(tag, { ...attributes(type, p, className), ...extra, ...dragRef(p) }, children);

/** Links do nothing inside the editor, so selecting an element never leaves the page. */
function linkProps(p: RenderProps, href: unknown, target: unknown) {
  const url = str(href);
  if (!url || !isSafeLink(url) || p.puck.isEditing) return {};
  return { href: url, ...(target === "_blank" ? { target: "_blank", rel: "noopener noreferrer" } : {}) };
}

function textBody(p: RenderProps, value: unknown, alwaysSpan = false) {
  const style = p.style as StyleSet | undefined;
  const highlighted = alwaysSpan || !!(style?.desktop?.textBackground || style?.tablet?.textBackground || style?.mobile?.textBackground);
  const body = highlighted ? <span className="cb-text-background" data-cb-part={`${p.id}:text`}>{node(value)}</span> : node(value);
  return body;
}

function maybeLinked(p: RenderProps, body: ReactNode) {
  return str(p.href) ? <a {...linkProps(p, p.href, p.target)}>{body}</a> : body;
}

function placeholder(p: RenderProps, message: string) {
  return p.puck.isEditing ? <span className="cb-placeholder">{message}</span> : null;
}

function Sunburst() {
  return (
    <svg className="cb-sunburst" viewBox="0 0 540 480" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
      {Array.from({ length: 22 }).map((_, i) => {
        const a0 = ((i * 360) / 22) * (Math.PI / 180);
        const a1 = ((i * 360 + 360 / 44) / 22) * (Math.PI / 180);
        const cx = 400, cy = 260, r = 900;
        return <path key={i} d={`M${cx} ${cy}L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)}L${(cx + r * Math.cos(a1 + (Math.PI * 2) / 44)).toFixed(1)} ${(cy + r * Math.sin(a1 + (Math.PI * 2) / 44)).toFixed(1)}Z`} fill="#fff" fillOpacity={0.7} />;
      })}
    </svg>
  );
}

function containerRender(type: string, p: RenderProps) {
  const tag = str(p.htmlTag) || "div";
  const Slot = p.content as SlotComponent;
  const rootTag = tag === "dl" ? "div" : tag;
  const children = (
    <>
      {p.decoration === "sunburst" && <Sunburst />}
      <Slot as={tag === "dl" ? "dl" : "div"} data-cb-slot="" minEmptyHeight={64} />
    </>
  );
  const animation = str(p.animation);
  if (animation && animation !== "none" && !p.puck.isEditing) {
    return (
      <RevealBox as={rootTag} attributes={attributes(type, p, "cb-container")} variant={animation as "up"} delay={Number(p.animationDelay) || 0}>
        {children}
      </RevealBox>
    );
  }
  return element(rootTag, type, p, children, "cb-container");
}

function fieldRender(type: string, p: RenderProps) {
  return (
    <FormField
      attributes={attributes(type, p, "cb-field")}
      rootRef={(p.puck.dragRef ?? undefined) as Ref<HTMLDivElement> | undefined}
      id={p.id}
      type={type}
      binding={str(p.binding) || "custom"}
      label={str(p.label)}
      required={p.required === true}
      placeholder={str(p.placeholder)}
      helpText={str(p.helpText)}
      optionalText={str(p.optionalText)}
      checkboxText={str(p.checkboxText)}
      options={list<{ label?: string }>(p.options).map(option => str(option.label).trim()).filter(Boolean)}
      rows={typeof p.rows === "number" ? p.rows : undefined}
      min={typeof p.min === "number" ? p.min : undefined}
      max={typeof p.max === "number" ? p.max : undefined}
      maxLength={typeof p.maxLength === "number" ? p.maxLength : undefined}
    />
  );
}

type Renderer = (type: string, p: RenderProps) => ReactNode;

const heading: Renderer = (type, p) => {
  const level = str(p.level) || "h2";
  if (p.srOnly === true) {
    return element(level, type, p, node(p.text), p.puck.isEditing ? "cb-sr-editor" : "cb-sr-only");
  }
  return element(level, type, p, maybeLinked(p, textBody(p, p.text)), "cb-text");
};

const image: Renderer = (type, p) => {
  const source = resolveImageUrl(str(p.src));
  const picture = source
    // Uploaded and external images have unknown sizes and hosts, so the browser loads them directly.
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={source} alt={str(p.alt)} loading="lazy" decoding="async" data-cb-part={`${p.id}:image`} />
    : placeholder(p, "Choose an image in the Content tab");
  return element("figure", type, p, picture && (
    <>
      {str(p.href) ? <a {...linkProps(p, p.href, p.target)}>{picture}</a> : picture}
      {str(p.caption) && <figcaption>{str(p.caption)}</figcaption>}
    </>
  ), "cb-image");
};

const listRender = (tag: "ul" | "ol"): Renderer => (type, p) => element(tag, type, p,
  list<{ text?: unknown; href?: string }>(p.items).map((item, index) => (
    <li key={index}>{item.href ? <a {...linkProps(p, item.href, "_self")}>{node(item.text)}</a> : node(item.text)}</li>
  )), "cb-list");

const RENDERERS: Record<string, Renderer> = {
  Heading: heading,
  Subheading: heading,
  FormHeading: heading,
  Paragraph: (type, p) => element(str(p.htmlTag) || "p", type, p, maybeLinked(p, textBody(p, p.text)), "cb-text"),
  Highlight: (type, p) => element("p", type, p, maybeLinked(p, textBody(p, p.text, true)), "cb-text"),
  Link: (type, p) => element("a", type, p, textBody(p, p.text), "cb-link", linkProps(p, p.href, p.target)),
  RichText: (type, p) => typeof p.html === "string"
    ? element("div", type, p, undefined, "cb-richtext", { dangerouslySetInnerHTML: { __html: sanitizeRichText(p.html) } })
    : element("div", type, p, node(p.html), "cb-richtext"),
  OrderedList: listRender("ol"),
  UnorderedList: listRender("ul"),
  Quote: (type, p) => element("blockquote", type, p, <><p>{node(p.text)}</p>{str(p.cite) && <cite>— {str(p.cite)}</cite>}</>, "cb-quote"),
  Spacer: (type, p) => element("div", type, p, null, "", { "aria-hidden": true }),
  Divider: (type, p) => <hr {...attributes(type, p, "cb-divider")} {...dragRef(p)} />,

  Image: image,
  Logo: image,
  Gallery: (type, p) => element("div", type, p, list<{ src?: string; alt?: string; caption?: string }>(p.images).map((item, index) => {
    const source = resolveImageUrl(item.src ?? "");
    if (!source) return p.puck.isEditing ? <span key={index} className="cb-placeholder">Image {index + 1}</span> : null;
    return (
      <figure key={index}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={source} alt={item.alt ?? ""} loading="lazy" decoding="async" data-cb-part={`${p.id}:image`} />
        {item.caption && <figcaption>{item.caption}</figcaption>}
      </figure>
    );
  }), "cb-gallery", { style: { "--cb-columns": Number(p.columns) || 3 } }),
  Video: (type, p) => {
    const video = videoSource(str(p.url));
    const body = !video ? placeholder(p, "Add a YouTube, Vimeo or MP4 address")
      : video.kind === "iframe"
        ? <iframe src={video.src} title={str(p.title) || "Video"} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" />
        : <video src={video.src} controls preload="metadata" poster={resolveImageUrl(str(p.poster)) ?? undefined} aria-label={str(p.title) || "Video"} />;
    return element("div", type, p, body, "cb-embed");
  },
  MapEmbed: (type, p) => {
    const source = mapEmbedSrc(p.provider, p.query, p.zoom);
    const body = source
      ? <iframe src={source} title={str(p.title) || "Map"} loading="lazy" referrerPolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups" />
      : placeholder(p, "Enter an address (Google) or “latitude, longitude” (OpenStreetMap)");
    return element("div", type, p, body, "cb-embed cb-map");
  },
  Icon: (type, p) => element("span", type, p, <Icon name={str(p.icon)} size={Number(p.size) || 24} strokeWidth={Number(p.strokeWidth) || 1.8} />, "cb-icon",
    str(p.label) ? { role: "img", "aria-label": str(p.label) } : {}),

  Button: (type, p) => element("a", type, p, <>{node(p.label)}{str(p.icon) && p.icon !== "none" && <Icon name={str(p.icon)} size={18} />}</>,
    `cb-button cb-button--${str(p.variant) || "primary"}`, linkProps(p, p.href, p.target)),
  IconButton: (type, p) => element("a", type, p, <Icon name={str(p.icon)} />, "cb-icon-button", { ...linkProps(p, p.href, p.target), "aria-label": str(p.ariaText) || str(p.icon) }),
  LinkButton: (type, p) => element("a", type, p, <>{node(p.label)}<Icon name="arrow-right" size={16} /></>, "cb-link-button", linkProps(p, p.href, p.target)),
  Accordion: (type, p) => {
    const Slot = p.content as SlotComponent;
    return element("div", type, p, <Slot data-cb-slot="" minEmptyHeight={64} />, "cb-container");
  },
  FaqItem: (type, p) => {
    const Slot = p.content as SlotComponent;
    return element("details", type, p, (
      <>
        <summary data-cb-part={`${p.id}:question`}>{str(p.question)}</summary>
        <Slot data-cb-slot="" minEmptyHeight={48} />
      </>
    ), "cb-faq", { open: p.puck.isEditing || p.open === true });
  },
  Tabs: (type, p) => {
    const tabs = list<{ label?: string; content?: SlotComponent }>(p.tabs);
    const panels = tabs.map((tab, index) => {
      const Slot = tab.content;
      return Slot ? <Slot key={index} data-cb-slot="" minEmptyHeight={64} /> : null;
    });
    const body = p.puck.isEditing
      ? tabs.map((tab, index) => <div key={index}><p className="cb-tab" aria-selected="true" data-cb-part={`${p.id}:tab`}>{tab.label || `Tab ${index + 1}`}</p>{panels[index]}</div>)
      : <TabsView id={p.id} labels={tabs.map((tab, index) => tab.label || `Tab ${index + 1}`)} panels={panels} />;
    return element("div", type, p, body, "");
  },
  SocialLinks: (type, p) => {
    const size = Number(p.size) || 40;
    return element("div", type, p, (
      <ul>
        {list<{ platform?: string; label?: string; href?: string }>(p.links).map((item, index) => (
          <li key={index}>
            <a {...linkProps(p, item.href, "_blank")} aria-label={item.label || item.platform} style={{ width: size, height: size }} data-cb-part={`${p.id}:item`}>
              <Icon name={item.platform ?? "globe"} size={Math.round(size * 0.5)} />
            </a>
          </li>
        ))}
      </ul>
    ), "cb-social");
  },
  BusinessHours: (type, p) => element("dl", type, p, list<{ day?: string; hours?: string }>(p.rows).map((row, index) => (
    <div key={index}><dt>{row.day}</dt><dd>{row.hours}</dd></div>
  )), "cb-hours"),

  ContactForm: (type, p) => {
    const Slot = p.content as SlotComponent;
    return (
      <ContactFormRoot
        formId={p.id}
        attributes={{ ...attributes(type, p, "cb-form"), "aria-label": str(p.ariaLabelledBy) ? undefined : str(p.ariaLabel) || str(p.formLabel) || undefined }}
        rootRef={(p.puck.dragRef ?? undefined) as Ref<HTMLFormElement> | undefined}
        successMessage={str(p.successMessage)}
        errorMessage={str(p.errorMessage)}
        invalidMessage={str(p.invalidMessage)}
        sendingLabel={str(p.sendingLabel)}
        editing={p.puck.isEditing}
      >
        <Slot data-cb-slot="" minEmptyHeight={96} />
      </ContactFormRoot>
    );
  },
  SubmitButton: (type, p) => (
    <SubmitControl attributes={attributes(type, p, "cb-submit")} rootRef={(p.puck.dragRef ?? undefined) as Ref<HTMLButtonElement> | undefined}>
      {node(p.label)}
    </SubmitControl>
  ),
};

const FIELDS = new Set(["TextInput", "EmailInput", "PhoneInput", "NumberInput", "Dropdown", "RadioGroup", "CheckboxField", "TextArea"]);

export function renderComponent(type: string, props: RenderProps): ReactNode {
  if (RENDERERS[type]) return RENDERERS[type](type, props);
  if (FIELDS.has(type)) return fieldRender(type, props);
  if (isContainerType(type)) return containerRender(type, props);
  return null;
}

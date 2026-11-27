// Turns the structured style props of a builder document into one scoped stylesheet. Every value is re-checked here, so
// nothing that is not in the style spec can reach the CSS, whether it comes from the database or from the editor.
import {
  BREAKPOINT_MAX_WIDTH, COMPONENTS, FONT_STACKS, isContainerType, isStyleValue, visitNodes,
  type BuilderData, type BuilderNode, type Gradient, type Shadow, type StyleSet, type StyleValues,
} from "./schema.ts";

export type ImageResolver = (reference: string) => string | null;

const LAYOUT_KEYS = new Set(["display", "flexDirection", "flexWrap", "justifyContent", "alignItems", "alignContent", "justifyItems", "gap", "rowGap", "columnGap", "gridColumns", "gridTemplate", "gridRows", "gridRowHeight"]);
const BACKGROUND_KEYS = ["backgroundColor", "backgroundOpacity", "backgroundImage", "backgroundGradient", "overlayColor", "overlayOpacity"];
const TRANSFORM_KEYS = ["rotate", "scale", "translateX", "translateY"];

const kebab = (key: string) => key.replace(/[A-Z]/g, letter => "-" + letter.toLowerCase());
const SIMPLE = new Set([
  "flexDirection", "flexWrap", "justifyContent", "alignItems", "alignContent", "justifyItems", "gap", "rowGap", "columnGap", "display",
  "flexGrow", "flexShrink", "flexBasis", "alignSelf", "justifySelf", "order", "fontSize", "fontWeight", "fontStyle", "color",
  "textAlign", "lineHeight", "letterSpacing", "wordSpacing", "textTransform", "whiteSpace", "wordBreak", "listStyleType",
  "width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight", "aspectRatio",
  "marginTop", "marginRight", "marginBottom", "marginLeft", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "backgroundPosition", "backgroundSize", "backgroundRepeat", "borderStyle", "borderColor",
  "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius",
  "overflow", "position", "top", "right", "bottom", "left", "zIndex", "objectFit", "objectPosition",
]);

const mix = (color: string, percent: number) => percent >= 100 ? color : `color-mix(in srgb, ${color} ${percent}%, transparent)`;
const shadow = (value: Shadow) => `${value.inset ? "inset " : ""}${value.x}px ${value.y}px ${value.blur}px ${value.spread ?? 0}px ${value.color}`;

function gradient(value: Gradient) {
  const stops = [value.from, value.via, value.to].filter(Boolean).join(", ");
  return value.type === "radial" ? `radial-gradient(circle, ${stops})` : `linear-gradient(${value.angle}deg, ${stops})`;
}

function valid(values: StyleValues | undefined): StyleValues {
  return Object.fromEntries(Object.entries(values ?? {}).filter(([key, value]) => isStyleValue(key, value)));
}

/** Declarations for one layer. `merged` holds what the layer inherits, for properties built from several values. */
export function declarations(own: StyleValues, merged: StyleValues, resolveImage: ImageResolver): string[] {
  const out: string[] = [];
  const has = (keys: string[]) => keys.some(key => own[key] !== undefined);
  const horizontal = own.horizontalAlign;
  if (horizontal === "left") out.push("margin-left:0", "margin-right:auto", "align-self:flex-start");
  else if (horizontal === "center") out.push("margin-left:auto", "margin-right:auto", "align-self:center");
  else if (horizontal === "right") out.push("margin-left:auto", "margin-right:0", "align-self:flex-end");
  else if (horizontal === "stretch") out.push("align-self:stretch");

  for (const [key, value] of Object.entries(own)) {
    if (SIMPLE.has(key)) out.push(`${kebab(key)}:${value}`);
  }
  if (own.fontFamily !== undefined) out.push(`font-family:${FONT_STACKS[own.fontFamily as string]}`);
  if (own.textDecoration !== undefined) out.push(`text-decoration-line:${own.textDecoration}`);
  if (own.textShadow !== undefined) {
    const value = own.textShadow as Shadow;
    out.push(`text-shadow:${value.x}px ${value.y}px ${value.blur}px ${value.color}`);
  }
  if (own.textOverflow !== undefined) {
    out.push(`text-overflow:${own.textOverflow}`);
    if (own.textOverflow === "ellipsis") out.push("overflow:hidden", "white-space:nowrap");
  }
  if (own.verticalAlign !== undefined) {
    const value = own.verticalAlign as string;
    out.push(`vertical-align:${value}`);
    if (value !== "baseline") out.push("display:flex", "flex-direction:column", `justify-content:${value === "top" ? "flex-start" : value === "middle" ? "center" : "flex-end"}`);
  }
  if (own.gridColumnSpan !== undefined) out.push(`grid-column:span ${own.gridColumnSpan} / span ${own.gridColumnSpan}`);
  if (own.gridRowSpan !== undefined) out.push(`grid-row:span ${own.gridRowSpan} / span ${own.gridRowSpan}`);

  if (has(["gridTemplate", "gridColumns"])) {
    if (typeof own.gridTemplate === "string") out.push(`grid-template-columns:${own.gridTemplate.split(" ").map(part => `minmax(0,${part}fr)`).join(" ")}`);
    else out.push(`grid-template-columns:repeat(${own.gridColumns},minmax(0,1fr))`);
  }
  if (has(["gridRows"]) || (has(["gridRowHeight"]) && merged.gridRows !== undefined)) out.push(`grid-template-rows:repeat(${merged.gridRows},${merged.gridRowHeight ?? "auto"})`);
  if (own.gridRowHeight !== undefined) out.push(`grid-auto-rows:${own.gridRowHeight}`);

  if (has(BACKGROUND_KEYS)) {
    if (merged.backgroundColor !== undefined) out.push(`background-color:${mix(merged.backgroundColor as string, (merged.backgroundOpacity as number | undefined) ?? 100)}`);
    const layers: string[] = [];
    if (merged.overlayColor !== undefined) {
      const overlay = mix(merged.overlayColor as string, (merged.overlayOpacity as number | undefined) ?? 50);
      layers.push(`linear-gradient(${overlay},${overlay})`);
    }
    if (merged.backgroundGradient !== undefined) layers.push(gradient(merged.backgroundGradient as Gradient));
    const reference = merged.backgroundImage as string | undefined;
    const url = reference ? resolveImage(reference) : null;
    if (url && !/["\\\n]/.test(url)) layers.push(`url("${url}")`);
    if (layers.length) out.push(`background-image:${layers.join(",")}`);
    else if (own.backgroundColor !== undefined) out.push("background-image:none");
    if (url) {
      if (merged.backgroundSize === undefined) out.push("background-size:cover");
      if (merged.backgroundPosition === undefined) out.push("background-position:center");
      if (merged.backgroundRepeat === undefined) out.push("background-repeat:no-repeat");
    }
  }

  if (own.boxShadow !== undefined) out.push(`box-shadow:${shadow(own.boxShadow as Shadow)}`);
  if (own.opacity !== undefined) out.push(`opacity:${(own.opacity as number) / 100}`);
  if (own.brightness !== undefined) out.push(`filter:brightness(${own.brightness}%)`);
  if (has(TRANSFORM_KEYS)) {
    const parts: string[] = [];
    if (merged.translateX !== undefined || merged.translateY !== undefined) parts.push(`translate(${merged.translateX ?? "0"},${merged.translateY ?? "0"})`);
    if (merged.rotate !== undefined) parts.push(`rotate(${merged.rotate}deg)`);
    if (merged.scale !== undefined) parts.push(`scale(${(merged.scale as number) / 100})`);
    out.push(`transform:${parts.join(" ") || "none"}`);
  }
  if (own.transitionDuration !== undefined) out.push(`transition:all ${own.transitionDuration}ms ease`);
  return out;
}

const rule = (selector: string, list: string[]) => list.length ? `${selector}{${list.join(";")}}` : "";

const split = (values: StyleValues, layout: boolean): StyleValues =>
  Object.fromEntries(Object.entries(values).filter(([key]) => LAYOUT_KEYS.has(key) === layout));

type Sheets = { desktop: string[]; tablet: string[]; mobile: string[]; state: string[] };

function addTarget(sheets: Sheets, selector: string, styles: StyleSet, resolveImage: ImageResolver) {
  const desktop = valid(styles.desktop);
  const tablet = valid(styles.tablet);
  const mobile = valid(styles.mobile);
  const layers = [
    ["desktop", desktop, desktop],
    ["tablet", tablet, { ...desktop, ...tablet }],
    ["mobile", mobile, { ...desktop, ...tablet, ...mobile }],
  ] as const;
  for (const [name, own, merged] of layers) {
    sheets[name].push(rule(selector, declarations(own, merged, resolveImage)));
    const states: string[] = [];
    if (own.placeholderColor !== undefined) states.push(rule(`${selector}::placeholder`, [`color:${own.placeholderColor}`]));
    const focus: string[] = [];
    if (own.focusBorderColor !== undefined) focus.push(`border-color:${own.focusBorderColor}`);
    if (own.focusBackgroundColor !== undefined) focus.push(`background-color:${own.focusBackgroundColor}`);
    states.push(rule(`${selector}:focus`, focus));
    sheets[name].push(...states);
  }
  const hover = valid(styles.hover);
  if (Object.keys(hover).length) {
    const list = declarations(hover, { ...desktop, ...hover }, resolveImage);
    if (desktop.transitionDuration === undefined) sheets.desktop.push(rule(selector, ["transition:all 200ms ease"]));
    sheets.state.push(rule(`${selector}:hover`, list));
  }
}

function visibility(selector: string, styles: StyleSet, hiddenEverywhere: boolean, editing: boolean): string[] {
  const desktop = styles.desktop?.hidden === true;
  const tablet = typeof styles.tablet?.hidden === "boolean" ? styles.tablet.hidden : desktop;
  const mobile = typeof styles.mobile?.hidden === "boolean" ? styles.mobile.hidden : tablet;
  // The editor keeps hidden parts visible (faded) so they can still be selected and shown again.
  const body = editing ? "{opacity:.35;outline:1px dashed #94a3b8;outline-offset:-1px}" : "{display:none!important}";
  if (hiddenEverywhere) return [selector + body];
  const out: string[] = [];
  const tabletTop = BREAKPOINT_MAX_WIDTH.tablet, mobileTop = BREAKPOINT_MAX_WIDTH.mobile;
  if (desktop) out.push(`@media (min-width:${tabletTop + 0.02}px){${selector}${body}}`);
  if (tablet) out.push(`@media (min-width:${mobileTop + 0.02}px) and (max-width:${tabletTop}px){${selector}${body}}`);
  if (mobile) out.push(`@media (max-width:${mobileTop}px){${selector}${body}}`);
  return out;
}

const hasSlot = (node: BuilderNode) => isContainerType(node.type);

export function buildCss(data: BuilderData, resolveImage: ImageResolver, editing = false): string {
  const sheets: Sheets = { desktop: [], tablet: [], mobile: [], state: [] };
  const shown: string[] = [];
  const pageStyle = data.root?.props?.style as StyleSet | undefined;
  if (pageStyle) addTarget(sheets, ".cb-root.cb-page", pageStyle, resolveImage);
  visitNodes(data.content ?? [], node => {
    const id = node.props.id;
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) return;
    const spec = COMPONENTS[node.type];
    const root = `.cb-root [data-cb="${id}"]`;
    const styles = (node.props.style ?? {}) as StyleSet;
    if (hasSlot(node)) {
      const pickLayer = (layout: boolean): StyleSet => ({
        desktop: split(styles.desktop ?? {}, layout), tablet: split(styles.tablet ?? {}, layout),
        mobile: split(styles.mobile ?? {}, layout), hover: layout ? undefined : styles.hover,
      });
      addTarget(sheets, root, pickLayer(false), resolveImage);
      addTarget(sheets, `${root} > [data-cb-slot]`, pickLayer(true), resolveImage);
    } else {
      addTarget(sheets, root, styles, resolveImage);
    }
    for (const [name, propRule] of Object.entries(spec.props)) {
      if (propRule.kind !== "style" || !node.props[name]) continue;
      const part = name.replace(/Style$/, "");
      addTarget(sheets, `.cb-root [data-cb-part="${id}:${part}"]`, node.props[name] as StyleSet, resolveImage);
    }
    const textBackground: StyleSet = {};
    for (const layer of ["desktop", "tablet", "mobile"] as const) {
      const value = styles[layer]?.textBackground;
      if (value !== undefined && isStyleValue("textBackground", value)) textBackground[layer] = { backgroundColor: value };
    }
    if (Object.keys(textBackground).length) addTarget(sheets, `.cb-root [data-cb-part="${id}:text"]`, textBackground, resolveImage);
    shown.push(...visibility(root, styles, node.props.hidden === true, editing));
  });
  const join = (list: string[]) => list.filter(Boolean).join("\n");
  const media = (width: number, list: string[]) => {
    const body = join(list);
    return body ? `@media (max-width:${width}px){\n${body}\n}` : "";
  };
  return [
    join(sheets.desktop),
    media(BREAKPOINT_MAX_WIDTH.tablet, sheets.tablet),
    media(BREAKPOINT_MAX_WIDTH.mobile, sheets.mobile),
    join(sheets.state),
    join(shown),
  ].filter(Boolean).join("\n").replace(/</g, "\\3c ");
}

import type { BuilderNode, StyleSet } from "./contact/schema";
import type { CmsPageData } from "./types";

type Section = CmsPageData["content"][number];
const titleStyle: StyleSet = {
  desktop: { fontFamily: "dm-sans", fontSize: "58px", lineHeight: "64px", letterSpacing: "-2.24px", color: "#000B2C", maxWidth: "1000px", textAlign: "center" },
  tablet: { fontSize: "46px", lineHeight: "52px", letterSpacing: "-1.2px" },
  mobile: { fontSize: "34px", lineHeight: "40px" },
};
const bodyStyle: StyleSet = { desktop: { color: "#4A5470", fontSize: "17px", lineHeight: "1.5", maxWidth: "860px", textAlign: "center" }, mobile: { fontSize: "15px" } };
const badgeStyle: StyleSet = { desktop: { fontSize: "15px", color: "#4A5470", backgroundColor: "#FFFFFF", borderColor: "#E1E7F2", borderStyle: "solid", borderTopWidth: "1px", borderRightWidth: "1px", borderBottomWidth: "1px", borderLeftWidth: "1px", paddingLeft: "16px", paddingRight: "16px", paddingTop: "7px", paddingBottom: "7px", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" } };
const linksStyle: StyleSet = { desktop: { flexDirection: "row", gap: "12px", justifyContent: "center" }, mobile: { flexDirection: "column" } };

export function heroBlocks(section: Section, prefix: string): BuilderNode[] | undefined {
  const block = (type: string, key: string, name: string, props: Record<string, unknown>): BuilderNode =>
    ({ type, props: { ...props, name, id: prefix + "-" + key } });
  const text = (key: string, name: string, value: string, style = bodyStyle) => block("Paragraph", key, name, { text: value, style });
  const button = (key: string, name: string, label: string, href: string, variant = "primary") =>
    block("Button", key, name, { label, href, variant, target: "_self", icon: "none" });
  const actions = (links: BuilderNode[]) => block("Flex", "actions", "Hero buttons", { content: links, style: linksStyle });
  const heading = (value: string) => block("Heading", "heading", "Hero heading", { level: "h1", text: value, style: titleStyle });
  if (section.type === "SiteChromeCopy") {
    const footer = section.props.id === "footer";
    return [
      block("Image", "logo", "Site logo", {
        src: footer ? "/images/branding/eventqrapp-logo-light.svg" : "/images/branding/Final-Logo.svg",
        alt: section.props.labels.logoLinkLabel,
        href: "/",
        style: { desktop: { width: footer ? "202px" : "183px" } },
      }),
      ...(footer ? [text("description", "Footer description", section.props.labels.description, {
        desktop: { color: "#A9B4CF", fontSize: "15px", lineHeight: "1.4", maxWidth: "280px", textAlign: "left" },
      })] : []),
    ];
  }
  if (section.type === "HeroSection") {
    const p = section.props;
    return [
      text("badge", "Hero badge", p.badge, badgeStyle),
      heading(p.heading),
      text("description", "Hero description", p.description),
      actions([button("primary", "Primary button", p.primaryLabel, p.primaryHref), button("secondary", "Secondary button", p.secondaryLabel, p.secondaryHref, "outline")]),
      text("note", "Hero note", p.note),
      block("Container", "stage", "Product image stage", {
        style: {
          desktop: { width: "100%", height: "593px", backgroundColor: "#1F65FF", backgroundImage: "/images/landing/hero-wave-2.svg", backgroundSize: "cover", paddingTop: "34px", paddingLeft: "6%", paddingRight: "6%", overflow: "hidden", alignItems: "center", borderTopLeftRadius: "20px", borderTopRightRadius: "20px" },
          tablet: { height: "400px", paddingTop: "24px" },
          mobile: { height: "230px", paddingTop: "14px" },
        },
        content: [block("Image", "image", "Product image", { src: p.image, alt: p.imageAlt, style: { desktop: { width: "100%", maxWidth: "964px", horizontalAlign: "center" } } })],
      }),
    ];
  }
  if (section.type === "FeaturesContent" || section.type === "HowItWorksContent") {
    const p = section.props;
    return [
      text("badge", "Hero badge", p.heroBadge, badgeStyle),
      heading(p.heading),
      text("introduction", "Hero introduction", p.introduction),
      actions([
        button("signup", "Sign-up button", p.signupLabel, "/signup"),
        ...(section.type === "HowItWorksContent" ? [button("tutorial", "Tutorial button", section.props.tutorialLabel, "#tutorial", "outline")] : []),
      ]),
    ];
  }
  if (section.type === "ClientContent") {
    const p = section.props;
    return [
      text("badge", "Hero badge", p.eyebrow, badgeStyle),
      text("tagline", "Hero tagline", p.tagline),
      heading(p.heading),
      text("introduction", "Hero introduction", p.sub),
      actions([button("demo", "Demo button", p.demoLabel, "/contact"), button("tutorial", "Tutorial button", p.tutorialLabel, "/how-it-works", "outline")]),
    ];
  }
}

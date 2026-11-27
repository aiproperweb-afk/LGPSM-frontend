import { CLIENT_CATEGORIES } from "../../constants/clients";

export const navbarLinks = [
  { href: "/features", label: "Features", section: "features", page: "/features" },
  { href: "/how-it-works", label: "How it works", section: "how-it-works", page: "/how-it-works" },
  { href: "/clients/business-corporate", label: "Clients", section: "clients", page: "/clients", menu: true },
  { href: "/contact", label: "Contact", section: "contact", page: "/contact" },
];

export const navbarLabels = {
  ...Object.fromEntries(navbarLinks.map(link => ["link_" + link.section, link.label])),
  ...Object.fromEntries(CLIENT_CATEGORIES.flatMap(category => [
    ["client_" + category.slug + "_name", category.name],
    ["client_" + category.slug + "_description", category.menu],
  ])),
  desktopSignIn: "Log in",
  organizerSignIn: "Organizer log in",
  adminSignIn: "Super Admin log in",
  createEvent: "Start your first event",
  clientMenuPrompt: "Not sure which fits your event?",
  scheduleMeeting: "Schedule a meeting",
  logoLinkLabel: "EventQRapp home",
  navigationLabel: "Main",
  toggleMenuLabel: "Toggle navigation menu",
};

export const footerGroups = [
  { title: "Product", links: [["Features", "/features"], ["How it works", "/how-it-works"], ["Pricing", "/#pricing"], ["Templates", "/#features"], ["Custom card design", "/contact"]] },
  { title: "Use cases", links: [["Weddings", "/clients/wedding-pre-wedding"], ["Birthdays", "/clients/personal-family"], ["Corporate events", "/clients/business-corporate"], ["Conferences", "/clients/business-corporate"], ["Expos and fests", "/clients/festivals-culture"], ["Agencies", "/contact"]] },
  { title: "Resources", links: [["Help centre", "/contact"], ["Sample Excel guest list", "/#features"], ["FAQ", "/#faq"], ["Blog", "/contact"]] },
  { title: "Company", links: [["About", "/contact"], ["Contact", "/contact"], ["Careers", "/contact"]] },
] as const;

export const footerLegal = [["Terms and conditions", "/contact"], ["Privacy policy", "/contact"], ["Refund policy", "/contact"]] as const;

export const footerCtas = {
  home: { title: "Your next event deserves a better guest list", body: "Design your invitation, upload your guests and send in minutes. You only pay when you hit send.", primary: "Create your first event", note: "No credit card needed to set up. Pay per invitee, with no subscription." },
  clients: { title: "Join the organisers who never stress about the guest list", body: "Set up your event today and send your first QR invitations in minutes. You only pay for the guests you invite.", primary: "Create your first event", note: "No credit card needed to start · No subscription" },
  features: { title: "Ready to run your smoothest guest list yet?", body: "Set up your event, design your QR invitation and send it to every guest in minutes. You only pay for the people you invite.", primary: "Create your first event", note: "No credit card needed to start · No subscription" },
  tutorial: { title: "Ready to create your first event?", body: "Set up your event, upload your guests and send QR invitations in minutes. You only pay for the guests you invite.", primary: "Create Your First Event", note: "No credit card needed to start · No subscription" },
  contact: { title: "Prefer to try it yourself first?", body: "Set up your event, upload your guests and send QR invitations in minutes. You only pay for the guests you invite.", primary: "Create your first event", note: "No credit card needed to start · No subscription" },
};

export type FooterCtaVariant = keyof typeof footerCtas;

export const footerGroupKey = (title: string) => title.toLowerCase().replaceAll(" ", "_");

export const footerLabels = {
  description: "EventQRApp helps you create elegant digital invitations with QR codes, RSVP tracking, guest management, and instant sharing. Perfect for weddings, birthdays, corporate events, and special occasions.",
  logoLinkLabel: "EventQRapp home",
  copyright: "EventQRapp. All rights reserved.",
  legalHeading: "Legal",
  homeTerms: "Terms & condition",
  homePrivacy: "Privacy policy",
  bookDemo: "Book a demo",
  ...Object.fromEntries(footerGroups.flatMap(group => [
    [footerGroupKey(group.title) + "_heading", group.title],
    ...group.links.map(([label], index) => [footerGroupKey(group.title) + "_link_" + (index + 1), label]),
  ])),
  ...Object.fromEntries(footerLegal.map(([label], index) => ["legal_link_" + (index + 1), label])),
  ...Object.fromEntries(Object.entries(footerCtas).flatMap(([variant, copy]) =>
    Object.entries(copy).map(([key, value]) => [variant + "_cta_" + key, value])
  )),
};

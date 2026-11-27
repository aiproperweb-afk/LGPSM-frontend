import { CLIENT_CATEGORIES, COMMON_TOOLS, ESSENTIALS, type ClientCategory } from "../../constants/clients";
import { INCLUDED, OVERVIEW, SECURITY, STAGES } from "../../constants/featuresPage";
import { STEPS } from "../../constants/howItWorks";
import { TESTIMONIALS } from "../../constants/testimonials";

export const howItWorksCopy = {
  heroBadge: "HOW EVENTQRAPP WORKS",
  heading: "How to Create an Event, Send QR Invitations, and Manage Guest Entry",
  introduction: "Learn how to use EventQRapp, from setting up your account and creating your first event to inviting guests, scanning QR codes, and tracking attendance. Follow each step with simple instructions and short video tutorials.",
  signupLabel: "Create Your First Event",
  tutorialLabel: "Watch Full Tutorial",
  tutorialImage: "/images/how-it-works/poster.jpg",
  tutorialUnavailable: "Tutorial video coming soon",
  tutorialHeading: "See How EventQRapp Works in Just 2 Minutes",
  tutorialIntroduction: "New to EventQRapp? Watch this quick walkthrough to understand how to set up an event, prepare your guest list, send invitations, and manage entry on event day.",
  guideLabel: "Step-by-step guide",
  guideHeading: "Everything you need to know, one step at a time",
  guideIntroduction: "Follow these short tutorials in order to set up and run your event. Each step explains what to do and includes a picture to help you follow along.",
  footer: {
    title: "Ready to create your first event?",
    body: "Set up your event, upload your guests and send QR invitations in minutes. You only pay for the guests you invite.",
    primary: "Create Your First Event",
    note: "No credit card needed to start · No subscription"
  },
  steps: STEPS.map(({ chip, title, intro, points, image }) => ({ chip, title, intro, points, image: "/images/how-it-works/" + image })),
};

export const featuresCopy = {
  heroBadge: "Features",
  heading: "Every tool you need to run the guest list, from first invite to final exit",
  introduction: "EventQRapp brings QR code invitations, RSVP management, session-wise entry rules and live check-in into one simple dashboard. No spreadsheets passed around, no guesswork at the gate.",
  signupLabel: "Create your first event",
  overviewHeading: "One platform, four stages of your event",
  overviewIntroduction: "Jump to the part of your event you're planning right now.",
  securityHeading: "Built to keep gate-crashers out",
  securityIntroduction: "Every safeguard works quietly in the background, so you can focus on your guests.",
  pricingHeading: "Every feature, one simple price",
  pricingIntroduction: "No plans to compare, no locked features. Every event gets the full platform for a simple per-invitee price + GST, with no subscription, seat fees or setup costs.",
  pricingLabel: "View pricing",
  footer: {
    title: "Ready to run your smoothest guest list yet?",
    body: "Set up your event, design your QR invitation and send it to every guest in minutes. You only pay for the people you invite.",
    primary: "Create your first event",
    note: "No credit card needed to start · No subscription"
  },
  overview: OVERVIEW.map(({ title, text }) => ({ title, text })),
  stages: STAGES.map(({ rows }) => ({ rows: rows.map(({ eyebrow, title, text, items, image, cta }) => ({ eyebrow, title, text, items, image: "/images/features-page/" + image, buttonLabel: cta?.label ?? "" })) })),
  security: SECURITY.map(({ title, text }) => ({ title, text })),
  included: INCLUDED,
};

export const clientSharedCopy = {
  demoLabel: "Book a demo",
  tutorialLabel: "See how it works",
  clientsHeading: "Event planners, agencies and families already on board",
  privacyHeading: "Your guest list stays protected",
  privacyDescription: "Codes can't be shared to sneak extra people in, every scan is logged, and only the staff you assign can check guests in.",
  callbackLabel: "Request a callback",
  scheduleLabel: "Schedule a callback",
  essentialsHeading: "Everything your event desk needs",
  contactLabel: "Contact us",
  footer: {
    title: "Join the organisers who never stress about the guest list",
    body: "Set up your event today and send your first QR invitations in minutes. You only pay for the guests you invite.",
    primary: "Create your first event",
    note: "No credit card needed to start · No subscription"
  },
  tools: COMMON_TOOLS,
  essentials: ESSENTIALS,
};

export function clientCopy(category: ClientCategory) {
  const { eyebrow, tagline, heading, sub, servicesTitle, servicesSub, services, typesTitle, types,
    statementTitle, statementText, whyTitle, whySub, why, closing } = category;
  const business = category.slug === "business-corporate";
  return {
    ...clientSharedCopy,
    eyebrow, tagline, heading, sub, servicesTitle, servicesSub, services,
    servicesImage: business ? "/images/clients/services-photo.png" : "/images/landing/dashboard-hero.jpg",
    typesTitle, types: types.map(({ title, text, image }) => ({ title, text, image: image ?? "" })),
    statementTitle, statementText, whyTitle, whySub, why, closing,
    toolsHeading: "Channels and tools that work for " + (business ? "business" : "your event"),
    essentialsDescription: "The essentials for any " + (business ? "business " : "") + "event, in one dashboard.",
    enquiryHeading: "Let\u0027s plan your next " + (business ? "business " : "") + "event",
    enquiryDescription: "Tell us about your event and our team will get back to you within one working day.",
    enquirySubmitLabel: "Submit request",
    whyImage: "/images/clients/why-dashboard.png",
  };
}

export type ClientCopy = ReturnType<typeof clientCopy>;

export const clientPages = CLIENT_CATEGORIES.map(category => ({
  slug: "clients-" + category.slug,
  name: "Clients - " + category.name,
  route: "/clients/" + category.slug,
  data: clientCopy(category),
}));

export const testimonialsCopy = {
  heading: "Hosts and planners who stopped worrying about the door",
  quotes: TESTIMONIALS.slice(0, 3).map(({ name, quote, role, initials }) => ({
    name, quote, role: role ?? "", initials: initials ?? "",
  })),
};

export type TestimonialsCopy = typeof testimonialsCopy;

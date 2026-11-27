// The Features page (Figma 119:5): four stages of an event, with the design's own wording. The "Mobile access" row follows the design's
// copy, and the price sentence near the end avoids quoting a number, because the per-invitee rate is set by the platform admin.
export interface FeatureRow {
  id?: string;
  eyebrow: string;
  icon: string;
  title: string;
  text: string;
  items: { title: string; text: string }[];
  image: string;
  /** natural size of the exported picture */
  w: number;
  h: number;
  cta?: { label: string; href: string; outline?: boolean };
}
export interface Stage { n: number; label: string; rows: FeatureRow[] }

const I = (title: string, text: string) => ({ title, text });

export const OVERVIEW = [
  { n: 1, title: "Invite", text: "Design your card and send unique QR invitations.", href: "#stage-1", icon: "ov-1.svg", plain: true },
  { n: 2, title: "Manage", text: "Track RSVPs, preferences and guest lists in real time.", href: "#stage-2", icon: "ov-2.svg" },
  { n: 3, title: "Control", text: "Set sessions, entry rules and attendee limits.", href: "#stage-3", icon: "ov-3.svg" },
  { n: 4, title: "Check in and report", text: "Scan guests in, watch attendance live, and download the full report.", href: "#stage-4", icon: "ov-4.svg" },
  { n: 5, title: "Mobile access", text: "Create, manage and track every event right from your mobile phone.", href: "#mobile-access", icon: "ov-5.svg" },
];

export const STAGES: Stage[] = [
  { n: 1, label: "Invite", rows: [
    { eyebrow: "Invitation designer", icon: "e1.svg", title: "Digital invitations that look as good as the event", text: "Start from a ready-made template or upload your own design. Every card gets the guest's unique QR code, so it's beautiful and it works as an entry pass.", image: "f1-designer.png", w: 1140, h: 910, items: [
      I("Templates for every occasion", "Browse designs sorted by category: Personal, Corporate, Social, Sports and Entertainment. Pick one and make it yours in minutes."),
      I("Upload your own card", "Already have a design? Upload it as a JPG, PNG or WEBP file (9:16 ratio, up to 5 MB) and we'll place the QR code on it."),
      I("Live phone preview", "See exactly how the invitation will look on a guest's phone before anything is sent."),
      I("Your logo, your brand", "Add a company or family logo so every invite feels personal and on-brand."),
      I("Custom design on request", "Want something one-of-a-kind? Ask our team to design a card for you."),
    ] },
    { eyebrow: "Sending and delivery", icon: "e2.svg", title: "Send QR invitations by email and WhatsApp in one click", text: "Reach every guest where they actually read their messages. Send to your whole list or to one session at a time, then see exactly what happened to each invite.", image: "f2-sending.png", w: 1140, h: 880, items: [
      I("Bulk send on two channels", "Deliver invitations by email and WhatsApp together, to hundreds of guests at once."),
      I("Send by session", "Invite only the guests for a specific function, like the VIP dinner or the after-party."),
      I("Per-guest delivery status", "Every invite shows as Sent, Received or Failed, so nothing goes out blind."),
      I("One-click resend", "Fix a number or email and resend failed invites instantly."),
      I("Pre-send check", "A clear warning before you send helps you catch mistakes, because event details lock once invites go out."),
    ] },
    { eyebrow: "Download & Print Invitations", icon: "e3.svg", title: "Download and print personalized QR invitation cards with ease", text: "Give your guests a traditional invitation experience with the convenience of QR technology. Download personalized, print-ready invitation cards for your guests and print them whenever needed. Printing is completely optional.", image: "f3-print.png", w: 1140, h: 880, items: [
      I("Print-ready PDF invitations", "Download high-quality PDF invitation cards with each guest's unique QR code, ready for printing."),
      I("Personalized cards for every guest", "Each invitation includes the guest's details and a unique QR code for secure event entry."),
      I("Bulk invitation downloads", "Download multiple invitation cards in organized ZIP folders, with up to 100 PDFs per batch."),
      I("Print only when needed", "Choose which invitation cards to print based on your event requirements and guest preferences."),
    ] },
  ] },
  { n: 2, label: "Manage", rows: [
    { eyebrow: "RSVP and preferences", icon: "e4.svg", title: "Know who's coming, and what they'd like, before the day", text: "Online RSVP management that gives you a reliable headcount for catering, seating and planning.", image: "f4-rsvp.png", w: 1140, h: 880, items: [
      I("RSVP deadlines", "Set a reply-by date so you get final numbers on time."),
      I("Custom preference questions", "Ask about meal choice, dietary needs, plus-ones or anything else you need to plan."),
      I("Live response status", "See every guest as Accepted, Pending or Declined at a glance."),
      I("Automatic reminders", "Nudge guests who haven't replied without chasing them one by one."),
    ] },
    { eyebrow: "Guest lists", icon: "e5.svg", title: "Upload your guest list from Excel in minutes", text: "Keep using the spreadsheet you already have. EventQRapp checks it, flags problems and turns it into a clean, organised guest list.", image: "f5-guests.png", w: 1140, h: 852, items: [
      I("Sample Excel template", "Download our ready format so your upload works the first time."),
      I("Session access in one column", "Mark Y or N for each session to decide who gets into what."),
      I("Preview and edit before saving", "Review every row and fix errors before the list goes live."),
      I("Clear upload summary", "See how many rows were accepted or rejected, and why."),
      I("Add guests later", "Last-minute additions? Add them any time before you send."),
    ] },
  ] },
  { n: 3, label: "Control", rows: [
    { eyebrow: "Sessions and access rules", icon: "e6.svg", title: "Session-wise entry for events with more than one moment", text: "Weddings, conferences and multi-day festivals rarely happen in one go. Create separate sessions, each with its own time, guest list and entry rules, all within one event.", image: "f6-sessions.png", w: 1140, h: 944, items: [
      I("Multiple timed sessions", "Set up the ceremony, lunch, keynote or gala dinner as separate sessions."),
      I("Family passes", "One QR code admits as many people as the guest list says, counted at the door."),
      I("Reusable guest lists", "Apply the same list to several sessions without uploading it again."),
      I("Entry-session requirement", "Make guests check in at the main entry before they can access other sessions."),
      I("Overall attendee limit", "Cap total attendance to match venue capacity."),
      I("RSVP-based entry", "Decide whether guests who declined or didn't reply can still be admitted."),
    ] },
    { eyebrow: "Team and staff", icon: "e7.svg", title: "Give your team members exactly the access they need", text: "Add the people who'll be scanning on the day and put each one where you need them.", image: "f7-team.png", w: 1140, h: 888, items: [
      I("Add staff accounts", "Invite team members as staff users, with no limit on seats and no extra fee."),
      I("Assign by event and session", "Put the right people at the right gate for the right session."),
      I("See every assignment", "View who's working where in one list."),
      I("Reassign in seconds", "Move staff between sessions or gates as plans change."),
    ] },
  ] },
  { n: 4, label: "Check in and report", rows: [
    { eyebrow: "QR code check-in", icon: "e8.svg", title: "Guest check-in in about 5 seconds", text: "Guests show the QR code on their phone. Your staff scan it with the EventQRapp mobile app. Entry rules are checked instantly, so the line keeps moving and only invited guests get in.", image: "f8-checkin.png", w: 1140, h: 910, items: [
      I("No app for guests", "Guests simply show the invite they received on email or WhatsApp."),
      I("Staff mobile app", "Your team scans with their phones, with no extra hardware to buy."),
      I("Multi-gate support", "Run Main, VIP and other gates at the same time."),
      I("Rules applied at every scan", "Session access, entry limits and RSVP rules are enforced automatically."),
    ] },
    { eyebrow: "Live event dashboard", icon: "e9.svg", title: "Watch attendance as it happens", text: "A real-time view of every session, gate and team member, so you can make decisions on the day, not after it.", image: "f9-dashboard.png", w: 1120, h: 1186, items: [
      I("Session health rings", "Track logged-in guests, check-ins and occupancy for each session."),
      I("Entry and exit logs", "See who came in, who left and through which gate."),
      I("Team activity trail", "Know which staff member did what, and when."),
    ], cta: { label: "See the live dashboard", href: "/signup" } },
    { id: "mobile-access", eyebrow: "Mobile access", icon: "e10.svg", title: "Your whole event, right from your phone", text: "No desktop or laptop needed. Open EventQRapp on your phone and do everything you'd do on a computer, wherever you are.", image: "f10-mobile.png", w: 1120, h: 1308, items: [
      I("Create events on the go", "Add event details, pick a card and set rules in minutes."),
      I("Upload and edit guest lists", "Add guests, fix details and manage sessions from your phone."),
      I("Send and track invitations", "Send by email and WhatsApp, and resend failed invites instantly."),
      I("Watch attendance live and reports and billing", "Follow check-ins and session occupancy as guests arrive. View reports, download logs and find invoices anytime."),
    ], cta: { label: "Try it on your phone", href: "/signup", outline: true } },
  ] },
];

export const SECURITY = [
  { icon: "sec-1.svg", title: "One unique QR per guest", text: "Forwarded or copied invitations can't let extra people in." },
  { icon: "sec-2.svg", title: "Rules enforced at the gate", text: "Access rules, attendee caps and RSVP settings are checked on every scan." },
  { icon: "sec-3.svg", title: "Locked after sending", text: "Event details lock once invites go out, preventing accidental changes." },
  { icon: "sec-4.svg", title: "Secure payments", text: "Pay safely and receive your invoice by email instantly." },
  { icon: "sec-5.svg", title: "Full audit trail", text: "Every action by every team member is recorded with a time stamp." },
];

export const INCLUDED = ["Unique QR invitations", "Email and WhatsApp delivery", "Templates and custom card uploads", "RSVP and preference questions", "Sessions and entry rules", "Unlimited staff accounts", "Live check-in and dashboard", "Full event reports", "GST invoices"];

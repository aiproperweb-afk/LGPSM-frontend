// The seven client categories (Clients menu, Figma 238:29276, and the Clients pages, Figma 228:1029 for Business & Corporate).
// Business & Corporate is worded exactly as designed. The other six pages follow the same template; their wording is written from the menu
// descriptions and how the product works, and is marked `authored: true` so it can be reviewed before launch.

export interface ClientType { title: string; text: string; image?: string }
export interface ClientCategory {
  slug: string;
  name: string;
  /** the menu's one-line description */
  menu: string;
  icon: string;
  authored: boolean;
  eyebrow: string;
  tagline: string;
  heading: string;
  sub: string;
  servicesTitle: string;
  servicesSub: string;
  services: { label: string; text: string }[];
  typesTitle: string;
  types: ClientType[];
  /** the card shown beside the guest-list protection statement */
  statementTitle: string;
  statementText: string;
  whyTitle: string;
  whySub: string;
  why: string[];
  closing: string;
}

const COMMON_TOOLS = [
  "Email and WhatsApp invitations",
  "Excel guest list upload",
  "Print-ready PDF invitation cards",
  "Staff scanning on mobile phones",
  "Map-verified venue locations",
  "Multi-gate entry (Main and VIP)",
  "Downloadable attendance and access logs",
  "GST invoices and statements",
  "Google sign-in for your team",
];
export { COMMON_TOOLS };

export const ESSENTIALS = ["Branded QR invitations", "Session-wise access", "Mobile gate scanning", "Live attendance dashboard"];

const WHY_COMMON = ["No subscription, pay per invitee", "Setup in a single sitting", "Guests need no app", "Unlimited staff accounts at no extra cost", "Reports ready the moment it ends"];

export const CLIENT_CATEGORIES: ClientCategory[] = [
  {
    slug: "business-corporate",
    name: "Business & Corporate",
    menu: "Business Conference, Product Launch, Networking Event & Corporate Meet.",
    icon: "/images/clients/menu-business.svg",
    authored: false,
    eyebrow: "CONFERENCES · LAUNCHES · NETWORKING · CORPORATE MEETS",
    tagline: "Built for business events of every size",
    heading: "Corporate events, sorted at the door",
    sub: "Send branded QR invitations, separate delegates from VIPs, check guests in within seconds, and share an attendance report before the venue clears.",
    servicesTitle: "One platform for every guest touchpoint",
    servicesSub: "From the first invite to the final report, your corporate guest list lives in one place, not in five spreadsheets.",
    services: [
      { label: "Branded invitations:", text: "Your logo and event design on every card, sent by email and WhatsApp." },
      { label: "Delegate and VIP access:", text: "Separate guest lists and entry rules for delegates, speakers and VIPs." },
      { label: "Session-wise entry:", text: "Keynotes, breakouts, lunch and the evening dinner, each with its own list." },
      { label: "RSVP and preferences:", text: "Confirmed headcount and meal choices before you brief the caterer." },
      { label: "Fast gate check-in:", text: "Staff scan QR codes on their phones, so registration desks stay clear." },
      { label: "Attendance reports:", text: "Invited versus attended, by session, ready for stakeholders and sponsors." },
    ],
    typesTitle: "Built for every business event",
    types: [
      { title: "Business conference", text: "Multi-session conferences with hundreds of delegates, speakers and partners.", image: "/images/clients/type-1.png" },
      { title: "Product launch", text: "High-profile launches where the guest list, the timing and the first impression all matter.", image: "/images/clients/type-2.png" },
      { title: "Networking event", text: "Mixers, industry meets and member evenings where guests arrive throughout the night.", image: "/images/clients/type-3.png" },
      { title: "Corporate meet", text: "AGMs, town halls, offsites and annual days for employees and shareholders.", image: "/images/clients/type-4.png" },
    ],
    statementTitle: "One code, every session",
    statementText: "Each delegate gets one unique QR code that works across your whole event. It opens the doors they're invited to, and only those, from the morning keynote to the closing dinner.",
    whyTitle: "Why corporate teams choose EventQRapp",
    whySub: "Less admin before the event, fewer surprises on the day.",
    why: WHY_COMMON,
    closing: "Planning your next conference or launch? Let's make entry effortless.",
  },
  {
    slug: "wedding-pre-wedding",
    name: "Wedding & Pre-Wedding",
    menu: "Engagement, Haldi, Mehendi, Sangeet & Wedding Reception.",
    icon: "/images/clients/menu-wedding.svg",
    authored: true,
    eyebrow: "ENGAGEMENT · HALDI · MEHENDI · SANGEET · RECEPTION",
    tagline: "Built for every function of the wedding",
    heading: "Wedding celebrations, welcomed with ease",
    sub: "Send beautiful QR invitations for every function, keep each ceremony's guest list separate, and let your family enjoy the day while the gate takes care of itself.",
    servicesTitle: "One invitation for the whole celebration",
    servicesSub: "From the engagement to the reception, every function and every guest list lives in one place.",
    services: [
      { label: "Beautiful invitations:", text: "Pick a ready template or upload your own design, sent by email and WhatsApp." },
      { label: "Function-wise entry:", text: "Haldi, Mehendi, Sangeet, wedding and reception, each with its own guest list." },
      { label: "Family and VIP lists:", text: "Keep close family, friends and special guests on the right lists and gates." },
      { label: "RSVP and preferences:", text: "Know who is coming and what they would like to eat before you brief the caterer." },
      { label: "Smooth gate entry:", text: "Helpers scan QR codes on their phones, so nobody queues at the venue door." },
      { label: "Print cards too:", text: "Download print-ready cards for the guests you would rather invite by hand." },
    ],
    typesTitle: "Built for every wedding function",
    types: [
      { title: "Engagement", text: "A close, carefully invited circle of family and friends." },
      { title: "Haldi and Mehendi", text: "Lively, informal functions where guests arrive and leave through the day." },
      { title: "Sangeet", text: "Big evening celebrations with music, dinner and a long guest list." },
      { title: "Wedding reception", text: "The largest gathering, where the right guests need to reach the right gate." },
    ],
    statementTitle: "One code, every function",
    statementText: "Each guest gets one unique QR code for the whole celebration. It opens the functions they are invited to, and only those, from the Haldi to the reception.",
    whyTitle: "Why families choose EventQRapp",
    whySub: "Less running around before the wedding, more time to enjoy it.",
    why: WHY_COMMON,
    closing: "Planning a wedding? Let's make every entry effortless.",
  },
  {
    slug: "education-campus",
    name: "Education & Campus",
    menu: "Convocation, Freshers, Welcome, Farewell & College Fest.",
    icon: "/images/clients/menu-education.svg",
    authored: true,
    eyebrow: "CONVOCATION · FRESHERS · FAREWELL · COLLEGE FEST",
    tagline: "Built for schools, colleges and universities",
    heading: "Campus events, organised from the first invite",
    sub: "Invite students, parents and guests with QR codes, keep every gathering to its guest list, and check people in at the gate without a paper register.",
    servicesTitle: "One platform for every campus gathering",
    servicesSub: "From the freshers' welcome to the farewell, your guest lists stay in one place.",
    services: [
      { label: "Invitations that reach everyone:", text: "Send by email and WhatsApp, or download print-ready cards for notice boards and parents." },
      { label: "Student and guest lists:", text: "Upload an Excel list of students, parents and chief guests in one go." },
      { label: "Event-wise entry:", text: "Separate sessions for ceremonies, performances and dinners, each with its own list." },
      { label: "Fast gate check-in:", text: "Volunteers scan QR codes on their phones, so the entrance never backs up." },
      { label: "Entry-once codes:", text: "Set a code to work a single time so a pass cannot be handed on." },
      { label: "Attendance reports:", text: "Invited versus attended, ready for the department and the management." },
    ],
    typesTitle: "Built for every campus event",
    types: [
      { title: "Convocation", text: "Graduates and their families, each admitted to the right seating." },
      { title: "Freshers and welcome", text: "A new batch arriving together, checked in quickly." },
      { title: "Farewell", text: "A final-year send-off for students, faculty and guests." },
      { title: "College fest", text: "Multi-day fests with several shows and a changing crowd." },
    ],
    statementTitle: "One code, every event",
    statementText: "Each student and guest gets one unique QR code. It opens the events they are invited to, and only those, across the whole day.",
    whyTitle: "Why campuses choose EventQRapp",
    whySub: "Less paperwork for organisers, a smoother entrance for everyone.",
    why: WHY_COMMON,
    closing: "Planning your next campus event? Let's make entry effortless.",
  },
  {
    slug: "personal-family",
    name: "Personal & Family",
    menu: "Birthday, Baby Shower, Annaprasan, Griha Pravesh & Anniversary.",
    icon: "/images/clients/menu-personal.svg",
    authored: true,
    eyebrow: "BIRTHDAY · BABY SHOWER · ANNAPRASAN · GRIHA PRAVESH",
    tagline: "Built for the moments that matter at home",
    heading: "Family celebrations, invited with care",
    sub: "Design a lovely invitation, send it to everyone on WhatsApp and email in minutes, and know exactly who is coming before the day.",
    servicesTitle: "Everything a family celebration needs",
    servicesSub: "No group chats to chase, no lists on paper, just one guest list that stays up to date.",
    services: [
      { label: "Your own invitation:", text: "Pick a ready template or upload your own design, with a live preview before sending." },
      { label: "Send in minutes:", text: "Upload your guest list or add guests one by one, then send by email and WhatsApp." },
      { label: "RSVP answers:", text: "Guests reply accept or decline, so you can plan the food and the seating." },
      { label: "Venue on the map:", text: "Guests get a verified location so everyone finds the door." },
      { label: "Easy entry:", text: "A helper scans the QR code at the door, with no register to fill." },
      { label: "Print cards too:", text: "Download print-ready cards for elders who prefer a card in hand." },
    ],
    typesTitle: "Built for every family occasion",
    types: [
      { title: "Birthday and baby shower", text: "Parties where you want to know the headcount early." },
      { title: "Annaprasan", text: "A first-rice ceremony shared with close family and friends." },
      { title: "Griha Pravesh", text: "A housewarming where relatives and neighbours come and go." },
      { title: "Anniversary", text: "A milestone celebration with a guest list worth getting right." },
    ],
    statementTitle: "One code for every guest",
    statementText: "Each guest receives one unique QR code on their phone. They show it at the door and walk straight in.",
    whyTitle: "Why families choose EventQRapp",
    whySub: "Simple enough for a birthday, strong enough for a big family function.",
    why: WHY_COMMON,
    closing: "Planning a family celebration? Let's make it effortless.",
  },
  {
    slug: "festivals-culture",
    name: "Festivals & Culture",
    menu: "Festival Celebration, Puja Gathering, Cultural Program & Community Fair.",
    icon: "/images/clients/menu-festivals.svg",
    authored: true,
    eyebrow: "FESTIVALS · PUJA · CULTURAL PROGRAMS · COMMUNITY FAIRS",
    tagline: "Built for communities and committees",
    heading: "Festivals and community events, welcomed in order",
    sub: "Invite members, patrons and guests with QR codes, manage entry across programs and days, and share an attendance report with your committee.",
    servicesTitle: "One place for every community gathering",
    servicesSub: "Committees, volunteers and guest lists, working from the same dashboard.",
    services: [
      { label: "Invitations for the community:", text: "Send by email and WhatsApp, or download print-ready cards for notice boards." },
      { label: "Program-wise entry:", text: "Set sessions for each day or performance, with their own guest lists." },
      { label: "Patrons and special guests:", text: "Keep chief guests, donors and members on the right lists." },
      { label: "Volunteer scanning:", text: "Committee volunteers scan QR codes on their own phones at the gate." },
      { label: "Multi-gate entry:", text: "Main and special gates, each admitting the right people." },
      { label: "Attendance reports:", text: "Invited versus attended for each program, ready for the committee." },
    ],
    typesTitle: "Built for every festival and gathering",
    types: [
      { title: "Festival celebration", text: "Large celebrations where guests arrive across the day." },
      { title: "Puja gathering", text: "Community pujas with members, patrons and invited guests." },
      { title: "Cultural program", text: "Dance, music and drama evenings with a seated audience." },
      { title: "Community fair", text: "Open fairs and stalls where entry still needs order." },
    ],
    statementTitle: "One code, every program",
    statementText: "Each guest gets one unique QR code that works across the days and programs they are invited to, and only those.",
    whyTitle: "Why committees choose EventQRapp",
    whySub: "Less crowding at the gate, a clear record for the committee.",
    why: WHY_COMMON,
    closing: "Planning your next festival or cultural program? Let's make entry effortless.",
  },
  {
    slug: "sports-fitness",
    name: "Sports & Fitness",
    menu: "Cricket Tournament, Football Tournament, Marathon, Farewell & College Fest.",
    icon: "/images/clients/menu-sports.svg",
    authored: true,
    eyebrow: "TOURNAMENTS · MARATHONS · CLUB EVENTS · SPORTS MEETS",
    tagline: "Built for tournaments and fitness events",
    heading: "Sports events, checked in before the first whistle",
    sub: "Register players, officials and spectators with QR passes, keep each match day to its list, and see attendance live from the gate.",
    servicesTitle: "One platform from registration to the final",
    servicesSub: "Players, teams, officials and spectators, each with the right pass.",
    services: [
      { label: "Branded passes:", text: "Your club or tournament design on every pass, sent by email and WhatsApp." },
      { label: "Players, officials and guests:", text: "Separate lists and entry rules for each group." },
      { label: "Match-day sessions:", text: "Each match or race day with its own guest list and entry rule." },
      { label: "Quick gate check-in:", text: "Volunteers scan QR codes on their phones, so queues move." },
      { label: "Live attendance:", text: "See how many have entered while the event is on." },
      { label: "Reports for sponsors:", text: "Invited versus attended, ready to share after the event." },
    ],
    typesTitle: "Built for every sports event",
    types: [
      { title: "Cricket tournament", text: "Teams, officials and spectators across several match days." },
      { title: "Football tournament", text: "Fixtures, finals and fan entry managed from one list." },
      { title: "Marathon", text: "Runners and volunteers checked in at the start line." },
      { title: "Club and college sports meet", text: "Annual meets with students, families and guests." },
    ],
    statementTitle: "One pass, every match day",
    statementText: "Each player and guest gets one unique QR code that works for the match days and areas they are cleared for, and only those.",
    whyTitle: "Why organisers choose EventQRapp",
    whySub: "Less queueing, more time on the field.",
    why: WHY_COMMON,
    closing: "Planning your next tournament or run? Let's make entry effortless.",
  },
  {
    slug: "entertainment-social",
    name: "Entertainment & Social",
    menu: "Live Concert, Comedy Show, DJ Night, Food Festival & Exhibition.",
    icon: "/images/clients/menu-entertainment.svg",
    authored: true,
    eyebrow: "CONCERTS · COMEDY · DJ NIGHTS · FOOD FESTIVALS · EXHIBITIONS",
    tagline: "Built for shows, nights out and exhibitions",
    heading: "Shows and social nights, let in without the queue",
    sub: "Send QR invitations to your guest list, keep VIP and general entry apart, and let crowds in quickly while staying in control of who enters.",
    servicesTitle: "One platform from guest list to last entry",
    servicesSub: "Invitations, gates and attendance in one dashboard, so the door never slows the night down.",
    services: [
      { label: "Branded invitations:", text: "Your show or venue design on every pass, sent by email and WhatsApp." },
      { label: "VIP and general entry:", text: "Separate guest lists and gates for VIP, guests and the press." },
      { label: "Show-wise sessions:", text: "Set a list and an entry rule for each show, stall area or night." },
      { label: "Codes that cannot be shared:", text: "A pass admits only as many people as the guest list says, in each session." },
      { label: "Fast gate check-in:", text: "Door staff scan QR codes on their phones, so the line keeps moving." },
      { label: "Attendance reports:", text: "Invited versus attended, ready for sponsors and partners." },
    ],
    typesTitle: "Built for every show and social event",
    types: [
      { title: "Live concert", text: "Large crowds, several gates and a guest list that must be right." },
      { title: "Comedy show", text: "Seated audiences admitted show by show." },
      { title: "DJ night", text: "Late-night entry with guest lists and VIP areas." },
      { title: "Food festival and exhibition", text: "Open events where invited guests and trade visitors need separate entry." },
    ],
    statementTitle: "One code, one entry",
    statementText: "Each guest gets one unique QR code. Set it to work once, and it cannot be passed on to sneak extra people in.",
    whyTitle: "Why organisers choose EventQRapp",
    whySub: "A faster door and a clear count for every show.",
    why: WHY_COMMON,
    closing: "Planning your next show or social night? Let's make entry effortless.",
  },
];

export function getClientCategory(slug: string) {
  return CLIENT_CATEGORIES.find((c) => c.slug === slug);
}

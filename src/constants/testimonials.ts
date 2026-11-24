// "Hosts and planners who stopped worrying about the door" (Figma 238:28697). These three are the design's own sample quotes. The design gives
// them placeholder names ("[Name]", "[Wedding host], [City]"), so only the role is shown, and no person is named.
// BEFORE LAUNCH: replace them with quotes that real customers have agreed to share, with their real name and role. The section lays out
// whatever is in this list (up to three cards).
export interface Testimonial {
  quote: string;
  /** a person's name, or just a role while real names are not available */
  name: string;
  /** shown under the name; may be empty */
  role?: string;
  /** letters in the round badge; derived from the name when left out */
  initials?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { quote: "We invited 480 guests to our reception and knew who had arrived without a single printed list.", name: "Wedding host", initials: "AB" },
  { quote: "I run a dozen events a month. Assigning my crew and sending clients a report takes minutes.", name: "Event agency founder", initials: "EF" },
  { quote: "Separate sessions for keynote, lunch and the evening dinner used to need three teams. Now it's one dashboard.", name: "Corporate event manager", initials: "CD" },
];

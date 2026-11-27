import { limitPhone } from "./phoneInput.ts";

export interface OrganizerForm {
  type: "INDIVIDUAL" | "ORGANIZATION";
  organizationName: string;
  fullName: string;
  email: string;
  phone: string;
}

interface OrganizerLike {
  fullName?: string;
  email?: string;
  phone?: string;
  profile?: { organizationName?: string; organizationType?: unknown };
}

export function organizerForm(o: OrganizerLike): OrganizerForm {
  const organizationName = o.profile?.organizationName || "";
  const type = o.profile?.organizationType === "ORGANIZATION" || (!o.profile?.organizationType && organizationName) ? "ORGANIZATION" : "INDIVIDUAL";
  return { type, organizationName, fullName: o.fullName || "", email: o.email || "", phone: limitPhone(o.phone || "") };
}

export function organizerFormProblem(f: OrganizerForm): string | null {
  if (f.type === "ORGANIZATION" && f.organizationName.trim().length < 2) return "Enter the organization name.";
  if (f.fullName.trim().length < 2) return "Enter the account name (at least 2 characters).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return "Enter a valid email address.";
  if (f.phone && f.phone.length !== 10) return "A mobile number has 10 digits.";
  return null;
}

/** Only what differs from the saved account (so the organizer is told of real changes only), or null when nothing does */
export function organizerChanges(o: OrganizerLike, f: OrganizerForm) {
  const was = organizerForm(o);
  const changes: { fullName?: string; email?: string; phone?: string; profile?: { organizationType: OrganizerForm["type"]; organizationName?: string } } = {};
  if (f.fullName.trim() !== was.fullName.trim()) changes.fullName = f.fullName.trim();
  if (f.email.trim().toLowerCase() !== was.email.trim().toLowerCase()) changes.email = f.email.trim().toLowerCase();
  if (f.phone !== was.phone) changes.phone = f.phone;
  if (f.type !== was.type || (f.type === "ORGANIZATION" && f.organizationName.trim() !== was.organizationName.trim())) {
    changes.profile = { organizationType: f.type, ...(f.type === "ORGANIZATION" ? { organizationName: f.organizationName.trim() } : {}) };
  }
  return Object.keys(changes).length ? changes : null;
}

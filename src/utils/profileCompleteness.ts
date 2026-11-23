// What an organizer must have on their profile: the details an administrator fills in when adding an organizer, and the ones an
// organizer gives when signing up with the form. (Signing up with Google gives only the name and email; the rest is asked for
// on the dashboard until it is complete.)
export interface ProfileLike {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  profile?: { organizationType?: string | null; organizationName?: string | null; organization?: { phone?: string | null; whatsapp?: string | null; email?: string | null } | null } | null;
}

export type ProfileFieldKey = "fullName" | "email" | "organizationType" | "organizationName" | "organizationPhone" | "organizationWhatsapp" | "organizationEmail" | "phone";
export interface ProfileCompleteness {
  percent: number;
  complete: boolean;
  filled: number;
  total: number;
  missing: Array<{ key: ProfileFieldKey; label: string }>;
}

const digits = (v?: string | null) => (v || "").replace(/\D/g, "");

export function profileCompleteness(user: ProfileLike | null | undefined): ProfileCompleteness {
  const type = user?.profile?.organizationType === "ORGANIZATION" ? "ORGANIZATION" : user?.profile?.organizationType === "INDIVIDUAL" ? "INDIVIDUAL" : null;
  const checks: Array<{ key: ProfileFieldKey; label: string; ok: boolean }> = [
    { key: "fullName", label: type === "ORGANIZATION" ? "Contact person name" : "Full name", ok: (user?.fullName || "").trim().length >= 2 },
    { key: "email", label: "Email address", ok: /^\S+@\S+\.\S+$/.test((user?.email || "").trim()) },
    { key: "organizationType", label: "Individual or organization", ok: type !== null },
    // an organization also needs its own contact details (website and address stay optional); an individual has none of these
    ...(type === "ORGANIZATION" ? [
      { key: "organizationName" as const, label: "Organization name", ok: (user?.profile?.organizationName || "").trim().length >= 2 },
      { key: "organizationPhone" as const, label: "Organization phone", ok: digits(user?.profile?.organization?.phone).length >= 10 },
      { key: "organizationWhatsapp" as const, label: "WhatsApp number", ok: digits(user?.profile?.organization?.whatsapp).length >= 10 },
      { key: "organizationEmail" as const, label: "Organization email", ok: /^\S+@\S+\.\S+$/.test((user?.profile?.organization?.email || "").trim()) },
    ] : []),
    { key: "phone", label: "Phone number", ok: digits(user?.phone).length >= 10 },
  ];
  const filled = checks.filter((c) => c.ok).length;
  return {
    percent: Math.round((filled / checks.length) * 100),
    complete: filled === checks.length,
    filled,
    total: checks.length,
    missing: checks.filter((c) => !c.ok).map(({ key, label }) => ({ key, label })),
  };
}

type ProfileOf = { organizationType?: string; organizationName?: string } | undefined | null;

/** Organization or individual, as chosen at sign-up; accounts from before that choice are an organization when they have its name */
export const isOrganizationAccount = (user?: { profile?: unknown } | null): boolean => {
  const profile = user?.profile as ProfileOf;
  return (profile?.organizationType ?? (profile?.organizationName ? "ORGANIZATION" : "INDIVIDUAL")) === "ORGANIZATION";
};

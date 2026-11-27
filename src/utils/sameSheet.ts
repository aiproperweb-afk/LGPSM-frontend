// Is the file just chosen for a session the same guest list as one already chosen for another session? (Then the session simply "keeps the
// same invitees as" it, instead of uploading the list twice.) Compared by what is in the sheet, so a renamed copy counts and the order of
// the rows does not matter.

import type { InviteeSheetRow } from "./inviteeSheet.ts";

export function sheetSignature(rows: Pick<InviteeSheetRow, "name" | "email" | "phone" | "guests" | "company" | "identity" | "identity2">[]): string {
  return JSON.stringify(
    rows
      .map((r) => [r.name, r.email.toLowerCase(), r.phone.replace(/\D/g, ""), r.guests || "", r.company || "", r.identity || "", r.identity2 || ""].map((v) => v.trim()).join("\u001f"))
      .sort()
  );
}

interface SessionLike {
  key: string;
  inviteeSource: string;
  sourceSessionKey: string | null;
}

export interface SameListPlan<T> {
  /** the session that now keeps another session's invitees, and the one it keeps them from */
  copy: string;
  source: string;
  sessions: T[];
}

/**
 * `key` has just been given `signature`; `files` holds the signature of every session that has a file of its own. When another session has the
 * same list, the LATER of the two keeps the earlier one's invitees (only an earlier session can be copied). Returns null when no other
 * session has this list.
 */
export function planSameList<T extends SessionLike>(sessions: T[], files: Record<string, string | undefined>, key: string, signature: string): SameListPlan<T> | null {
  const index = sessions.findIndex((s) => s.key === key);
  const match = sessions.findIndex((s, i) => i !== index && s.inviteeSource === "NEW_LIST" && files[s.key] === signature);
  if (index < 0 || match < 0) return null;
  const source = sessions[Math.min(index, match)].key;
  const copy = sessions[Math.max(index, match)].key;
  return {
    source,
    copy,
    sessions: sessions.map((s) => {
      if (s.key === copy) return { ...s, inviteeSource: "COPY_SESSION", sourceSessionKey: source };
      // whoever kept the copied session's invitees keeps the same list from the source now
      if (s.sourceSessionKey === copy) return { ...s, sourceSessionKey: source };
      // the source keeps a list of its own
      if (s.key === source) return { ...s, inviteeSource: "NEW_LIST", sourceSessionKey: null };
      return s;
    }),
  };
}

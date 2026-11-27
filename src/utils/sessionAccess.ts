// Which sessions a guest can enter (the server's rule): a guest with no written rules enters every session, and a session that keeps
// another session's invitees is decided by that session's list.

interface SessionLike { _id?: string; inviteeSource?: string; sourceSessionId?: string | null }
interface GuestLike { sessionAccess?: { sessionId: string; allowed: boolean }[] }

export function allowedIn(guest: GuestLike, session: SessionLike): boolean {
  if (!guest.sessionAccess || guest.sessionAccess.length === 0) return true;
  const target = session.inviteeSource === "COPY_SESSION" && session.sourceSessionId ? session.sourceSessionId : session._id;
  const entry = guest.sessionAccess.find((a) => String(a.sessionId) === String(target));
  return !!entry && entry.allowed !== false;
}

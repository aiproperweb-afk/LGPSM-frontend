// Which sessions to save for a system user when assigning. A session list of [] means every session of the event.

/**
 * `chosen`: what is ticked in the popup (null = all sessions). `existing`: the sessions the person already covers on this event (null = not
 * assigned yet). With `keepExisting` (the popup was opened to ADD people to the session picked on the page), nothing they have is taken away.
 */
export function sessionsToSave(chosen: string[] | null, existing: string[] | null, keepExisting: boolean): string[] {
  if (chosen === null) return [];
  if (!keepExisting || existing === null) return chosen;
  if (existing.length === 0) return [];
  return [...new Set([...existing, ...chosen])];
}

/** The ticks the popup starts with when a session is picked on the page: it, plus what a single selected person already covers */
export function scopeForSession(sessionId: string, only: string[] | null): string[] | null {
  if (only === null) return [sessionId];
  if (only.length === 0) return null; // already on every session
  return [...new Set([...only, sessionId])];
}

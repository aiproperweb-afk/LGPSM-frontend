// How many system users cover each session of an event. An assignment that names no session covers all of them.

type SessionRef = string | { _id?: string };

export function countSessionStaff(assignments: { sessionIds?: SessionRef[] | null }[]): { everySession: number; bySession: Map<string, number> } {
  let everySession = 0;
  const bySession = new Map<string, number>();
  for (const assignment of assignments) {
    const ids = assignment.sessionIds || [];
    if (ids.length === 0) everySession += 1;
    for (const ref of ids) {
      const key = String(typeof ref === "object" ? ref._id : ref);
      bySession.set(key, (bySession.get(key) ?? 0) + 1);
    }
  }
  return { everySession, bySession };
}

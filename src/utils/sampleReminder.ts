// The invitee Excel has columns that depend on the event (Additional Information, custom titles), so every time the organizer is about to
// choose a file they are asked: download this event's sample, or continue because they already have it. It is asked each time, because a
// file with the wrong columns is refused and the sample is the quickest way to get them right.
export const sampleReminderAcknowledged = (_eventId: string, _columns: string[]): boolean => false;

/** Kept so callers need no change; nothing is remembered, the reminder shows every time. */
export const acknowledgeSampleReminder = (_eventId: string, _columns: string[]): void => {};

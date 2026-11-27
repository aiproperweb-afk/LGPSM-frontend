/** "31 Dec 2026, 4:00 pm": how a payment deadline is shown */
export function formatDeadline(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "the event ends";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}

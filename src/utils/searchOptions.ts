export interface SearchOption {
  value: string;
  label: string;
  /** a second line that is searched too (for example an email address) */
  hint?: string;
}

/** The options whose label or hint contains every word typed; "All …" (the empty value) stays at the top while it matches */
export function matchOptions<T extends SearchOption>(options: T[], query: string): T[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return options;
  return options.filter((o) => {
    const text = `${o.label} ${o.hint ?? ""}`.toLowerCase();
    return words.every((w) => text.includes(w));
  });
}

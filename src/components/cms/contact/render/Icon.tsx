// The icons a Contact page may use. Stroke paths on a 24 x 24 grid, drawn like the original page's icons.
import type { ReactNode } from "react";

const PATHS: Record<string, ReactNode> = {
  location: <><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.500 2 8 6" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1.2-3.600 3.600-5.400 6.500-5.400s5.300 1.800 6.500 5.400M16 4.7a3.5 3.5 0 010 6.600M18.500 15c1.500.9 2.500 2.500 3 5" /></>,
  star: <path d="M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.300L12 17.2 6.4 20.300l1.2-6.3L3 9.600l6.300-.8z" />,
  check: <path d="M4 12.5l5 5L20 6.5" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  "arrow-right": <path d="M4 12h15M13 6l6 6-6 6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.500v.1" /></>,
  heart: <path d="M12 20S3.500 15 3.500 9.100A4.600 4.600 0 0112 6.600a4.600 4.600 0 018.500 2.500C20.500 15 12 20 12 20z" />,
  building: <path d="M5 21V4h10v17M15 9h4v12M3 21h18M8 8h1M11 8h1M8 12h1M11 12h1M8 16h1M11 16h1" />,
  facebook: <path d="M14 21v-8h3l.5-3.500H14V7.500c0-1 .5-1.700 1.900-1.700h1.800V2.700C17 2.600 16 2.500 15 2.500c-2.700 0-4.500 1.600-4.500 4.600v2.400H7.500V13h3v8" />,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.300 6.700v.1" /></>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.1M12 17v-7M12 13c0-2 1.200-3 2.500-3s2.500 1 2.500 3v4" /></>,
  x: <path d="M4 4l16 16M20 4L4 20" />,
  youtube: <><rect x="2.500" y="5.500" width="19" height="13" rx="4" /><path d="M10 9.500l5 2.500-5 2.500z" /></>,
  whatsapp: <><path d="M4 20l1.300-4A8.500 8.500 0 1112 20.500a8.500 8.500 0 01-4.200-1.100z" /><path d="M9 8.500c-.5 3 3 7 6.500 6.500l.5-1.500-2.200-1-.9 1c-1.300-.5-2.400-1.600-2.900-2.900l1-.9-1-2.200z" /></>,
};

export const ICON_NAMES = Object.keys(PATHS);

export default function Icon({ name, size, strokeWidth = 1.8 }: { name: string; size?: number; strokeWidth?: number }) {
  return (
    <svg width={size ?? "1em"} height={size ?? "1em"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name] ?? PATHS.info}
    </svg>
  );
}

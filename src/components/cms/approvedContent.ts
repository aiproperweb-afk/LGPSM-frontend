import { HOSTINGER_MEDIA_ORIGIN } from "@/constants/media";
import { resolveImageUrl } from "@/utils/mediaUrl";

export const approvedDestinations = [
  { label: "Create an account", value: "/signup" },
  { label: "Contact", value: "/contact" },
  { label: "How it works", value: "/#how-it-works" },
  { label: "Features", value: "/#features" },
  { label: "Pricing", value: "/#pricing" },
  { label: "FAQs", value: "/#faq" },
];

export function approvedLink(value: string, fallback: string) {
  return approvedDestinations.some(({ value: approved }) => value === approved) ? value : fallback;
}

export function cmsMediaKeyFromUrl(value: string): string | null {
  const prefix = HOSTINGER_MEDIA_ORIGIN + "/";
  if (!value.startsWith(prefix)) return null;
  const file = /^([0-9a-f]{24})\.(?:jpg|png)$/.exec(value.slice(prefix.length));
  return file ? "media:" + file[1] : null;
}

export function resolveCmsImage(value: string) {
  if (/^media:[0-9a-fA-F]{24}$/.test(value)) return resolveImageUrl(value);
  return /^\/images\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:png|jpe?g|webp)$/i.test(value) ? value : null;
}

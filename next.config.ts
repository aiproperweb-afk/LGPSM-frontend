import type { NextConfig } from "next";
import { HOSTINGER_MEDIA_ORIGIN } from "./src/constants/media";

// Authenticated app sections and personal invitation links must never be indexed. This complements
// robots.txt (crawl guidance only) and the middleware/auth checks (the actual access control).
const PRIVATE_SECTIONS =
  "(dashboard|events|user-management|event-organizer|earnings|reports|settings|templates|notification|notifications|billing|invitation)";

// Keep the backend and configured media origins explicit for uploads.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://lgpsm-backend-vzuz.onrender.com";
const apiHost = new URL(apiUrl).hostname;
const apiOrigin = new URL(apiUrl).origin;
// Uploaded images may be served from a media address of their own (the API redirects image requests there); set at build time
const mediaUrl = (process.env.NEXT_PUBLIC_MEDIA_URL || "").trim();
const mediaOrigin = /^https:\/\//i.test(mediaUrl) ? new URL(mediaUrl).origin : HOSTINGER_MEDIA_ORIGIN;

// Enforced now: directives that cannot break page rendering but close clickjacking, <base> hijack,
// plugin and cross-site form-post vectors.
const ENFORCED_CSP = "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'";

// Full policy, delivered report-only until it has been exercised against every authenticated screen on
// staging. Next.js emits inline bootstrap scripts, so 'unsafe-inline' is required until nonces are adopted;
// even so it blocks loading script, frames and connections from origins the app does not use.
const REPORT_ONLY_CSP = [
  "default-src 'self'",
  // Google's sign-in button (accounts.google.com/gsi) and the profile picture it shows
  "script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
  `img-src 'self' data: blob: ${apiOrigin} ${[...new Set([HOSTINGER_MEDIA_ORIGIN, mediaOrigin])].join(" ")} https://tile.openstreetmap.org https://*.googleusercontent.com https://*.razorpay.com`,
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} https://nominatim.openstreetmap.org https://accounts.google.com/gsi/ https://api.razorpay.com https://lumberjack.razorpay.com`,
  "frame-src https://accounts.google.com/gsi/ https://api.razorpay.com https://checkout.razorpay.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // AVIF is noticeably smaller than WebP for photos; the browser picks what it supports
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(HOSTINGER_MEDIA_ORIGIN).hostname,
        port: "",
        pathname: "/" + "[0-9a-f]".repeat(24) + ".{jpg,png,webp}",
        search: "",
      },
      {
        protocol: "https",
        hostname: apiHost,
      },
      ...(mediaOrigin !== HOSTINGER_MEDIA_ORIGIN ? [{ protocol: "https" as const, hostname: new URL(mediaOrigin).hostname }] : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: ENFORCED_CSP },
          { key: "Content-Security-Policy-Report-Only", value: REPORT_ONLY_CSP },
          { key: "Permissions-Policy", value: "microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      {
        source: `/${PRIVATE_SECTIONS}/:path*`,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/admin/pages/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      // The files in public/ keep the same names when they change, so they cannot be cached forever; a week, then reuse
      // while the fresh copy is fetched in the background. Without this, browsers re-check each one on every visit.
      {
        source: "/(images|icons|fonts)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/pages/:path*",
        destination: "/:path*",
        permanent: true,
      },
      // The earlier Pricing page was replaced by a section of the landing page (Features has its own page again)
      // there is no page for "Clients" itself; its menu leads to the category pages, so the bare address opens the first one
      { source: "/clients", destination: "/clients/business-corporate", permanent: false },
      { source: "/pricing", destination: "/#pricing", permanent: false },
    ];
  },
};

export default nextConfig;

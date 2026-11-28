"use client";

import { createElement, type ReactNode } from "react";
import { useReveal, type RevealVariant } from "@/components/landing/useReveal";
import type { RootAttributes } from "./ContactFormClient";

/** The public page's existing scroll reveal applied to a builder component. */
export default function RevealBox({ as, attributes, variant, delay, children }: { as: string; attributes: RootAttributes; variant: RevealVariant; delay: number; children: ReactNode }) {
  const [ref, reveal] = useReveal<HTMLElement>(variant, delay);
  return createElement(as, { ...attributes, ref, style: reveal.style, className: `${reveal.className} ${attributes.className ?? ""}` }, children);
}

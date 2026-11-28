"use client";
import { SiteElement } from "@/components/cms/SiteElement";

import { resolveCmsImage } from "@/components/cms/approvedContent";
import Image from "next/image";
import { useState } from "react";

// The introduction video card (Figma 182:858): the dashboard behind a dimmed layer with a play button. The tutorial video itself is not
// produced yet, so the address is read from NEXT_PUBLIC_TUTORIAL_VIDEO_URL (an .mp4/.webm file). Until it is set the card says so honestly
// instead of showing a play button that leads nowhere.
const VIDEO_URL = process.env.NEXT_PUBLIC_TUTORIAL_VIDEO_URL ?? "";

export default function TutorialVideo({ image, unavailable }: { image: string; unavailable: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <SiteElement site="TutorialVideo-1"><div id="tutorial" className="relative mx-auto h-[260px] w-full max-w-[1080px] scroll-mt-[90px] overflow-hidden rounded-3xl bg-[#EAF1FF] sm:h-[420px] lg:h-[593px]">
      {playing && VIDEO_URL ? (
        <video src={VIDEO_URL} controls autoPlay playsInline className="absolute inset-0 size-full bg-black object-contain" />
      ) : (
        <>
          <SiteElement site="TutorialVideo-2"><div className="absolute left-1/2 top-[56px] hidden h-[602px] w-[964px] -translate-x-1/2 sm:block"><SiteElement site="TutorialVideo-3"><Image src={resolveCmsImage(image) ?? "/images/how-it-works/poster.jpg"} unoptimized={image.startsWith("media:")} alt="" fill sizes="964px" className="object-contain" /></SiteElement></div></SiteElement>
          <SiteElement site="TutorialVideo-4"><div className="absolute inset-0 sm:hidden"><SiteElement site="TutorialVideo-5"><Image src={resolveCmsImage(image) ?? "/images/how-it-works/poster.jpg"} unoptimized={image.startsWith("media:")} alt="" fill sizes="100vw" className="object-cover object-top" /></SiteElement></div></SiteElement>
          <div aria-hidden className="absolute inset-0 bg-[rgba(74,84,112,0.48)] backdrop-blur-[2px]" />
          <SiteElement site="TutorialVideo-6"><div className="absolute inset-0 flex items-center justify-center">
            {VIDEO_URL ? (
              <SiteElement site="TutorialVideo-7"><button type="button" onClick={() => setPlaying(true)} aria-label="Play the tutorial video" className="flex size-[99px] items-center justify-center rounded-full bg-white/90 shadow-[0_12px_32px_rgba(0,11,44,0.3)] transition-transform hover:scale-105">
                <svg width="36" height="40" viewBox="0 0 36 40" aria-hidden><path d="M6 4l26 16L6 36z" fill="#1F65FF" /></svg>
              </button></SiteElement>
            ) : (
              <SiteElement site="TutorialVideo-8"><span className="rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-[#000B2C] shadow-lg">{unavailable}</span></SiteElement>
            )}
          </div></SiteElement>
        </>
      )}
    </div></SiteElement>
  );
}

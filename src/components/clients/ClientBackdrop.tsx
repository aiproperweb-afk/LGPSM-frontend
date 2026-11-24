import Image from "next/image";

// The dark band background the Clients pages share (Figma 238:29013 and 238:28731): two soft glows and a block of dashed squares at the
// right, placed on a 1440px stage centred behind the section. The section must be `relative overflow-hidden`.
const SQUARES: [number, number][] = [[327, 0], [245, 0], [82, 325], [163, 243], [164, 162], [325, 325], [407, 407], [406, 243], [0, 243], [163, 325], [244, 243], [245, 162], [164, 81], [81, 243], [244, 325], [325, 243], [326, 162], [245, 81]];

function Glow({ className }: { className: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`}>
      <div className="absolute" style={{ inset: "-113.36%" }}><Image src={className.includes("glow-a") ? "/images/clients/glow-1.svg" : "/images/clients/glow-2.svg"} alt="" fill sizes="434px" className="max-w-none" /></div>
    </div>
  );
}

/** `lowGlowTop`: where the lower-left glow sits (319px in the tools band, 589px in the taller contact band) */
export default function ClientBackdrop({ lowGlowTop = 319 }: { lowGlowTop?: number }) {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[1440px] -translate-x-1/2 lg:block">
        <Glow className="glow-a left-[1181px] top-[-59px] size-[434px]" />
        <div aria-hidden className="pointer-events-none absolute left-[78px] size-[434px]" style={{ top: lowGlowTop }}>
          <div className="absolute" style={{ inset: "-113.36%" }}><Image src="/images/clients/glow-2.svg" alt="" fill sizes="434px" className="max-w-none" /></div>
        </div>
        <div className="absolute right-[-60px] top-[30px] size-[489px]">
          {SQUARES.map(([x, y]) => <span key={`${x}-${y}`} className="absolute size-[82px] border-[0.75px] border-dashed border-[#37456B]" style={{ left: x, top: y }} />)}
        </div>
      </div>
      <Glow className="glow-a right-[-200px] top-[-59px] size-[434px] lg:hidden" />
    </>
  );
}

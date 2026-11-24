import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { Container, Headline } from "./ui";

// Figma node 66:6481 — who it is for (the icons are the design's own files)
const CASES = [
  { tag: "Weddings and receptions", title: "Every family member, every function", body: "Separate guest lists for the mehendi, the wedding and the reception, with meal choices collected in advance.", icon: "/images/landing/case-1.svg" },
  { tag: "Birthdays and anniversaries", title: "Party invites that feel personal", body: "Pick a themed card, add a photo, and know who's coming before you book the caterer.", icon: "/images/landing/case-2.svg" },
  { tag: "Corporate events and AGMs", title: "Professional entry for professional events", body: "Branded invitations, controlled access for delegates and VIPs, and an attendance report for stakeholders.", icon: "/images/landing/case-3.svg" },
  { tag: "Product launches and conferences", title: "Keep the right people in the right room", body: "Run keynote, lunch and networking sessions with separate access, and track turnout per session.", icon: "/images/landing/case-4.svg" },
  { tag: "Expos, fests and graduations", title: "Big crowds, short queues", body: "Bulk-upload thousands of guests, staff every gate, and scan people in fast.", icon: "/images/landing/case-5.svg" },
  { tag: "Event planners and agencies", title: "Run many clients' events from one login", body: "Manage several events at once, assign your crew per event, and hand every client a clean report.", icon: "/images/landing/case-6.svg" },
];

export default function UseCases() {
  return (
    <section
      id="use-cases"
      className="scroll-mt-[69px] border-t border-[#E6EBF5] bg-[#000B2C] py-14 sm:py-20"
      style={{ backgroundImage: "radial-gradient(ellipse 38% 45% at 92% 0%, rgba(88,40,160,0.5), transparent 70%), radial-gradient(ellipse 30% 45% at 14% 100%, rgba(31,101,255,0.28), transparent 70%)" }}
    >
      <Container className="flex flex-col items-center gap-10 sm:gap-12">
        <Reveal className="flex w-full flex-col items-center gap-4 text-center">
          <Headline className="text-[#F2F2F7]">Built for every kind of guest list</Headline>
          <p className="max-w-[740px] text-[16px] text-[#BDC6E0] sm:text-[17px]">From a 50-person birthday to a 2,000-guest college fest, the same tools scale with you.</p>
        </Reveal>
        {/* six cards in a 3 x 2 grid, one outer rounded frame, hairline dividers (Figma 66:6486) */}
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-[19px] border border-[#E1E7F2] bg-white sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c, i) => (
            <Reveal key={c.tag} variant="pop" delay={(i % 3) * 90} className={`flex flex-col gap-[14px] p-6 sm:p-8 lg:min-h-[287px] ${i % 3 !== 0 ? "lg:border-l lg:border-[#E1E7F2]" : ""} ${i >= 3 ? "lg:border-t lg:border-[#E1E7F2]" : ""} ${i > 0 ? "border-t border-[#E1E7F2] sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l sm:border-[#E1E7F2]" : ""} ${i >= 2 ? "sm:border-t sm:border-[#E1E7F2]" : ""}`}>
              <div className="flex flex-col items-start gap-3">
                <span className="flex size-12 items-center justify-center rounded-[14px] bg-[#EAF1FF]"><Image src={c.icon} alt="" width={24} height={24} /></span>
                <p className="text-[15px] font-medium text-[#1F65FF]">{c.tag}</p>
              </div>
              <div className="flex flex-col gap-2.5">
                <h3 className="text-[17px] font-bold leading-[1.2] tracking-[-0.42px] text-[#000B2C]">{c.title}</h3>
                <p className="text-[16px] leading-[1.4] text-[#4A5470] sm:text-[17px]">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Link href="/contact" className="inline-flex h-[50px] items-center rounded-xl border border-white px-6 text-[16px] font-semibold text-white hover:bg-white/10 transition-colors">Find the right setup for your event</Link>
      </Container>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { formatMoney } from "@/utils/money";

interface PricePerHeadCardProps {
  /** null until a rate has been set for the first time */
  currentRate: number | null;
  saving?: boolean;
  onSaveRate: (newRate: number) => void;
}

export default function PricePerHeadCard({
  currentRate,
  saving = false,
  onSaveRate,
}: PricePerHeadCardProps) {
  // what the administrator has moved the rate to (null = the saved rate is shown)
  const [edited, setEdited] = useState<number | null>(null);
  const sliderVal = edited ?? currentRate ?? 3;
  const setSliderVal = (v: number) => setEdited(Number.isFinite(v) ? v : null);
  const rateText = currentRate === null ? "Not set" : formatMoney(currentRate);
  const rateLine = currentRate === null ? "No rate has been set yet, so events use the default of ₹3 per head" : `Per-head billing · ${rateText} / invitee (current rate)`;
  const changed = edited !== null && edited !== currentRate;
  const valid = sliderVal >= 1 && sliderVal <= 20;
  // where the value bubble sits above the slider thumb (the slider runs from ₹1 to ₹20)
  const thumbPct = Math.min(100, Math.max(0, ((Math.min(Math.max(sliderVal, 1), 20) - 1) / 19) * 100));

  const handleSave = () => {
    if (valid) onSaveRate(sliderVal);
    setEdited(null);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E0E0E0] p-6 space-y-4">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-medium text-[#15191C]">Price Per-Head</h2>
        <p className="text-xs text-[#4B4F52] mt-0.5">
          {rateLine}
        </p>
      </div>

      {/* Main Grid Card */}
      <div className="rounded-md px-2 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side Big Rate Display */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold text-[#1F65FF]">
              {rateText}
            </span>
            <span className="text-sm font-medium text-[#4B4F52]">Per head</span>
          </div>
          <p className="text-xs text-gray-500">{rateLine}</p>
        </div>

        {/* Right Side Slider Adjuster */}
        <div className="w-full md:w-[480px] bg-[#F7F7F7] rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-[#4B4F52] uppercase">
              ADJUST RATE
            </span>
            <span className={`text-sm font-semibold ${changed ? "text-[#1F65FF]" : "text-[#4B4F52]"}`} aria-live="polite">
              {changed ? `New rate: ${formatMoney(sliderVal)} per head` : `Current: ${formatMoney(sliderVal)} per head`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              {/* the number being chosen, over the thumb */}
              <div className="relative h-6" aria-hidden>
                <span className="absolute -translate-x-1/2 px-2 py-0.5 rounded bg-[#1F65FF] text-white text-xs font-semibold whitespace-nowrap" style={{ left: `calc(${thumbPct}% + ${8 - thumbPct * 0.16}px)` }}>{formatMoney(sliderVal)}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={sliderVal}
                aria-label="Price per invitee"
                onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1F65FF]"
              />
              <div className="flex justify-between text-xs font-medium text-[#6B6B6B]">
                <span>{formatMoney(1, { maxFractionDigits: 0 })}</span>
                <span>{formatMoney(10, { maxFractionDigits: 0 })}</span>
                <span>{formatMoney(20, { maxFractionDigits: 0 })}</span>
              </div>
            </div>

            <label className="flex items-center gap-1 shrink-0 text-sm text-[#4B4F52]">
              ₹
              <input
                type="number"
                min={1}
                max={20}
                step={0.5}
                value={Number.isFinite(sliderVal) ? sliderVal : ""}
                aria-label="Price per invitee in rupees"
                onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                className="w-[72px] h-10 px-2 border border-[#E0E0E0] rounded-md text-sm font-medium text-[#15191C] bg-white focus:outline-none focus:border-black"
              />
            </label>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !changed || !valid}
              className="disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 bg-[#1F65FF] text-white text-sm font-semibold rounded-md hover:bg-[#1A56DB] transition-colors shrink-0"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

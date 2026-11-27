import React from "react";
import CustomDropdown from "@/components/common/CustomDropdown";

// A column heading that picks what the column shows (the session of "Access Control", the question of "Food Preference"), so one column
// stands where there would otherwise be one per choice
export default function ColumnPicker({ label, ariaLabel, value, options, onChange }: { label: string; ariaLabel: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <span className="flex flex-col items-start">
      <span className="text-xs">{label}</span>
      {options.length > 1
        ? <CustomDropdown portal variant="plain" plainTone="ink" value={value} onChange={onChange} options={options} ariaLabel={ariaLabel} className="!w-[170px] !max-w-[170px] [&>button]:!h-6 [&>button]:!px-0" />
        : <span className="text-xs font-normal text-[#15191C] max-w-[170px] truncate" title={options[0]?.label}>{options[0]?.label}</span>}
    </span>
  );
}

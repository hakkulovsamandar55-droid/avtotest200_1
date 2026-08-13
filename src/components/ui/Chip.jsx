import React from "react";

/** Gorizontal suriladigan qator uchun kichik ma'lumot kapsulasi. */
export default function Chip({ icon: Icon, value, label }) {
  return (
    <div className="shrink-0 rounded-full bg-surface border border-line pl-2.5 pr-4 py-2 flex items-center gap-2">
      {Icon && (
        <span className="w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
          <Icon size={12} className="text-accent" />
        </span>
      )}
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="text-[13px] font-extrabold text-main tabular-nums">{value}</span>
        <span className="text-[10.5px] text-muted">{label}</span>
      </span>
    </div>
  );
}

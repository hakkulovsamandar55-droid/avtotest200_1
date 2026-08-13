import React from "react";

export default function ProgressBar({ value, className = "", barClassName = "" }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  return (
    <div className={`h-2 rounded-full bg-sunken overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full bg-accent transition-[width] duration-300 ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

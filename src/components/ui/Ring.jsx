import React from "react";

/**
 * Doiraviy progress ko'rsatkich — conic-gradient asosida. Katta raqam +
 * kichik yorliq markazda, ixtiyoriy pastki matn.
 */
export default function Ring({ value, size = 168, thickness = 14, label, caption, onClick }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--accent) ${pct * 3.6}deg, var(--bg-sunken) 0deg)`,
        }}
      />
      <div
        className="absolute rounded-full bg-app flex flex-col items-center justify-center"
        style={{ inset: thickness }}
      >
        <span className="text-[34px] font-extrabold tabular-nums text-main leading-none">{label}</span>
        {caption && <span className="text-[11px] text-muted mt-1.5">{caption}</span>}
      </div>
    </Tag>
  );
}

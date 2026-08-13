import React from "react";
import { ChevronLeft } from "../../icons";

/**
 * Har bir ichki ekranning yuqori qismi: orqaga tugmasi + sarlavha (+ ixtiyoriy
 * subtitle va o'ng tomondagi harakat). Butun ilova bo'ylab bir xil.
 */
export default function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-4">
      {onBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        >
          <ChevronLeft size={19} className="text-main" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-[19px] font-bold text-main truncate leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted mt-0.5 truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "../../icons";

// Guruhlangan filtr ro'yxati — spec 2-bo'lim. Har bir filtr kaliti backend
// (admin.js buildFilterConditions) bilan bir xil bo'lishi shart.
const FILTER_GROUPS = [
  { title: "status", keys: ["premium", "free", "admin", "blocked"] },
  { title: "registered", keys: ["registeredToday", "registeredThisWeek", "registeredThisMonth"] },
  { title: "activity", keys: ["activeToday", "active3Days", "active7Days", "active30Days", "highActivity", "lowActivity"] },
  { title: "premiumHistory", keys: ["neverPurchasedPremium", "purchasedPremium"] },
  { title: "other", keys: ["referralUsers", "examSoon"] },
];

// Foydalanuvchilar ro'yxatini bir nechta filtr bilan birga cheklash imkonini
// beruvchi tepasi bosiladigan panel. Tanlangan filtrlar chip sifatida ham
// qidiruv maydoni ustida ko'rsatiladi (kiritilmagan holatda ham ko'rinadi).
export default function UserFiltersPanel({ selected, onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  function toggle(key) {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-2xl bg-surface border border-line px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-main">
          <SlidersHorizontal size={15} className="text-accent" />
          {t("admin.filters.title")}
          {selected.length > 0 && (
            <span className="text-[10px] font-bold text-accent-ink rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-accent">
              {selected.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={16} className="text-soft" /> : <ChevronDown size={16} className="text-soft" />}
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((key) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className="flex items-center gap-1 rounded-full pl-3 pr-2 py-1.5 text-[11px] font-semibold text-accent-ink bg-accent"
            >
              {t(`admin.filters.options.${key}`)}
              <X size={11} />
            </button>
          ))}
          <button onClick={() => onChange([])} className="text-[11px] font-semibold text-muted px-2 py-1.5">
            {t("admin.filters.clearAll")}
          </button>
        </div>
      )}

      {open && (
        <div className="mt-2 rounded-2xl bg-surface border border-line p-4 space-y-4">
          {FILTER_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-muted text-[11px] font-semibold uppercase tracking-wide mb-2">
                {t(`admin.filters.groups.${group.title}`)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.keys.map((key) => {
                  const active = selected.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggle(key)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-transform active:scale-95 border ${
                        active ? "bg-accent text-accent-ink border-accent" : "bg-surface-2 text-main border-line"
                      }`}
                    >
                      {t(`admin.filters.options.${key}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

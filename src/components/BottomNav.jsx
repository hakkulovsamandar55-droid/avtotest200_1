import React from "react";
import { useTranslation } from "react-i18next";
import { Home, BarChart3, Settings } from "lucide-react";

// Pastki navigatsiya — suzuvchi kapsula, faqat ikonkalar. Faol bo'lim
// aksent rangli dumaloq fon bilan ajratiladi (matn yorlig'i yo'q — bu
// eski to'liq kengliqdagi, matnli panel uslubidan ataylab farq qiladi).
export default function BottomNav({ active, setActive }) {
  const { t } = useTranslation();
  const items = [
    { key: "home", label: t("nav.home"), icon: Home },
    { key: "stats", label: t("nav.stats"), icon: BarChart3 },
    { key: "settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <div className="shrink-0 flex justify-center px-6 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-1">
      <nav className="flex items-center gap-1.5 rounded-full bg-surface border border-line shadow-lg px-2 py-2">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              aria-label={label}
              className={`flex items-center gap-1.5 rounded-full transition-all duration-200 ${
                isActive ? "bg-accent pl-3 pr-4 py-2.5" : "px-3 py-2.5"
              }`}
            >
              <Icon size={19} strokeWidth={2.2} className={isActive ? "text-accent-ink" : "text-soft"} />
              {isActive && <span className="text-[12.5px] font-bold text-accent-ink whitespace-nowrap">{label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

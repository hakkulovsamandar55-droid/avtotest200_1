import React from "react";
import { useTranslation } from "react-i18next";
import { Home, BarChart3, Settings } from "lucide-react";

// Pastki navigatsiya — 3 bo'lim: O'rganish / Statistika / Sozlamalar
export default function BottomNav({ active, setActive }) {
  const { t } = useTranslation();
  const items = [
    { key: "home", label: t("nav.home"), icon: Home },
    { key: "stats", label: t("nav.stats"), icon: BarChart3 },
    { key: "settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <nav className="flex border-t border-line bg-surface px-2 pt-2 pb-6 shrink-0">
      {items.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => setActive(key)}
            className="flex-1 flex flex-col items-center gap-1 py-1 active:scale-95 transition-transform"
          >
            <Icon size={22} strokeWidth={2} className={isActive ? "text-accent" : "text-soft"} />
            <span className={`text-[11px] font-medium ${isActive ? "text-accent" : "text-soft"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

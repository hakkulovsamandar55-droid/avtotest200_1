import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AdminPaymentsTab from "./admin/AdminPaymentsTab";
import ModeratorUsersTab from "./admin/ModeratorUsersTab";
import ModeratorStatsTab from "./admin/ModeratorStatsTab";
import { ScreenHeader } from "../components/ui";

// Mini-admin (MODERATOR) paneli — to'liq AdminPanelScreen'dan ATAYLAB
// ALOHIDA va SODDA: faqat 3 bo'lim (to'lovlar, statistika, foydalanuvchilar).
// Tariflarni tahrirlash, broadcast, jurnal va h.k. bu yerda yo'q — backend
// ham bu harakatlarga moderator tokenini qabul qilmaydi, shuning uchun bu
// ekranda ularni ko'rsatishning ma'nosi yo'q.
export default function ModeratorPanelScreen({ onBack }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("payments"); // payments | stats | users

  const TABS = ["payments", "stats", "users"];
  const TAB_LABEL_KEY = {
    payments: "payments",
    stats: "moderatorStats",
    users: "moderatorUsers",
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-6 bg-app min-h-full animate-slide-in">
      <ScreenHeader title={t("admin.moderator.title")} onBack={onBack} />

      <div className="flex gap-1.5 mb-4">
        {TABS.map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap border ${
                active ? "bg-accent text-accent-ink border-accent" : "bg-surface-2 text-muted border-line"
              }`}
            >
              {t(`admin.tab.${TAB_LABEL_KEY[key]}`)}
            </button>
          );
        })}
      </div>

      {tab === "payments" && <AdminPaymentsTab moderatorMode />}
      {tab === "stats" && <ModeratorStatsTab />}
      {tab === "users" && <ModeratorUsersTab />}
    </div>
  );
}

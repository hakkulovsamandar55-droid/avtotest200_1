import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Crown, UserPlus, CalendarDays, Clock, CheckCircle2, XCircle } from "lucide-react";
import { api } from "../../api";
import { Card } from "../../components/ui";

function StatCard({ icon: Icon, label, value, tone }) {
  const toneClass = {
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    info: "bg-sky-500/15 text-sky-400",
    danger: "bg-danger/15 text-danger",
  }[tone];

  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toneClass}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-main leading-tight">{value}</p>
        <p className="text-muted text-xs truncate">{label}</p>
      </div>
    </Card>
  );
}

// Mini-admin (MODERATOR) uchun umumiy statistika: to'liq admin panelidagi
// batafsil tahlil emas, faqat asosiy ko'rsatkichlar.
export default function ModeratorStatsTab() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.getModeratorStats().then(setStats).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return <p className="text-center text-muted text-sm mt-10">...</p>;
  }
  if (!stats) return null;

  return (
    <div className="space-y-3 pb-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label={t("admin.moderator.totalUsers")} value={stats.totalUsers} tone="accent" />
        <StatCard icon={Crown} label={t("admin.moderator.premiumUsers")} value={stats.premiumUsers} tone="warning" />
        <StatCard icon={UserPlus} label={t("admin.moderator.registeredToday")} value={stats.registeredToday} tone="success" />
        <StatCard icon={CalendarDays} label={t("admin.moderator.registeredThisWeek")} value={stats.registeredThisWeek} tone="info" />
      </div>

      <p className="text-muted text-xs font-semibold mt-4 mb-1 ml-1">{t("admin.moderator.paymentsOverview")}</p>
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Clock} label={t("admin.payments.filterPending")} value={stats.payments.pending} tone="warning" />
        <StatCard icon={CheckCircle2} label={t("admin.payments.filterApproved")} value={stats.payments.approved} tone="success" />
        <StatCard icon={XCircle} label={t("admin.payments.filterRejected")} value={stats.payments.rejected} tone="danger" />
      </div>
    </div>
  );
}

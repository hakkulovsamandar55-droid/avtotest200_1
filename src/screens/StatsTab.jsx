import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Zap, ListChecks, Trophy, Flame, Clock } from "lucide-react";
import { api } from "../api";
import { Card, ProgressBar } from "../components/ui";

function StatCard({ icon: Icon, value, label }) {
  return (
    <Card className="p-5">
      <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center mb-4">
        <Icon size={18} className="text-accent" />
      </div>
      <p className="text-2xl font-extrabold text-main">{value}</p>
      <p className="text-muted text-sm mt-0.5">{label}</p>
    </Card>
  );
}

// 2b-EKRAN: "Statistika" bo'limi
export default function StatsTab() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .getMyStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const s = stats || {
    accuracy: 0,
    solved: 0,
    completedTickets: 0,
    streakDays: 0,
    examReadiness: 0,
    passChance: 0,
    learnedQuestionsPct: 0,
    masteryQualityPct: 0,
    examResultsPct: 0,
    studyPlan: null,
  };

  const readinessTone =
    s.examReadiness >= 70 ? "text-success" : s.examReadiness >= 40 ? "text-warning" : "text-danger";

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-4 animate-fade-in">
      <h1 className="text-xl font-extrabold text-main text-center mb-5">{t("stats.title")}</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Zap} value={`${s.accuracy}%`} label={t("stats.accuracy")} />
        <StatCard
          icon={Flame}
          value={t("home.streakDays", { days: s.streakDays })}
          label={t("stats.streak")}
        />
        <StatCard icon={ListChecks} value={String(s.solved)} label={t("stats.solved")} />
        <StatCard icon={Trophy} value={String(s.completedTickets)} label={t("stats.completed")} />
      </div>

      <Card className="mt-4 p-5">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-accent" />
          <p className="font-bold text-main">{t("stats.examReadiness")}</p>
        </div>
        <p className={`text-center text-5xl font-extrabold mt-4 ${readinessTone}`}>
          {s.examReadiness}%
        </p>
        <p className={`text-center text-sm font-medium mt-1 ${readinessTone}`}>
          {s.examReadiness >= 70 ? t("stats.readyLabel") : t("stats.needsPreparation")}
        </p>

        <div className="mt-5 space-y-4">
          {[
            [t("stats.passChance"), s.passChance],
            [t("stats.learnedQuestions"), s.learnedQuestionsPct],
            [t("stats.masteryQuality"), s.masteryQualityPct],
            [t("stats.examResults"), s.examResultsPct],
          ].map(([label, pct]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{label}</span>
                <span className="font-bold text-main">{pct}%</span>
              </div>
              <ProgressBar value={pct} className="mt-1.5" />
            </div>
          ))}
        </div>
      </Card>

      {s.studyPlan && (
        <Card className="mt-4 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-accent" />
            <p className="font-bold text-main">{t("stats.studyPlanTitle")}</p>
          </div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted">
              {t("stats.studyPlanCompare", {
                actual: s.studyPlan.avgDailyMinutes,
                planned: s.studyPlan.dailyStudyMinutes,
              })}
            </span>
            <span className="font-bold text-main">{s.studyPlan.planProgressPct}%</span>
          </div>
          <ProgressBar value={s.studyPlan.planProgressPct} />
          <p className="text-muted text-xs mt-2">
            {t("stats.studyPlanActiveDays", { days: s.studyPlan.activeDaysLast7 })}
          </p>
        </Card>
      )}
    </div>
  );
}

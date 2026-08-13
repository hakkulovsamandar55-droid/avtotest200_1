import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Zap, ListChecks, Trophy, Flame, Clock } from "../icons";
import { api } from "../api";
import { Ring, Group, Chip } from "../components/ui";

// 2b-EKRAN: "Statistika" — HomeTab'dagi halqa bilan bir xil vizual til,
// lekin bu yerda batafsil: pastda barcha ko'rsatkichlar bitta yaxlit
// ro'yxatda (eski 2x2 karta to'ri o'rniga).
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

  return (
    <div className="flex-1 overflow-y-auto tp-safe-top pb-4 animate-fade-in">
      <h1 className="text-xl font-extrabold text-main text-center">{t("stats.title")}</h1>

      <div className="flex flex-col items-center mt-5">
        <Ring
          value={s.examReadiness}
          label={`${s.examReadiness}%`}
          caption={s.examReadiness >= 70 ? t("stats.readyLabel") : t("stats.needsPreparation")}
          size={144}
          thickness={12}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-5 px-5">
        <Chip icon={Flame} value={t("home.streakDays", { days: s.streakDays })} label={t("stats.streak")} />
        <Chip icon={Trophy} value={String(s.completedTickets)} label={t("stats.completed")} />
      </div>

      <div className="px-5 mt-6">
        <Group>
          <MetricRow icon={Zap} label={t("stats.accuracy")} value={`${s.accuracy}%`} pct={s.accuracy} />
          <MetricRow icon={ListChecks} label={t("stats.solved")} value={String(s.solved)} />
          <MetricRow label={t("stats.passChance")} value={`${s.passChance}%`} pct={s.passChance} />
          <MetricRow label={t("stats.learnedQuestions")} value={`${s.learnedQuestionsPct}%`} pct={s.learnedQuestionsPct} />
          <MetricRow label={t("stats.masteryQuality")} value={`${s.masteryQualityPct}%`} pct={s.masteryQualityPct} />
          <MetricRow label={t("stats.examResults")} value={`${s.examResultsPct}%`} pct={s.examResultsPct} />
        </Group>
      </div>

      {s.studyPlan && (
        <div className="px-5 mt-4">
          <Group>
            <div className="px-4 py-3.5">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-accent" />
                <p className="font-bold text-main text-sm">{t("stats.studyPlanTitle")}</p>
              </div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted text-xs">
                  {t("stats.studyPlanCompare", {
                    actual: s.studyPlan.avgDailyMinutes,
                    planned: s.studyPlan.dailyStudyMinutes,
                  })}
                </span>
                <span className="font-bold text-main text-xs">{s.studyPlan.planProgressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-sunken overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(s.studyPlan.planProgressPct, 4)}%` }} />
              </div>
              <p className="text-muted text-[11px] mt-2">{t("stats.studyPlanActiveDays", { days: s.studyPlan.activeDaysLast7 })}</p>
            </div>
          </Group>
        </div>
      )}
    </div>
  );
}

function MetricRow({ icon: Icon, label, value, pct }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
            <Icon size={13} className="text-accent" />
          </span>
        )}
        <span className={`flex-1 text-[13px] ${Icon ? "font-semibold text-main" : "text-muted"}`}>{label}</span>
        <span className="text-[13px] font-bold text-main tabular-nums">{value}</span>
      </div>
      {pct != null && (
        <div className="h-1 rounded-full bg-sunken overflow-hidden mt-2 ml-10">
          <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(pct, 3)}%` }} />
        </div>
      )}
    </div>
  );
}

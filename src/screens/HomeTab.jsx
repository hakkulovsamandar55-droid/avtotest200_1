import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Play,
  Layers,
  TrafficCone,
  Swords,
  BookOpen,
  AlertTriangle,
  Bookmark,
  Shuffle,
  ClipboardCheck,
  Flame,
  Target,
  ListChecks,
  Lock,
  ChevronRight,
} from "lucide-react";
import { api } from "../api";
import { useSettings } from "../SettingsContext";
import { Ring, Group, Chip, Button } from "../components/ui";

/**
 * BOSH SAHIFA — "Focus" tartibi.
 *
 * Eski variant: hafta-chizig'i karta + 2 ustunli kafel to'ri. Bu safar
 * markaziy e'tibor BITTA katta tayyorgarlik halqasida — foydalanuvchi
 * ochgan zahoti o'z holatini bir qarashda ko'radi. Undan pastda
 * ikkinchi darajali ko'rsatkichlar gorizontal suriladigan kapsulalar
 * sifatida (alohida katta karta emas), so'ng BITTA yaxlit ro'yxat
 * (guruhlangan qatorlar) — endi 2 ustunli kafellar emas, tepadan pastga
 * o'qiladigan menyu.
 */
export default function HomeTab({
  user,
  onOpenTickets,
  onOpenSigns,
  onOpenExam,
  onOpenOfficialExam,
  onOpenStats,
  onOpenDuel,
  onOpenTopics,
  onOpenMistakes,
  onOpenSaved,
  onOpenTricky,
  onOpenPremium,
}) {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .getMyStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const s = stats || {};
  const readiness = clampPct(s.examReadiness);
  const passChance = clampPct(s.passChance);
  const learned = clampPct(s.learnedQuestionsPct);
  const streak = s.streakDays || 0;
  const weekly = s.weeklyActivity || [];
  const activeDays = weekly.filter((d) => d.active).length;

  // MODUL -> IMKONIYAT xaritasi. Admin panelidagi ro'yxat bilan bog'lanadi:
  // admin biror imkoniyatni PREMIUM qilsa, mos qatorda qulf paydo bo'ladi.
  const { globalFreeMode, featureAccess } = useSettings();

  const MODE_FEATURE = {
    topics: "topic_tests",
    mistakes: "mistakes",
    saved: "saved_questions",
    tricky: "tricky_tests",
    duel: "duel",
  };

  function isLocked(modeKey) {
    const feature = MODE_FEATURE[modeKey];
    if (!feature) return false;
    if (globalFreeMode) return false;
    if (featureAccess[feature] !== "PREMIUM") return false;
    return !user?.isPremium;
  }

  const modes = [
    { modeKey: "practice", icon: Play, title: t("home.dailyPractice"), sub: t("home.chooseQuestionCount"), onClick: onOpenExam },
    { modeKey: "tickets", icon: Layers, title: t("home.tickets"), sub: `${learned}%`, onClick: onOpenTickets },
    { modeKey: "signs", icon: TrafficCone, title: t("home.roadSigns"), sub: t("home.roadSignsSubtitle"), onClick: onOpenSigns },
    { modeKey: "topics", icon: BookOpen, title: t("home.topicTests"), sub: t("home.topicTestsSubtitle"), onClick: onOpenTopics },
    { modeKey: "mistakes", icon: AlertTriangle, title: t("home.mistakes"), sub: t("home.mistakesSubtitle"), onClick: onOpenMistakes },
    { modeKey: "saved", icon: Bookmark, title: t("home.savedQuestions"), sub: t("home.savedQuestionsSubtitle"), onClick: onOpenSaved },
    { modeKey: "tricky", icon: Shuffle, title: t("home.trickyTests"), sub: t("home.trickyTestsSubtitle"), onClick: onOpenTricky },
    { modeKey: "duel", icon: Swords, title: t("home.duel"), sub: t("home.duelSubtitle"), onClick: onOpenDuel },
  ];

  return (
    <div className="flex-1 overflow-y-auto tp-safe-top pb-4 animate-fade-in">
      {/* Sarlavha — avatar chapda, streak o'ngda */}
      <div className="flex items-center justify-between px-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-accent text-accent-ink flex items-center justify-center text-base font-bold shrink-0">
            {(user?.name || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted">{t("home.welcome")}</p>
            <h1 className="text-[17px] font-extrabold truncate text-main leading-tight">{user?.name || t("home.guest")}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-surface border border-line pl-2 pr-3 py-1.5 shrink-0">
          <Flame size={14} className="text-warning" />
          <span className="text-xs font-bold text-main">{streak}</span>
        </div>
      </div>

      {/* HALQA — tayyorgarlik darajasi, markaziy e'tibor */}
      <div className="flex flex-col items-center mt-6">
        <Ring value={readiness} label={`${readiness}%`} caption={t("home.readinessShort")} onClick={onOpenStats} />

        {/* Haftalik faollik — endi shunchaki 7 ta nuqta, alohida karta emas */}
        <div className="flex items-center gap-1.5 mt-4">
          {Array.from({ length: 7 }, (_, i) => weekly[i] || { active: false, isToday: false }).map((d, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${d.isToday ? "bg-accent scale-125" : d.active ? "bg-accent/50" : "bg-sunken"}`}
            />
          ))}
          <span className="text-[10px] text-muted ml-1.5">{t("home.daysOfSeven", { count: activeDays })}</span>
        </div>
      </div>

      {/* Ikkinchi darajali ko'rsatkichlar — gorizontal suriladigan kapsulalar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-5 px-5">
        <Chip icon={Target} value={`${passChance}%`} label={t("home.passChanceShort")} />
        <Chip icon={ListChecks} value={formatCount(s.totalAnswered)} label={t("home.totalQuestions")} />
        <Chip icon={Layers} value={`${learned}%`} label={t("home.tickets")} />
      </div>

      {/* ASOSIY HARAKAT */}
      <div className="px-5 mt-5">
        <Button onClick={onOpenOfficialExam} size="lg" className="w-full">
          <ClipboardCheck size={17} />
          {t("home.startOfficialExam")}
        </Button>
      </div>

      {/* MASHQ TURLARI — bitta yaxlit ro'yxat, 2 ustunli kafellar o'rniga */}
      <div className="px-5 mt-6">
        <Group>
          {modes.map((mode) => {
            const locked = isLocked(mode.modeKey);
            return (
              <button
                key={mode.modeKey}
                onClick={locked ? onOpenPremium : mode.onClick}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-surface-2 transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                  <mode.icon size={16} className={locked ? "text-soft" : "text-accent"} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-semibold text-main truncate">{mode.title}</span>
                  <span className="block text-[11px] text-muted truncate mt-0.5">{mode.sub}</span>
                </span>
                {locked ? (
                  <Lock size={14} className="text-warning shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-soft shrink-0" />
                )}
              </button>
            );
          })}
        </Group>
      </div>
    </div>
  );
}

function clampPct(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(Math.round(n), 0), 100);
}

/** 1240 -> "1 240" — uzun raqamlar kapsulaga sig'ishi uchun */
function formatCount(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return n.toLocaleString("ru-RU").replace(/ /g, " ");
}

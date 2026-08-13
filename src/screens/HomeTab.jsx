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
  Lock,
} from "lucide-react";
import { api } from "../api";
import { useSettings } from "../SettingsContext";

/**
 * BOSH SAHIFA.
 *
 * TUZILMA (yuqoridan pastga, muhimlik tartibida):
 *   1) Salomlashish + ketma-ket kunlar
 *   2) HAFTALIK RITM — qaysi kun ishlangani. Bo'sh kunlar ko'zga tashlanadi,
 *      bu qaytib kelishga undaydi. Ostida uchta asosiy ko'rsatkich.
 *   3) Rasmiy imtihon — yagona to'q rangli tugma, eng muhim harakat
 *   4) 2 ustunli kafellar — barcha bo'limlarga tez kirish
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

  // KAFEL -> IMKONIYAT xaritasi. Admin panelidagi ro'yxat bilan bog'lanadi:
  // admin biror imkoniyatni PREMIUM qilsa, mos kafelda qulf paydo bo'ladi.
  //
  // Ro'yxatda yo'q kafellar (practice, tickets, signs) HAR DOIM ochiq —
  // bular ilovaning asosiy mazmuni, ularni yopish mantiqsiz.
  const { globalFreeMode, featureAccess } = useSettings();

  const TILE_FEATURE = {
    topics: "topic_tests",
    mistakes: "mistakes",
    saved: "saved_questions",
    tricky: "tricky_tests",
    duel: "duel",
  };

  // MUHIM: bu FAQAT UI qulfi. Haqiqiy cheklov backendda bo'lishi kerak —
  // mijoz tomonini chetlab o'tish mumkin.
  function isLocked(tileKey) {
    const feature = TILE_FEATURE[tileKey];
    if (!feature) return false;
    if (globalFreeMode) return false;
    if (featureAccess[feature] !== "PREMIUM") return false;
    return !user?.isPremium;
  }

  const tiles = [
    {
      key: "practice",
      icon: Play,
      title: t("home.dailyPractice"),
      sub: t("home.chooseQuestionCount"),
      onClick: onOpenExam,
    },
    {
      key: "tickets",
      icon: Layers,
      title: t("home.tickets"),
      sub: `${learned}%`,
      onClick: onOpenTickets,
    },
    {
      key: "signs",
      icon: TrafficCone,
      title: t("home.roadSigns"),
      sub: t("home.roadSignsSubtitle"),
      onClick: onOpenSigns,
    },
    {
      key: "topics",
      icon: BookOpen,
      title: t("home.topicTests"),
      sub: t("home.topicTestsSubtitle"),
      onClick: onOpenTopics,
    },
    {
      key: "mistakes",
      icon: AlertTriangle,
      title: t("home.mistakes"),
      sub: t("home.mistakesSubtitle"),
      onClick: onOpenMistakes,
    },
    {
      key: "saved",
      icon: Bookmark,
      title: t("home.savedQuestions"),
      sub: t("home.savedQuestionsSubtitle"),
      onClick: onOpenSaved,
    },
    {
      key: "tricky",
      icon: Shuffle,
      title: t("home.trickyTests"),
      sub: t("home.trickyTestsSubtitle"),
      onClick: onOpenTricky,
    },
    {
      key: "duel",
      icon: Swords,
      title: t("home.duel"),
      sub: t("home.duelSubtitle"),
      onClick: onOpenDuel,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-4 animate-fade-in">
      {/* Sarlavha */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted">{t("home.welcome")}</p>
          <h1 className="text-[23px] font-extrabold truncate tracking-tight text-main">
            {user?.name || t("home.guest")}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-surface border border-line px-3 py-2 shrink-0">
          <Flame size={13} className="text-warning" />
          <span className="text-xs font-bold text-warning">
            {t("home.streakDays", { days: streak })}
          </span>
        </div>
      </div>

      {/* HAFTALIK RITM + ko'rsatkichlar */}
      <button
        onClick={onOpenStats}
        className="w-full text-left mt-5 rounded-2xl bg-surface border border-line p-[19px] active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted">
            {t("home.thisWeek")}
          </span>
          <span className="text-[11px] font-extrabold text-accent">
            {t("home.daysOfSeven", { count: weekly.filter((d) => d.active).length })}
          </span>
        </div>

        <WeekStrip days={weekly} t={t} />

        <div className="flex gap-2.5 mt-[17px] pt-[15px] border-t border-line">
          <Metric value={`${readiness}%`} label={t("home.readinessShort")} />
          <Metric value={`${passChance}%`} label={t("home.passChanceShort")} />
          <Metric value={formatCount(s.totalAnswered)} label={t("home.totalQuestions")} />
        </div>
      </button>

      {/* RASMIY IMTIHON — yagona to'q rangli harakat */}
      <button
        onClick={onOpenOfficialExam}
        className="w-full mt-3 rounded-2xl py-4 px-4 font-bold text-sm bg-accent text-accent-ink flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
      >
        <ClipboardCheck size={17} />
        {t("home.startOfficialExam")}
      </button>

      {/* KAFELLAR */}
      <div className="grid grid-cols-2 gap-[11px] mt-3">
        {tiles.map((tile) => {
          const locked = isLocked(tile.key);
          return (
            <Tile
              key={tile.key}
              {...tile}
              locked={locked}
              // Qulflangan kafel bosilganda premium ekraniga olib boradi —
              // shunchaki "ishlamaydi" holatida qoldirmaymiz.
              onClick={locked ? onOpenPremium : tile.onClick}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Haftalik ritm chizig'i.
 *
 * Backend `weeklyActivity` bermasa ham yiqilmasligi kerak — bo'sh massivda
 * hafta kunlari faolsiz holatda ko'rsatiladi.
 */
function WeekStrip({ days, t }) {
  const labels = t("home.weekdayLetters", { returnObjects: true });
  const letters = Array.isArray(labels) ? labels : ["D", "S", "C", "P", "J", "S", "Y"];

  // Har doim 7 kun — ma'lumot yetmasa bo'sh kun sifatida to'ldiramiz
  const cells = Array.from({ length: 7 }, (_, i) => days[i] || { active: false, isToday: false });

  return (
    <div className="flex gap-1.5">
      {cells.map((d, i) => {
        const state = d.isToday ? "today" : d.active ? "done" : "empty";
        return (
          <div key={i} className="flex-1 text-center">
            <div
              className={`h-[35px] rounded-[10px] flex items-end justify-center pb-[5px] ${
                state === "today" ? "bg-accent" : state === "done" ? "bg-accent-soft" : "bg-sunken"
              }`}
            >
              {state !== "empty" && (
                <span
                  className={`w-[5px] h-[5px] rounded-full block ${
                    state === "today" ? "bg-accent-ink" : "bg-accent"
                  }`}
                />
              )}
            </div>
            <div
              className={`text-[9.5px] mt-[5px] ${
                state === "today" ? "text-accent font-extrabold" : "text-muted font-medium"
              }`}
            >
              {letters[i]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-[15.5px] font-extrabold tabular-nums text-main">{value}</div>
      <div className="text-[9.5px] mt-0.5 truncate text-muted">{label}</div>
    </div>
  );
}

function Tile({ icon: Icon, title, sub, onClick, locked }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl bg-surface border border-line p-[15px] text-left active:scale-[0.98] transition-transform relative"
    >
      {locked && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center bg-warning/15">
          <Lock size={11} className="text-warning" />
        </span>
      )}
      <Icon size={18} className={locked ? "text-soft" : "text-accent"} />
      <div className="text-[12.5px] font-bold mt-2.5 text-main">{title}</div>
      <div className="text-[10px] mt-0.5 text-muted">{sub}</div>
    </button>
  );
}

function clampPct(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(Math.round(n), 0), 100);
}

/** 1240 -> "1 240" — uzun raqamlar kafelga sig'ishi uchun */
function formatCount(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return n.toLocaleString("ru-RU").replace(/ /g, " ");
}

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, Clock, Percent, Target, EyeOff } from "lucide-react";
import { api } from "../../api";
import { formatDuration } from "../../components/exam/ExamTimer";
import { QuizShell, QuizHeader } from "../../components/exam/QuizUI";
import { QUIZ } from "../../quizTheme";

// Davrlar — backend PERIODS bilan mos. Haftalik backend'da allaqachon bor,
// kerak bo'lganda shu ro'yxatga qo'shiladi (boshqa o'zgarish shart emas).
const PERIODS = ["all_time", "this_month"];
const SORTS = [
  { key: "score", icon: Target },
  { key: "speed", icon: Clock },
  { key: "accuracy", icon: Percent },
];

const MEDALS = ["🥇", "🥈", "🥉"];

function Row({ entry, sort }) {
  const { t } = useTranslation();
  const medal = entry.rank <= 3 ? MEDALS[entry.rank - 1] : null;

  const primary =
    sort === "speed"
      ? formatDuration(entry.durationSec)
      : sort === "accuracy"
      ? `${entry.accuracyPct}%`
      : `${entry.correctCount}/20`;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
      style={
        entry.isCurrentUser
          ? { borderColor: "rgba(244,247,250,0.3)", background: "#1B222B" }
          : { borderColor: QUIZ.border, background: QUIZ.cardSoft }
      }
    >
      <span className="w-7 text-center font-extrabold text-sm shrink-0">{medal || entry.rank}</span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {entry.displayName}
          {entry.isCurrentUser && (
            <span className="ml-1.5 text-[10px] font-bold" style={{ color: QUIZ.muted }}>
              {t("officialExam.you")}
            </span>
          )}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "#6B7A8A" }}>
          {sort !== "score" && `${entry.correctCount}/20 · `}
          {sort !== "accuracy" && `${entry.accuracyPct}% · `}
          {sort !== "speed" && formatDuration(entry.durationSec)}
        </p>
      </div>

      <span className="font-extrabold text-sm shrink-0 tabular-nums">{primary}</span>
    </div>
  );
}

/** Rasmiy imtihon reytingi. Faqat o'tgan imtihonlar qatnashadi. */
export default function LeaderboardScreen({ onBack, onOpenSettings }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("all_time");
  const [sort, setSort] = useState("score");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api.examLeaderboard(period, sort));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [period, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const entries = data?.entries || [];

  return (
    <QuizShell>
      <QuizHeader
        title={t("officialExam.leaderboardTitle")}
        onBack={onBack}
        right={<Trophy size={18} color={QUIZ.warning} />}
      />

      {/* Davr */}
      <div className="flex gap-2 mb-3">
        {PERIODS.map((p) => {
          const active = period === p;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-1 rounded-xl py-2 text-xs font-bold transition-colors border"
              style={
                active
                  ? { background: QUIZ.text, color: QUIZ.bg, borderColor: QUIZ.text }
                  : { background: QUIZ.card, color: QUIZ.muted, borderColor: QUIZ.border }
              }
            >
              {t(`officialExam.period.${p}`)}
            </button>
          );
        })}
      </div>

      {/* Tartiblash */}
      <div className="flex gap-2 mb-5">
        {SORTS.map(({ key, icon: Icon }) => {
          const active = sort === key;
          return (
            <button
              key={key}
              onClick={() => setSort(key)}
              className="flex-1 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border"
              style={
                active
                  ? { background: "#1B222B", color: QUIZ.text, borderColor: "rgba(244,247,250,0.25)" }
                  : { background: QUIZ.cardSoft, color: "#6B7A8A", borderColor: QUIZ.border }
              }
            >
              <Icon size={12} />
              {t(`officialExam.sort.${key}`)}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: QUIZ.border, borderTopColor: QUIZ.text }} />
        </div>
      )}

      {error && (
        <p className="text-sm text-center py-6" style={{ color: QUIZ.danger }}>
          {error}
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-sm text-center py-12 px-6 leading-relaxed" style={{ color: "#6B7A8A" }}>
          {t("officialExam.emptyLeaderboard")}
        </p>
      )}

      <div className="space-y-2">
        {entries.map((entry) => (
          <Row key={`${entry.rank}-${entry.displayName}`} entry={entry} sort={sort} />
        ))}
      </div>

      {/* Ro'yxatga kirmagan foydalanuvchi o'z o'rnini ko'radi */}
      {data?.currentUser && (
        <>
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px" style={{ background: QUIZ.border }} />
            <span className="text-[10px]" style={{ color: "#4B5768" }}>
              ···
            </span>
            <div className="flex-1 h-px" style={{ background: QUIZ.border }} />
          </div>
          <Row entry={data.currentUser} sort={sort} />
        </>
      )}

      <div className="mt-6 rounded-2xl border px-4 py-3 flex items-start gap-2" style={{ background: QUIZ.cardSoft, borderColor: QUIZ.border }}>
        <EyeOff size={14} color={QUIZ.muted} className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs leading-relaxed" style={{ color: QUIZ.muted }}>
            {t("officialExam.privacyNotice")}
          </p>
          {onOpenSettings && (
            <button onClick={onOpenSettings} className="text-xs font-semibold underline mt-1.5" style={{ color: "#D1D5DB" }}>
              {t("officialExam.openSettings")}
            </button>
          )}
        </div>
      </div>
    </QuizShell>
  );
}

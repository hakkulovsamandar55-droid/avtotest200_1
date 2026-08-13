import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ClipboardCheck,
  Clock,
  Target,
  Ban,
  Save,
  Crown,
  History,
  Trophy,
} from "lucide-react";
import { api } from "../../api";
import { QuizShell, QuizHeader, QuizButton } from "../../components/exam/QuizUI";
import { QUIZ } from "../../quizTheme";

function RuleRow({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: QUIZ.cardSoft }}>
        <Icon size={15} color={QUIZ.muted} />
      </div>
      <p className="text-sm leading-snug pt-1.5" style={{ color: "#D1D5DB" }}>
        {text}
      </p>
    </div>
  );
}

/**
 * Rasmiy imtihon boshlanishidan oldingi ekran.
 *
 * Uch holatni boshqaradi:
 *  1) Tugallanmagan imtihon bor -> "Davom etish" / "Bekor qilish"
 *  2) Imtihon boshlash mumkin -> qoidalar + "Boshlash"
 *  3) Kunlik limit tugagan -> Premium taklifi
 */
export default function OfficialExamIntro({
  onBack,
  onExamReady,
  onOpenHistory,
  onOpenLeaderboard,
  onOpenPremium,
}) {
  const { t } = useTranslation();
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEligibility(await api.examEligibility());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    setError("");
    try {
      const { exam } = await api.examStart();
      onExamReady(exam);
    } catch (err) {
      // 402 = kunlik limit tugagan; eligibility'ni yangilaymiz
      if (err.code === "daily_limit_reached") {
        await load();
      }
      setError(err.message);
      setStarting(false);
    }
  }

  async function handleAbandon() {
    if (!eligibility?.activeExamId) return;
    setStarting(true);
    try {
      await api.examAbandon(eligibility.activeExamId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  const canStart = eligibility?.canStart;
  const hasActive = eligibility?.hasActiveExam;
  const limitReached = eligibility && !eligibility.isPremium && eligibility.remaining === 0 && !hasActive;

  return (
    <QuizShell>
      <QuizHeader title={t("officialExam.title")} onBack={onBack} />

      <div className="flex flex-col items-center text-center mb-7 mt-2">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: QUIZ.accent }}>
          <ClipboardCheck size={34} color={QUIZ.accentInk} />
        </div>
        <p className="text-sm leading-relaxed px-4" style={{ color: QUIZ.muted }}>
          {t("officialExam.introSubtitle")}
        </p>
      </div>

      <div className="rounded-3xl border p-5 space-y-4 mb-6" style={{ background: QUIZ.cardSoft, borderColor: QUIZ.border }}>
        <RuleRow icon={ClipboardCheck} text={t("officialExam.rule.questions")} />
        <RuleRow icon={Clock} text={t("officialExam.rule.duration")} />
        <RuleRow icon={Target} text={t("officialExam.rule.passing")} />
        <RuleRow icon={Ban} text={t("officialExam.rule.noPause")} />
        <RuleRow icon={Save} text={t("officialExam.rule.autoSave")} />
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <span
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: QUIZ.border, borderTopColor: QUIZ.text }}
          />
        </div>
      )}

      {!loading && eligibility && !eligibility.isPremium && !hasActive && (
        <div className="rounded-2xl border px-4 py-3 mb-4 text-center" style={{ background: QUIZ.card, borderColor: QUIZ.border }}>
          <p className="text-xs" style={{ color: QUIZ.muted }}>
            {t("officialExam.dailyLimitInfo", { used: eligibility.usedToday, limit: eligibility.dailyLimit })}
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-center mb-4 leading-relaxed" style={{ color: QUIZ.danger }}>
          {error}
        </p>
      )}

      {/* 1-holat: tugallanmagan imtihon */}
      {!loading && hasActive && (
        <div className="space-y-3 mb-4">
          <div className="rounded-2xl border px-4 py-3" style={{ background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.3)" }}>
            <p className="text-xs leading-relaxed" style={{ color: QUIZ.warning }}>
              {t("officialExam.resumeNotice")}
            </p>
          </div>
          <QuizButton onClick={handleStart} disabled={starting}>
            {t("officialExam.continueExam")}
          </QuizButton>
          <QuizButton variant="secondary" onClick={handleAbandon} disabled={starting}>
            {t("officialExam.cancelExam")}
          </QuizButton>
        </div>
      )}

      {/* 2-holat: boshlash mumkin */}
      {!loading && !hasActive && canStart && (
        <div className="mb-4">
          <QuizButton onClick={handleStart} disabled={starting} className="py-4 text-base">
            {starting ? t("officialExam.starting") : t("officialExam.startExam")}
          </QuizButton>
        </div>
      )}

      {/* 3-holat: limit tugagan */}
      {!loading && limitReached && (
        <div
          className="rounded-3xl p-5 mb-4 text-center border"
          style={{ background: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.3)" }}
        >
          <Crown size={28} color={QUIZ.warning} className="mx-auto mb-3" />
          <p className="font-bold text-sm mb-1">{t("officialExam.limitTitle")}</p>
          <p className="text-xs leading-relaxed mb-4" style={{ color: QUIZ.muted }}>
            {t("officialExam.limitBody")}
          </p>
          <button
            onClick={onOpenPremium}
            className="w-full rounded-2xl py-3 font-bold text-sm"
            style={{ background: QUIZ.warning, color: QUIZ.accentInk }}
          >
            {t("officialExam.seePremium")}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenHistory}
          className="rounded-2xl border py-3 flex flex-col items-center gap-1.5 active:scale-[0.98] transition-transform"
          style={{ borderColor: QUIZ.border, background: QUIZ.cardSoft }}
        >
          <History size={17} color={QUIZ.muted} />
          <span className="text-xs font-semibold" style={{ color: "#D1D5DB" }}>
            {t("officialExam.history")}
          </span>
        </button>
        <button
          onClick={onOpenLeaderboard}
          className="rounded-2xl border py-3 flex flex-col items-center gap-1.5 active:scale-[0.98] transition-transform"
          style={{ borderColor: QUIZ.border, background: QUIZ.cardSoft }}
        >
          <Trophy size={17} color={QUIZ.warning} />
          <span className="text-xs font-semibold" style={{ color: "#D1D5DB" }}>
            {t("officialExam.leaderboard")}
          </span>
        </button>
      </div>
    </QuizShell>
  );
}

import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, Clock, Target, Percent, Eye, RotateCcw, Home, EyeOff } from "../../icons";
import { formatDuration } from "../../components/exam/ExamTimer";
import { QuizShell, QuizButton, ResultRing } from "../../components/exam/QuizUI";
import { QUIZ } from "../../quizTheme";

function StatBox({ icon: Icon, value, label }) {
  return (
    <div className="rounded-2xl border px-3 py-3 text-center" style={{ background: QUIZ.cardSoft, borderColor: QUIZ.border }}>
      <Icon size={15} color={QUIZ.muted} className="mx-auto mb-1.5" />
      <p className="font-extrabold text-sm">{value}</p>
      <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "#6B7A8A" }}>
        {label}
      </p>
    </div>
  );
}

/** Rasmiy imtihon natijasi. Baholash serverda bo'lgan, bu faqat ko'rsatadi. */
export default function OfficialExamResult({ result, autoSubmitted, onReview, onRetry, onExit }) {
  const { t } = useTranslation();
  const passed = result.passed;
  const color = passed ? QUIZ.success : QUIZ.danger;
  const scorePct = result.totalQuestions ? (result.correctCount / result.totalQuestions) * 100 : 0;

  return (
    <QuizShell className="flex flex-col">
      <h1 className="text-lg font-extrabold mb-6">{t("officialExam.resultTitle")}</h1>

      {autoSubmitted && (
        <div className="rounded-2xl border px-4 py-3 mb-5" style={{ background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-xs leading-relaxed" style={{ color: QUIZ.warning }}>
            {t("officialExam.autoSubmittedNotice")}
          </p>
        </div>
      )}

      <div className="flex flex-col items-center">
        <ResultRing pct={scorePct} color={color}>
          <span className="text-3xl font-extrabold">
            {result.correctCount}
            <span className="text-lg" style={{ color: QUIZ.muted }}>
              /{result.totalQuestions}
            </span>
          </span>
          <span className="text-[11px] mt-1" style={{ color: QUIZ.muted }}>
            {t("officialExam.needed", { score: result.passingScore })}
          </span>
        </ResultRing>

        <div className="flex items-center gap-2 mt-5">
          {passed ? <CheckCircle2 size={22} color={color} /> : <XCircle size={22} color={color} />}
          <h2 className="text-2xl font-extrabold" style={{ color }}>
            {passed ? t("officialExam.passed") : t("officialExam.failed")}
          </h2>
        </div>
        <p className="text-sm text-center mt-2 px-6 leading-relaxed" style={{ color: QUIZ.muted }}>
          {passed ? t("officialExam.passedSubtitle") : t("officialExam.failedSubtitle", { score: result.passingScore })}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-7">
        <StatBox icon={Target} value={result.correctCount} label={t("officialExam.correct")} />
        <StatBox icon={XCircle} value={result.wrongCount} label={t("officialExam.wrong")} />
        <StatBox icon={Percent} value={`${result.accuracyPct}%`} label={t("officialExam.accuracy")} />
        <StatBox icon={Clock} value={formatDuration(result.durationSec)} label={t("officialExam.timeUsed")} />
      </div>

      {result.focusLostCount > 0 && (
        <div className="mt-4 rounded-2xl border px-4 py-3 flex items-start gap-2" style={{ background: QUIZ.cardSoft, borderColor: QUIZ.border }}>
          <EyeOff size={14} color={QUIZ.muted} className="mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed" style={{ color: QUIZ.muted }}>
            {t("officialExam.focusLostNotice", { count: result.focusLostCount })}
          </p>
        </div>
      )}

      <div className="space-y-3 mt-7">
        <QuizButton variant="secondary" onClick={onReview}>
          <Eye size={16} />
          {t("officialExam.reviewAnswers")}
        </QuizButton>
        <QuizButton onClick={onRetry}>
          <RotateCcw size={16} />
          {t("officialExam.tryAgain")}
        </QuizButton>
        <QuizButton variant="ghost" onClick={onExit}>
          <Home size={15} />
          {t("officialExam.backHome")}
        </QuizButton>
      </div>
    </QuizShell>
  );
}

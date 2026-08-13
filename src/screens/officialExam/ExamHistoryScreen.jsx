import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, Clock, Percent } from "lucide-react";
import { api } from "../../api";
import { formatDuration } from "../../components/exam/ExamTimer";
import { QuizShell, QuizHeader } from "../../components/exam/QuizUI";
import { QUIZ } from "../../quizTheme";

const PAGE_SIZE = 20;

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Foydalanuvchining rasmiy imtihon tarixi. */
export default function ExamHistoryScreen({ onBack, onOpenReview }) {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (offset = 0) => {
    try {
      const res = await api.examHistory({ limit: PAGE_SIZE, offset });
      setTotal(res.total);
      setExams((prev) => (offset === 0 ? res.exams : [...prev, ...res.exams]));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load(0).finally(() => setLoading(false));
  }, [load]);

  async function loadMore() {
    setLoadingMore(true);
    await load(exams.length);
    setLoadingMore(false);
  }

  return (
    <QuizShell>
      <QuizHeader
        title={t("officialExam.historyTitle")}
        subtitle={total > 0 ? t("officialExam.historyCount", { count: total }) : undefined}
        onBack={onBack}
      />

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

      {!loading && !error && exams.length === 0 && (
        <p className="text-sm text-center py-12 leading-relaxed px-6" style={{ color: "#6B7A8A" }}>
          {t("officialExam.noHistory")}
        </p>
      )}

      <div className="space-y-3">
        {exams.map((exam) => (
          <button
            key={exam.id}
            onClick={() => onOpenReview(exam.id)}
            className="w-full text-left rounded-2xl border p-4 active:scale-[0.99] transition-transform"
            style={
              exam.passed
                ? { borderColor: "rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.04)" }
                : { borderColor: "rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.04)" }
            }
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {exam.passed ? <CheckCircle2 size={16} color={QUIZ.success} /> : <XCircle size={16} color={QUIZ.danger} />}
                <span className="font-extrabold text-sm" style={{ color: exam.passed ? QUIZ.success : QUIZ.danger }}>
                  {exam.passed ? t("officialExam.passed") : t("officialExam.failed")}
                </span>
              </div>
              <span className="font-extrabold text-sm">
                {exam.correctCount}
                <span className="text-xs" style={{ color: QUIZ.muted }}>
                  /{exam.totalQuestions}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs" style={{ color: QUIZ.muted }}>
              <span className="flex items-center gap-1">
                <Percent size={12} /> {exam.accuracyPct}%
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {formatDuration(exam.durationSec)}
              </span>
              <span className="ml-auto text-[11px]">{formatDate(exam.finishedAt)}</span>
            </div>
          </button>
        ))}
      </div>

      {exams.length < total && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full mt-4 rounded-2xl py-3 font-semibold text-sm border disabled:opacity-50"
          style={{ background: QUIZ.cardSoft, borderColor: QUIZ.border, color: "#D1D5DB" }}
        >
          {loadingMore ? t("officialExam.loading") : t("officialExam.loadMore")}
        </button>
      )}
    </QuizShell>
  );
}

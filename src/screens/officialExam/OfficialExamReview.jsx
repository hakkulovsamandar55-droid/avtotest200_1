import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, MinusCircle } from "lucide-react";
import { api } from "../../api";
import QuestionCard from "../../components/exam/QuestionCard";
import { QuizShell, QuizHeader } from "../../components/exam/QuizUI";
import { QUIZ } from "../../quizTheme";

const FILTERS = ["all", "wrong", "skipped"];

/**
 * Imtihon yakunlangandan keyingi tahlil.
 *
 * Bu yerda to'g'ri javoblar ko'rsatiladi — imtihon allaqachon baholangani
 * uchun xavf yo'q (server review'ni faqat yakunlangan imtihon uchun beradi).
 */
export default function OfficialExamReview({ examId, onBack }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    api
      .examReview(examId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [examId]);

  const questions = data?.questions || [];
  const visible = questions.filter((q) => {
    if (filter === "wrong") return !q.isCorrect && !q.isSkipped;
    if (filter === "skipped") return q.isSkipped;
    return true;
  });

  const counts = {
    all: questions.length,
    wrong: questions.filter((q) => !q.isCorrect && !q.isSkipped).length,
    skipped: questions.filter((q) => q.isSkipped).length,
  };

  return (
    <QuizShell>
      <QuizHeader title={t("officialExam.reviewTitle")} onBack={onBack} />

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

      {!loading && !error && (
        <>
          <div className="flex gap-2 mb-5">
            {FILTERS.map((key) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="flex-1 rounded-xl py-2 text-xs font-bold transition-colors border"
                  style={
                    active
                      ? { background: QUIZ.text, color: QUIZ.bg, borderColor: QUIZ.text }
                      : { background: QUIZ.card, color: QUIZ.muted, borderColor: QUIZ.border }
                  }
                >
                  {t(`officialExam.filter.${key}`)} ({counts[key]})
                </button>
              );
            })}
          </div>

          {visible.length === 0 && (
            <p className="text-sm text-center py-10" style={{ color: "#6B7A8A" }}>
              {t("officialExam.noQuestionsInFilter")}
            </p>
          )}

          <div className="space-y-6">
            {visible.map((q) => (
              <div
                key={q.id}
                className="rounded-3xl border p-4"
                style={
                  q.isSkipped
                    ? { borderColor: QUIZ.border, background: QUIZ.cardSoft }
                    : q.isCorrect
                    ? { borderColor: "rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.04)" }
                    : { borderColor: "rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.04)" }
                }
              >
                <div className="flex items-center gap-2 mb-4">
                  {q.isSkipped ? (
                    <MinusCircle size={15} color={QUIZ.muted} />
                  ) : q.isCorrect ? (
                    <Check size={15} color={QUIZ.success} />
                  ) : (
                    <X size={15} color={QUIZ.danger} />
                  )}
                  <span className="text-xs font-bold" style={{ color: QUIZ.muted }}>
                    {t("officialExam.questionNumber", { number: q.index + 1 })}
                  </span>
                </div>

                <QuestionCard
                  question={q}
                  mode="review"
                  chosenIndex={q.chosenIndex}
                  explanationLabel={t("officialExam.explanation")}
                  skippedLabel={t("officialExam.skippedNotice")}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </QuizShell>
  );
}

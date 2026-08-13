import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, AlertTriangle, Send } from "../../icons";
import { api } from "../../api";
import QuestionCard from "../../components/exam/QuestionCard";
import QuestionNavigator from "../../components/exam/QuestionNavigator";
import ExamTimer from "../../components/exam/ExamTimer";
import { QuizShell, QuizHeader, QuizProgress, QuizButton } from "../../components/exam/QuizUI";
import { QUIZ } from "../../quizTheme";

/**
 * Rasmiy imtihon — asosiy ekran.
 *
 * Farqlari (mashq imtihonidan):
 *  - to'g'ri javob KO'RSATILMAYDI (server ham yubormaydi)
 *  - savollar orasida erkin harakat, o'tkazib yuborish mumkin
 *  - har bir javob DARHOL serverga saqlanadi (ilova yopilsa yo'qolmaydi)
 *  - vaqt tugaganda avtomatik yuboriladi
 */
export default function OfficialExamScreen({ exam, onFinished, onExit }) {
  const { t } = useTranslation();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(exam.answers || {});
  const [secondsLeft, setSecondsLeft] = useState(exam.secondsLeft);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState(null);

  const submittedRef = useRef(false);
  const questions = exam.questions;
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;

  const submit = useCallback(
    async ({ auto = false } = {}) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        const { result } = await api.examSubmit(exam.id);
        onFinished(result, { auto });
      } catch (err) {
        // Vaqt tugagan bo'lsa server allaqachon yopgan bo'lishi mumkin —
        // bu holatda ham natija ekraniga o'tamiz.
        if (err.code === "expired" || err.code === "not_active") {
          try {
            const { result } = await api.examSubmit(exam.id);
            onFinished(result, { auto: true });
            return;
          } catch {
            /* pastdagi xato ko'rsatiladi */
          }
        }
        submittedRef.current = false;
        setSubmitting(false);
        setError(err.message);
      }
    },
    [exam.id, onFinished]
  );

  // --- Anti-cheat: ilovadan chiqib ketishni qayd qilish ---
  //
  // ESLATMA: bu ISHONCHLI himoya emas. Foydalanuvchi tarmoq so'rovini
  // to'sib qo'yishi mumkin. Bu faqat adminlar uchun ko'rsatkich va shu
  // tarzda hujjatlashtirilgan.
  useEffect(() => {
    function handleHidden() {
      if (document.visibilityState === "hidden" && !submittedRef.current) {
        api.examFocusLost(exam.id).catch(() => {
          // Qayd etilmasa ham imtihon davom etadi — bu asosiy oqim emas
        });
      }
    }
    document.addEventListener("visibilitychange", handleHidden);
    return () => document.removeEventListener("visibilitychange", handleHidden);
  }, [exam.id]);

  // Javobni saqlash — darhol serverga
  async function choose(optionIndex) {
    if (submitting || submittedRef.current) return;

    const key = String(index);
    const previous = answers[key];
    // Xuddi shu variant qayta bosilsa — javobni bekor qiladi
    const next = previous === optionIndex ? null : optionIndex;

    // Optimistik yangilash: interfeys darhol javob beradi
    setAnswers((prev) => {
      const copy = { ...prev };
      if (next === null) delete copy[key];
      else copy[key] = next;
      return copy;
    });
    setError("");

    try {
      const res = await api.examAnswer(exam.id, index, next);
      if (typeof res.secondsLeft === "number") setSecondsLeft(res.secondsLeft);
    } catch (err) {
      // Saqlanmadi — optimistik o'zgarishni qaytaramiz, aks holda
      // foydalanuvchi javobi saqlangan deb o'ylab qoladi.
      setAnswers((prev) => {
        const copy = { ...prev };
        if (previous === undefined) delete copy[key];
        else copy[key] = previous;
        return copy;
      });

      if (err.code === "expired") {
        submit({ auto: true });
        return;
      }
      setError(t("officialExam.answerNotSaved"));
    }
  }

  function handleWarning(level) {
    setWarning(level);
    // Ogohlantirish 6 soniyadan keyin yo'qoladi
    setTimeout(() => setWarning(null), 6000);
  }

  const question = questions[index];
  const chosen = answers[String(index)];
  const isLast = index === total - 1;

  const warningStyle = {
    danger: { background: QUIZ.dangerSoft, borderColor: "rgba(248,113,113,0.3)" },
    warning: { background: "rgba(251,191,36,0.15)", borderColor: "rgba(251,191,36,0.3)" },
    info: { background: "rgba(56,189,248,0.15)", borderColor: "rgba(56,189,248,0.3)" },
  }[warning];

  return (
    <QuizShell>
      <QuizHeader
        title={t("officialExam.title")}
        subtitle={t("officialExam.questionOf", { current: index + 1, total })}
        onBack={() => setShowConfirm("exit")}
        right={
          <ExamTimer serverSecondsLeft={secondsLeft} onExpire={() => submit({ auto: true })} onWarning={handleWarning} />
        }
      />

      {warning && (
        <div className="rounded-2xl px-4 py-2.5 mb-4 flex items-center gap-2 border" style={warningStyle}>
          <AlertTriangle size={14} color={warning === "danger" ? QUIZ.danger : QUIZ.warning} />
          <p className="text-xs font-semibold">{t(`officialExam.warning.${warning}`)}</p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <QuizProgress pct={(answeredCount / total) * 100} />
        </div>
        <button
          onClick={() => setShowNavigator((v) => !v)}
          className="text-xs font-semibold shrink-0 underline decoration-dotted"
          style={{ color: "#D1D5DB" }}
        >
          {t("officialExam.answeredOf", { answered: answeredCount, total })}
        </button>
      </div>

      {showNavigator && (
        <div className="mb-5 rounded-2xl border p-3" style={{ background: QUIZ.cardSoft, borderColor: QUIZ.border }}>
          <QuestionNavigator
            total={total}
            currentIndex={index}
            answers={answers}
            onSelect={(i) => {
              setIndex(i);
              setShowNavigator(false);
            }}
          />
        </div>
      )}

      <QuestionCard question={question} mode="answering" chosenIndex={chosen ?? null} onChoose={choose} />

      {error && (
        <p className="text-xs text-center mt-4" style={{ color: QUIZ.danger }}>
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="w-12 h-12 rounded-2xl border flex items-center justify-center disabled:opacity-30 shrink-0"
          style={{ borderColor: QUIZ.border, background: QUIZ.card }}
          aria-label={t("officialExam.previous")}
        >
          <ChevronLeft size={20} color={QUIZ.text} />
        </button>

        {isLast ? (
          <QuizButton onClick={() => setShowConfirm("submit")} disabled={submitting} className="flex-1">
            <Send size={16} />
            {t("officialExam.finish")}
          </QuizButton>
        ) : (
          <QuizButton variant="secondary" onClick={() => setIndex((i) => Math.min(total - 1, i + 1))} className="flex-1">
            {chosen === undefined ? t("officialExam.skip") : t("officialExam.next")}
          </QuizButton>
        )}

        <button
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={isLast}
          className="w-12 h-12 rounded-2xl border flex items-center justify-center disabled:opacity-30 shrink-0"
          style={{ borderColor: QUIZ.border, background: QUIZ.card }}
          aria-label={t("officialExam.next")}
        >
          <ChevronRight size={20} color={QUIZ.text} />
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-5 pb-8">
          <div className="w-full max-w-sm rounded-3xl border p-5" style={{ background: QUIZ.card, borderColor: QUIZ.border }}>
            <p className="font-bold text-base mb-2">
              {showConfirm === "submit" ? t("officialExam.confirmSubmitTitle") : t("officialExam.confirmExitTitle")}
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: QUIZ.muted }}>
              {showConfirm === "submit"
                ? t("officialExam.confirmSubmitBody", { unanswered: total - answeredCount })
                : t("officialExam.confirmExitBody")}
            </p>

            <div className="space-y-2.5">
              <QuizButton
                onClick={() => {
                  setShowConfirm(false);
                  if (showConfirm === "submit") submit();
                  else onExit();
                }}
                disabled={submitting}
              >
                {showConfirm === "submit" ? t("officialExam.confirmSubmitYes") : t("officialExam.confirmExitYes")}
              </QuizButton>
              <QuizButton variant="secondary" onClick={() => setShowConfirm(false)}>
                {t("officialExam.back")}
              </QuizButton>
            </div>
          </div>
        </div>
      )}
    </QuizShell>
  );
}

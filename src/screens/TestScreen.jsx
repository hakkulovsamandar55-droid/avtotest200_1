import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, RotateCcw, Bookmark, BookmarkCheck } from "lucide-react";
import { getTicketQuestions } from "../../shared/data/ticketsData";
import { api } from "../api";
import SignIcon from "../components/SignIcon";
import TicketQuestionImage from "../components/TicketQuestionImage";
import { QuizShell, QuizHeader, QuizIconButton, QuizProgress, OptionButton, QuizButton, ResultRing } from "../components/exam/QuizUI";
import { QUIZ } from "../quizTheme";

/**
 * Test ekrani — savol-javob oqimi, darhol fikr-mulohaza, yakuniy natija.
 *
 * QAYTA ISHLATILADI: bilet testi (ticketNumber) VA mavzuli test
 * (customQuestions). Ikkinchisi uchun alohida ekran yozish kodni
 * takrorlash bo'lardi — oqim aynan bir xil.
 *
 * @param {number} [ticketNumber] bilet raqami
 * @param {object[]} [customQuestions] tayyor savollar (mavzuli test uchun)
 * @param {string} [customTitle] sarlavha (mavzu nomi)
 */
export default function TestScreen({ ticketNumber, customQuestions, customTitle, onExit }) {
  const { t, i18n } = useTranslation();
  const questions = useMemo(
    () => (customQuestions?.length ? customQuestions : getTicketQuestions(ticketNumber, i18n.language)),
    [customQuestions, ticketNumber, i18n.language]
  );

  // Test boshlanish vaqti — sarflangan vaqtni hisoblash uchun.
  // useRef: qayta render'da qiymat o'zgarmasligi kerak.
  const startedAtRef = useRef(Date.now());

  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    api
      .getSavedQuestions()
      .then((res) => setSavedIds(new Set((res.saved || []).map((x) => x.questionId))))
      .catch(() => {
        // Saqlanganlar yuklanmasa ham test ishlashda davom etadi —
        // nishonlar shunchaki bo'sh ko'rinadi.
      });
  }, []);

  const toggleSave = useCallback(
    async (questionId) => {
      if (!questionId || savingId) return;
      setSavingId(questionId);
      const wasSaved = savedIds.has(questionId);
      try {
        if (wasSaved) {
          await api.unsaveQuestion(questionId);
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(questionId);
            return next;
          });
        } else {
          await api.saveQuestion(questionId);
          setSavedIds((prev) => new Set(prev).add(questionId));
        }
      } catch {
        // Tarmoq xatosi — foydalanuvchini test o'rtasida to'xtatmaymiz
      } finally {
        setSavingId(null);
      }
    },
    [savedIds, savingId]
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]); // { qIndex, chosen, correct }
  const [finished, setFinished] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const total = questions.length;
  const question = questions[index];
  const isLast = index === total - 1;

  function handleChoose(optIdx) {
    if (selected !== null) return; // javob berilgan, o'zgartirib bo'lmaydi
    setSelected(optIdx);
  }

  function handleNext() {
    const record = {
      qIndex: index,
      chosen: selected,
      correct: question.correct,
      isCorrect: selected === question.correct,
    };
    const nextAnswers = [...answers, record];
    setAnswers(nextAnswers);

    // HAR SAVOLDAN KEYIN DARHOL yuboriladi (testning oxirigacha
    // KUTILMAYDI). Sabab: foydalanuvchi 1-savolda xato qilib, testni
    // tugatmasdan chiqib ketsa ("Orqaga" tugmasi), ilgari bu xato
    // umuman saqlanmasdi — "mening xatolarim" bo'limi bo'sh qolardi.
    // Endi xato qilingan zahoti serverga ketadi, test tugashini
    // kutmaydi.
    if (question?.id) {
      api.recordAnswers([{ questionId: question.id, isCorrect: record.isCorrect }]).catch(() => {
        // Xatolar statistikasi saqlanmasa ham test to'xtamaydi
      });
    }

    if (isLast) {
      setFinished(true);
      const correctCount = nextAnswers.filter((a) => a.isCorrect).length;
      const pct = Math.round((correctCount / total) * 100);

      // Mavzuli testda bilet raqami yo'q — umumiy urinish "PRACTICE" bo'ladi.
      api
        .recordAttempt({
          type: customQuestions?.length ? "EXAM" : "TICKET",
          ticketNumber: customQuestions?.length ? null : ticketNumber,
          correctCount,
          totalCount: total,
          passed: pct >= 70,
          // Sarflangan vaqt (soniya). Backend 2 soatdan oshganini
          // rad etadi — foydalanuvchi testni ochiq qoldirib ketgan
          // bo'lishi mumkin.
          durationSec: Math.round((Date.now() - startedAtRef.current) / 1000),
        })
        .catch(() => {
          // Statistika saqlanmasa ham, natija ekranda ko'rsatilishda davom etadi —
          // foydalanuvchi internetsiz yoki tizimga kirmagan bo'lishi mumkin.
        });
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }

  function handleRetry() {
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setReviewing(false);
  }

  if (finished && !reviewing) {
    return (
      <ResultsView
        ticketNumber={ticketNumber}
        answers={answers}
        total={total}
        onRetry={handleRetry}
        onReview={() => setReviewing(true)}
        onExit={onExit}
      />
    );
  }

  if (finished && reviewing) {
    return (
      <ReviewView
        ticketNumber={ticketNumber}
        answers={answers}
        questions={questions}
        onBack={() => setReviewing(false)}
      />
    );
  }

  const progressPct = ((index + (selected !== null ? 1 : 0)) / total) * 100;

  return (
    <QuizShell>
      <QuizHeader
        title={customTitle || t("test.ticketTitle", { num: ticketNumber })}
        subtitle={t("test.questionOf", { current: index + 1, total })}
        onBack={onExit}
        right={
          question?.id && (
            <QuizIconButton
              icon={savedIds.has(question.id) ? BookmarkCheck : Bookmark}
              onClick={() => toggleSave(question.id)}
              disabled={savingId === question.id}
              tone={savedIds.has(question.id) ? QUIZ.accent : QUIZ.muted}
              aria-label={savedIds.has(question.id) ? t("question.unsave") : t("question.save")}
            />
          )
        }
      />

      {/* Saqlanganda qisqa tasdiq — foydalanuvchi bosgani natija berdimi
          degan savolda qolmasligi kerak */}
      {question?.id && savedIds.has(question.id) && (
        <p className="text-[11px] mb-3 -mt-2" style={{ color: QUIZ.accent }}>
          {t("question.savedNotice")}
        </p>
      )}

      <div className="mb-6">
        <QuizProgress pct={progressPct} />
      </div>

      {question.image && (
        <div className="w-full flex justify-center mb-5">
          <div className="w-full max-w-[280px] rounded-3xl bg-white flex items-center justify-center shadow-lg p-2">
            {/* question.image IKKI XIL bo'lishi mumkin: yo'l belgisi kodi
                ("3.24", SignIcon uchun) yoki savol sahnasi rasmi (masalan
                "t1-1.webp", TicketQuestionImage uchun). Kengaytma bo'yicha
                ajratamiz — belgi kodlarida hech qachon ".webp" bo'lmaydi. */}
            {question.image.endsWith(".webp") ? (
              <TicketQuestionImage questionId={question.image.replace(".webp", "")} maxHeight={260} />
            ) : (
              <SignIcon code={question.image} size={104} />
            )}
          </div>
        </div>
      )}

      <h2 className="text-[17px] font-bold leading-snug mb-5">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((opt, i) => {
          const isChosen = selected === i;
          const isCorrectOpt = i === question.correct;
          let state = "idle";
          let icon = null;
          if (selected !== null) {
            if (isCorrectOpt) {
              state = "correct";
              icon = Check;
            } else if (isChosen) {
              state = "wrong";
              icon = X;
            } else {
              state = "dimmed";
            }
          }
          return (
            <OptionButton
              key={i}
              letter={String.fromCharCode(65 + i)}
              text={opt}
              state={state}
              icon={icon}
              onClick={() => handleChoose(i)}
              disabled={selected !== null}
            />
          );
        })}
      </div>

      <div className="mt-7">
        <QuizButton onClick={handleNext} disabled={selected === null}>
          {isLast ? t("test.finish") : t("test.next")}
        </QuizButton>
      </div>
    </QuizShell>
  );
}

function ResultsView({ ticketNumber, answers, total, onRetry, onReview, onExit }) {
  const { t } = useTranslation();
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const pct = Math.round((correctCount / total) * 100);

  let tier = "weak";
  if (pct >= 90) tier = "excellent";
  else if (pct >= 70) tier = "good";

  const ringColor = tier === "excellent" ? QUIZ.success : tier === "good" ? QUIZ.warning : QUIZ.danger;

  return (
    <QuizShell className="flex flex-col">
      <QuizHeader title={t("test.ticketTitle", { num: ticketNumber })} onBack={onExit} />

      <div className="flex-1 flex flex-col items-center justify-center">
        <ResultRing pct={pct} color={ringColor}>
          <span className="text-3xl font-extrabold">{pct}%</span>
          <span className="text-xs mt-1" style={{ color: QUIZ.muted }}>
            {t("test.correctAnswers", { correct: correctCount, total })}
          </span>
        </ResultRing>

        <h2 className="text-xl font-extrabold mt-6 text-center px-4">{t(`test.tier.${tier}`)}</h2>
      </div>

      <div className="space-y-3 mt-6">
        <QuizButton variant="secondary" onClick={onReview}>
          {t("test.reviewTitle")}
        </QuizButton>
        <QuizButton onClick={onRetry}>
          <RotateCcw size={16} />
          {t("test.retry")}
        </QuizButton>
        <QuizButton variant="ghost" onClick={onExit}>
          {t("test.backToTickets")}
        </QuizButton>
      </div>
    </QuizShell>
  );
}

function ReviewView({ ticketNumber, answers, questions, onBack }) {
  const { t } = useTranslation();

  return (
    <QuizShell>
      <QuizHeader title={t("test.reviewTitle")} onBack={onBack} />

      <div className="space-y-4">
        {answers.map((a) => {
          const q = questions[a.qIndex];
          return (
            <div
              key={q.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: a.isCorrect ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)",
                background: a.isCorrect ? QUIZ.successSoft : QUIZ.dangerSoft,
              }}
            >
              <div className="flex items-start gap-2 mb-3">
                {a.isCorrect ? (
                  <Check size={16} color={QUIZ.success} className="mt-0.5 shrink-0" />
                ) : (
                  <X size={16} color={QUIZ.danger} className="mt-0.5 shrink-0" />
                )}
                <p className="text-sm font-semibold leading-snug">{q.text}</p>
              </div>

              {q.image && (
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center mb-3">
                  {q.image.endsWith(".webp") ? (
                    <TicketQuestionImage questionId={q.image.replace(".webp", "")} maxHeight={80} />
                  ) : (
                    <SignIcon code={q.image} size={52} />
                  )}
                </div>
              )}

              <p className="text-xs mb-1" style={{ color: QUIZ.muted }}>
                {t("test.correctAnswer")}:{" "}
                <span className="font-medium" style={{ color: QUIZ.success }}>
                  {q.options[q.correct]}
                </span>
              </p>
              {!a.isCorrect && (
                <p className="text-xs" style={{ color: QUIZ.muted }}>
                  {t("test.yourAnswer")}:{" "}
                  <span className="font-medium" style={{ color: QUIZ.danger }}>
                    {q.options[a.chosen]}
                  </span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </QuizShell>
  );
}

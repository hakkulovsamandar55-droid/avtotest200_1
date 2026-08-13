import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, RotateCcw, Timer, AlertTriangle } from "../icons";
import { getRandomExamQuestions, EXAM_TIME_SECONDS, EXAM_MAX_MISTAKES } from "../data/ticketsData";
import { api } from "../api";
import SignIcon from "../components/SignIcon";
import TicketQuestionImage from "../components/TicketQuestionImage";
import { QuizShell, QuizHeader, QuizProgress, OptionButton, QuizButton, ResultRing } from "../components/exam/QuizUI";
import { QUIZ } from "../quizTheme";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Imtihon rejimi — barcha biletlardan tasodifiy 20 ta savol, 25 daqiqa vaqt,
// 2 marta xato qilinsa imtihon avtomatik yakunlanadi (yiqilish)
export default function ExamScreen({ onExit }) {
  const { t, i18n } = useTranslation();
  const [attempt, setAttempt] = useState(0);
  const questions = useMemo(() => getRandomExamQuestions(i18n.language), [attempt, i18n.language]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SECONDS);
  const [status, setStatus] = useState("playing"); // playing | passed | failed_mistakes | failed_timeout
  const [reviewing, setReviewing] = useState(false);
  const advanceTimer = useRef(null);

  const total = questions.length;
  const question = questions[index];

  // Vaqt hisoblagich
  useEffect(() => {
    if (status !== "playing") return;
    if (timeLeft <= 0) {
      setStatus("failed_timeout");
      return;
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, status]);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  // Imtihon tugaganda (o'tdi/yiqildi/vaqt tugadi) natijani bir marta serverga yuboradi
  useEffect(() => {
    if (status === "playing") return;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    api
      .recordAttempt({
        type: "EXAM",
        correctCount,
        totalCount: total,
        passed: status === "passed",
      })
      .catch(() => {
        // Statistika saqlanmasa ham natija ekranda ko'rsatiladi
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function commitAnswer(optIdx) {
    if (selected !== null || status !== "playing") return;
    setSelected(optIdx);

    const isCorrect = optIdx === question.correct;
    const record = { qIndex: index, chosen: optIdx, correct: question.correct, isCorrect };
    const newMistakes = isCorrect ? mistakes : mistakes + 1;

    // Har bir javob (to'g'ri yoki xato) darhol serverga ketadi — to'g'ri
    // javob avvalgi xatoni "hal qilingan" deb belgilaydi.
    if (question?.id) {
      api.recordAnswers([{ questionId: question.id, isCorrect }]).catch(() => {
        // Xatolar statistikasi saqlanmasa ham imtihon davom etadi
      });
    }

    advanceTimer.current = setTimeout(() => {
      setAnswers((prev) => [...prev, record]);
      if (!isCorrect) setMistakes(newMistakes);

      if (!isCorrect && newMistakes >= EXAM_MAX_MISTAKES) {
        setStatus("failed_mistakes");
      } else if (index + 1 >= total) {
        setStatus("passed");
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
      }
    }, 700);
  }

  function handleRetry() {
    clearTimeout(advanceTimer.current);
    setAttempt((a) => a + 1);
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setMistakes(0);
    setTimeLeft(EXAM_TIME_SECONDS);
    setStatus("playing");
    setReviewing(false);
  }

  if (status !== "playing" && !reviewing) {
    return (
      <ExamResults
        status={status}
        answers={answers}
        total={total}
        onRetry={handleRetry}
        onReview={() => setReviewing(true)}
        onExit={onExit}
      />
    );
  }

  if (status !== "playing" && reviewing) {
    return <ExamReview answers={answers} questions={questions} onBack={() => setReviewing(false)} />;
  }

  const isLowTime = timeLeft <= 120;

  return (
    <QuizShell>
      <QuizHeader
        title={t("exam.title")}
        subtitle={t("test.questionOf", { current: index + 1, total })}
        onBack={onExit}
        right={
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums"
            style={isLowTime ? { background: QUIZ.dangerSoft, color: QUIZ.danger } : { background: QUIZ.card, color: QUIZ.text }}
          >
            <Timer size={14} />
            {formatTime(timeLeft)}
          </div>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <QuizProgress pct={(index / total) * 100} />
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: QUIZ.danger }}>
          <AlertTriangle size={13} />
          {t("exam.mistakes", { count: mistakes, max: EXAM_MAX_MISTAKES })}
        </div>
      </div>

      {question.image && (
        <div className="w-full flex justify-center mb-5">
          <div className="w-full max-w-[280px] rounded-3xl bg-white flex items-center justify-center shadow-lg p-2">
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
              onClick={() => commitAnswer(i)}
              disabled={selected !== null}
            />
          );
        })}
      </div>
    </QuizShell>
  );
}

function ExamResults({ status, answers, total, onRetry, onReview, onExit }) {
  const { t } = useTranslation();
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const answeredCount = answers.length;

  const config = {
    passed: { color: QUIZ.success, titleKey: "exam.result.passedTitle", subtitleKey: "exam.result.passedSubtitle" },
    failed_mistakes: { color: QUIZ.danger, titleKey: "exam.result.failedTitle", subtitleKey: "exam.result.failedSubtitle" },
    failed_timeout: { color: QUIZ.warning, titleKey: "exam.result.timeoutTitle", subtitleKey: "exam.result.timeoutSubtitle" },
  }[status];

  return (
    <QuizShell className="flex flex-col">
      <QuizHeader title={t("exam.title")} onBack={onExit} />

      <div className="flex-1 flex flex-col items-center justify-center">
        <ResultRing pct={(correctCount / total) * 100} color={config.color}>
          <span className="text-2xl font-extrabold">
            {correctCount}/{total}
          </span>
          <span className="text-[11px] mt-1" style={{ color: QUIZ.muted }}>
            {t("exam.answeredCount", { count: answeredCount })}
          </span>
        </ResultRing>

        <h2 className="text-xl font-extrabold mt-6 text-center px-4" style={{ color: config.color }}>
          {t(config.titleKey)}
        </h2>
        <p className="text-sm text-center mt-2 px-6 leading-relaxed" style={{ color: QUIZ.muted }}>
          {t(config.subtitleKey)}
        </p>
      </div>

      <div className="space-y-3 mt-6">
        <QuizButton variant="secondary" onClick={onReview}>
          {t("test.reviewTitle")}
        </QuizButton>
        <QuizButton onClick={onRetry}>
          <RotateCcw size={16} />
          {t("exam.retry")}
        </QuizButton>
        <QuizButton variant="ghost" onClick={onExit}>
          {t("exam.backHome")}
        </QuizButton>
      </div>
    </QuizShell>
  );
}

function ExamReview({ answers, questions, onBack }) {
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

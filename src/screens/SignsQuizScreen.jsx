import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Check, X, RotateCcw, Trophy } from "lucide-react";
import { generateSignsQuiz } from "../../shared/data/signsQuiz";
import SignIcon from "../components/SignIcon";
import { api } from "../api";
import { ProgressBar, Button } from "../components/ui";

/**
 * YO'L BELGILARI TESTI.
 *
 * PEDAGOGIK QARORLAR:
 *
 * 1) DARHOL FIKR-MULOHAZA. Javob tanlangach natija shu zahoti ko'rsatiladi
 *    (to'g'ri yashil, xato qizil + to'g'risi belgilanadi). Sabab: belgilarni
 *    o'rganishda xatoni DARHOL bilish eng samarali — imtihon oxirida
 *    ko'rsatilsa, foydalanuvchi qaysi belgi ekanini eslamaydi.
 *    Bu rasmiy imtihondan farq qiladi (u yerda natija oxirida chiqadi,
 *    chunki maqsad — haqiqiy sharoitni takrorlash).
 *
 * 2) XATO QILINGANLAR ESLAB QOLINADI. Test oxirida "faqat xatolarni qayta
 *    ishlash" tugmasi chiqadi — bu takrorlash orqali o'rganish (spaced
 *    repetition) ning sodda ko'rinishi.
 *
 * 3) ORQAGA QAYTISH YO'Q. Javob berilgach o'zgartirib bo'lmaydi — aks holda
 *    foydalanuvchi to'g'ri javobni ko'rib, orqaga qaytib "to'g'rilaydi" va
 *    natija ma'nosini yo'qotadi.
 */
export default function SignsQuizScreen({ category = null, onBack }) {
  const { t } = useTranslation();

  const [seed, setSeed] = useState(0);
  const [focusCodes, setFocusCodes] = useState([]);

  // useMemo — savollar faqat seed o'zgarganda qayta yaratiladi.
  // Aks holda har render'da yangi savollar chiqib, javob berish imkonsiz bo'lardi.
  const questions = useMemo(
    () => generateSignsQuiz({ category, focusCodes }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, seed]
  );

  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [answers, setAnswers] = useState([]); // { code, correct }
  const [finished, setFinished] = useState(false);

  const q = questions[index];

  const handleChoose = useCallback(
    (optIndex) => {
      if (chosen !== null || !q) return; // ikkinchi marta bosishni to'sadi
      setChosen(optIndex);
      setAnswers((prev) => [...prev, { code: q.signCode, correct: optIndex === q.correctIndex }]);
    },
    [chosen, q]
  );

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      // Natijani serverga yuboramiz — agar o'qituvchi "belgilarni o'rgan"
      // vazifasini bergan bo'lsa, u avtomatik yopiladi.
      // Xato bo'lsa jim o'tkazamiz: test allaqachon tugagan, foydalanuvchiga
      // tarmoq xatosini ko'rsatish natijani ko'rishga xalaqit beradi.
      const correct = answers.filter((a) => a.correct).length;
      if (answers.length > 0) {
        api.submitSignsQuiz(correct, answers.length, category).catch(() => {});
      }
      return;
    }
    setIndex((i) => i + 1);
    setChosen(null);
  }, [index, questions.length, answers, category]);

  const restart = useCallback(
    (onlyWrong) => {
      const wrong = answers.filter((a) => !a.correct).map((a) => a.code);
      setFocusCodes(onlyWrong ? wrong : []);
      setAnswers([]);
      setIndex(0);
      setChosen(null);
      setFinished(false);
      setSeed((s) => s + 1);
    },
    [answers]
  );

  if (questions.length === 0) {
    return (
      <Shell onBack={onBack} title={t("signsQuiz.title")}>
        <p className="text-center text-sm py-16 text-muted">{t("signsQuiz.notEnoughSigns")}</p>
      </Shell>
    );
  }

  if (finished) {
    const correct = answers.filter((a) => a.correct).length;
    const total = answers.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const wrongCount = total - correct;

    return (
      <Shell onBack={onBack} title={t("signsQuiz.title")}>
        <div className="rounded-3xl bg-surface border border-line p-6 text-center mt-4">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-accent">
            <Trophy size={24} className="text-accent-ink" />
          </div>
          <p className="text-[34px] font-extrabold mt-4 tabular-nums text-main">{pct}%</p>
          <p className="text-sm mt-1 text-muted">{t("signsQuiz.resultLine", { correct, total })}</p>
          <p className="text-xs mt-3 leading-relaxed text-muted">
            {pct >= 90 ? t("signsQuiz.tierExcellent") : pct >= 70 ? t("signsQuiz.tierGood") : t("signsQuiz.tierWeak")}
          </p>
        </div>

        {wrongCount > 0 && (
          <Button onClick={() => restart(true)} size="lg" className="w-full mt-3">
            <RotateCcw size={16} />
            {t("signsQuiz.retryWrong", { count: wrongCount })}
          </Button>
        )}

        <Button variant="secondary" onClick={() => restart(false)} size="lg" className="w-full mt-2.5">
          {t("signsQuiz.newQuiz")}
        </Button>
      </Shell>
    );
  }

  const isAnswered = chosen !== null;
  const wasCorrect = isAnswered && chosen === q.correctIndex;

  return (
    <Shell onBack={onBack} title={t("signsQuiz.title")}>
      {/* Progress */}
      <div className="flex items-center gap-3 mt-1">
        <ProgressBar value={((index + (isAnswered ? 1 : 0)) / questions.length) * 100} className="flex-1 h-[5px]" />
        <span className="text-[11px] font-bold tabular-nums shrink-0 text-muted">
          {index + 1}/{questions.length}
        </span>
      </div>

      {/* Savol */}
      <div className="rounded-3xl bg-surface border border-line p-5 mt-4">
        {q.kind === "nameFromSign" ? (
          <>
            <div className="flex justify-center py-2">
              <SignIcon code={q.signCode} size={112} alt={t("signsQuiz.questionWhatIs")} />
            </div>
            <p className="text-center text-sm font-bold mt-3 text-main">{t("signsQuiz.questionWhatIs")}</p>
          </>
        ) : (
          <>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-center text-muted">
              {t("signsQuiz.questionWhichSign")}
            </p>
            <p className="text-center text-[15px] font-bold mt-2.5 leading-snug text-main">{q.prompt}</p>
          </>
        )}
      </div>

      {/* Variantlar */}
      <div className={q.kind === "signFromName" ? "grid grid-cols-2 gap-2.5 mt-3" : "mt-3 space-y-2.5"}>
        {q.options.map((opt, i) => (
          <Option
            key={opt.code}
            option={opt}
            kind={q.kind}
            state={!isAnswered ? "idle" : i === q.correctIndex ? "correct" : i === chosen ? "wrong" : "dim"}
            onClick={() => handleChoose(i)}
          />
        ))}
      </div>

      {/* Fikr-mulohaza + keyingi */}
      {isAnswered && (
        <div className="mt-4">
          {!wasCorrect && (
            <div className="rounded-2xl px-4 py-3 mb-3 flex items-start gap-2.5 bg-danger/10 border border-danger/30">
              <X size={15} className="shrink-0 mt-0.5 text-danger" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-danger">{t("signsQuiz.wrongAnswer")}</p>
                <p className="text-[11.5px] mt-1 leading-relaxed text-muted">
                  {q.options[q.correctIndex].name}
                  <span className="opacity-60"> · {q.options[q.correctIndex].code}</span>
                </p>
              </div>
            </div>
          )}

          <Button onClick={handleNext} size="lg" className="w-full">
            {index + 1 >= questions.length ? t("signsQuiz.finish") : t("signsQuiz.next")}
          </Button>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children, onBack, title }) {
  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-8 animate-slide-in">
      <div className="flex items-center gap-3 py-4">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center shrink-0">
          <ChevronLeft size={17} className="text-muted" />
        </button>
        <h1 className="text-lg font-extrabold text-main">{title}</h1>
      </div>
      {children}
    </div>
  );
}

function Option({ option, kind, state, onClick }) {
  const styles = {
    idle: "border-line bg-surface opacity-100",
    correct: "border-success/60 bg-success/[0.14] opacity-100",
    wrong: "border-danger/60 bg-danger/[0.14] opacity-100",
    dim: "border-line bg-surface opacity-45",
  }[state];

  const isSignOption = kind === "signFromName";

  return (
    <button
      onClick={onClick}
      disabled={state !== "idle"}
      className={`w-full text-left rounded-2xl border transition-all ${styles} ${
        isSignOption ? "p-3 flex flex-col items-center gap-2" : "px-4 py-3.5 flex items-center gap-3"
      }`}
    >
      {isSignOption ? (
        <>
          <SignIcon code={option.code} size={72} alt={option.name} />
          <span className="text-[10px] tabular-nums text-muted">{option.code}</span>
        </>
      ) : (
        <>
          <span className="flex-1 text-[12.5px] leading-snug text-main">{option.name}</span>
          {state === "correct" && <Check size={16} className="shrink-0 text-success" />}
          {state === "wrong" && <X size={16} className="shrink-0 text-danger" />}
        </>
      )}
    </button>
  );
}

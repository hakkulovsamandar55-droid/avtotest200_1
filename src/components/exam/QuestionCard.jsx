import React from "react";
import { Info, MinusCircle } from "lucide-react";
import QuestionImage from "../QuestionImage";
import { OptionButton } from "./QuizUI";
import { QUIZ } from "../../quizTheme";

/**
 * Savol kartasi — ikki rejimda ishlaydi:
 *
 *  mode="answering" — imtihon davomida. To'g'ri javob KO'RSATILMAYDI
 *    (server ham uni yubormaydi). Faqat foydalanuvchi nimani tanlagani
 *    belgilanadi.
 *
 *  mode="review" — imtihon yakunlangandan keyin. To'g'ri javob, foydalanuvchi
 *    javobi va izoh (agar bo'lsa) ko'rsatiladi.
 *
 * Bitta komponent ikkala holatda ishlatilgani uchun ko'rinish bir xil bo'ladi
 * va kod takrorlanmaydi.
 */
export default function QuestionCard({
  question,
  mode = "answering",
  chosenIndex = null,
  onChoose,
  explanationLabel,
  skippedLabel,
}) {
  const isReview = mode === "review";
  const correctIndex = isReview ? question.correctIndex : null;

  return (
    <div>
      <QuestionImage image={question.image} sceneMaxHeight={isReview ? 200 : 260} />

      <h2 className="text-[17px] font-bold leading-snug mb-5">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((opt, i) => {
          const isChosen = chosenIndex === i;
          const isCorrectOpt = isReview && i === correctIndex;

          let state = "idle";
          if (!isReview && isChosen) state = "chosen";
          if (isReview) {
            if (isCorrectOpt) state = "correct";
            else if (isChosen) state = "wrong";
            else state = "dimmed";
          }

          return (
            <OptionButton
              key={i}
              letter={String.fromCharCode(65 + i)}
              text={opt}
              state={state}
              onClick={() => !isReview && onChoose?.(i)}
              disabled={isReview}
            />
          );
        })}
      </div>

      {isReview && question.isSkipped && (
        <div
          className="mt-4 flex items-start gap-2 rounded-2xl border px-4 py-3"
          style={{ background: QUIZ.card, borderColor: QUIZ.border }}
        >
          <MinusCircle size={15} className="mt-0.5 shrink-0" color={QUIZ.muted} />
          <p className="text-xs leading-relaxed" style={{ color: QUIZ.muted }}>
            {skippedLabel}
          </p>
        </div>
      )}

      {/* Izoh ixtiyoriy — savol bazasida hozircha yo'q, bosqichma-bosqich
          qo'shiladi. Bo'lmasa bu blok umuman ko'rinmaydi. */}
      {isReview && question.explanation && (
        <div
          className="mt-4 flex items-start gap-2 rounded-2xl border px-4 py-3"
          style={{ background: "rgba(45,212,191,0.08)", borderColor: "rgba(45,212,191,0.25)" }}
        >
          <Info size={15} className="mt-0.5 shrink-0" color={QUIZ.accent} />
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wide mb-1"
              style={{ color: QUIZ.accent }}
            >
              {explanationLabel}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: QUIZ.muted }}>
              {question.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

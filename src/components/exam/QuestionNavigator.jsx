import React from "react";
import { QUIZ } from "../../quizTheme";

/**
 * Savollar bo'ylab navigatsiya paneli.
 *
 * javob berilgan · javob berilmagan · joriy savol ajratib ko'rsatiladi
 *
 * Rasmiy imtihonda foydalanuvchi savollar orasida erkin yura oladi va
 * o'tkazib yuborilganlariga qaytishi mumkin — shuning uchun bu panel
 * shunchaki bezak emas, asosiy navigatsiya vositasi.
 */
export default function QuestionNavigator({ total, currentIndex, answers, onSelect }) {
  return (
    <div className="grid grid-cols-10 gap-1.5" role="navigation">
      {Array.from({ length: total }, (_, i) => {
        const isAnswered = answers[String(i)] !== undefined;
        const isCurrent = i === currentIndex;

        let style = { borderColor: QUIZ.border, background: QUIZ.card, color: QUIZ.muted };
        if (isAnswered) style = { borderColor: QUIZ.success, background: "rgba(52,211,153,0.15)", color: QUIZ.success };
        if (isCurrent) style = { borderColor: QUIZ.text, background: QUIZ.text, color: QUIZ.bg };

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            aria-label={`Savol ${i + 1}${isAnswered ? " (javob berilgan)" : ""}`}
            aria-current={isCurrent ? "true" : undefined}
            className="aspect-square rounded-lg border text-[11px] font-bold flex items-center justify-center transition-colors active:scale-95"
            style={style}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

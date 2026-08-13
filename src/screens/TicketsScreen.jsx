import React from "react";
import { useTranslation } from "react-i18next";
import { TOTAL_TICKETS, QUESTIONS_PER_TICKET } from "../data/ticketsData";
import { QuizShell, QuizHeader } from "../components/exam/QuizUI";
import { QUIZ } from "../quizTheme";

// Biletlar ekrani — barcha bilet kartochkalari (TOTAL_TICKETS soniga qarab)
export default function TicketsScreen({ onBack, onSelectTicket }) {
  const { t } = useTranslation();
  const tickets = Array.from({ length: TOTAL_TICKETS }, (_, i) => i + 1);

  return (
    <QuizShell>
      <QuizHeader
        title={t("home.tickets")}
        subtitle={t("tickets.subtitle", { count: TOTAL_TICKETS, questions: QUESTIONS_PER_TICKET })}
        onBack={onBack}
      />

      <div className="grid grid-cols-4 gap-3">
        {tickets.map((num) => (
          <button
            key={num}
            onClick={() => onSelectTicket && onSelectTicket(num)}
            className="aspect-square rounded-2xl border flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
            style={{ borderColor: QUIZ.border, background: QUIZ.card }}
          >
            <span className="font-extrabold text-lg leading-none" style={{ color: QUIZ.warning }}>
              {num}
            </span>
            <span className="text-[11px] leading-none" style={{ color: QUIZ.muted }}>
              {t("tickets.ticketWord")}
            </span>
          </button>
        ))}
      </div>
    </QuizShell>
  );
}

import React from "react";
import { ChevronLeft } from "lucide-react";
import { QUIZ } from "../../quizTheme";

/** Test/imtihon ekranlarining umumiy o'rami — har doim quyuq. */
export function QuizShell({ children, className = "" }) {
  return (
    <div
      className={`flex-1 overflow-y-auto px-5 tp-safe-top pb-8 min-h-full animate-slide-in ${className}`}
      style={{ background: QUIZ.bg, color: QUIZ.text }}
    >
      {children}
    </div>
  );
}

export function QuizIconButton({ icon: Icon, onClick, disabled, "aria-label": ariaLabel, tone }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40"
      style={{ background: QUIZ.card }}
    >
      <Icon size={18} color={tone || QUIZ.text} />
    </button>
  );
}

export function QuizHeader({ title, subtitle, onBack, right }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <QuizIconButton icon={ChevronLeft} onClick={onBack} aria-label={title} />
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-extrabold leading-none truncate">{title}</h1>
        {subtitle && <p className="text-xs mt-1" style={{ color: QUIZ.muted }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function QuizProgress({ pct }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: QUIZ.border }}>
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${pct}%`, background: QUIZ.accent }}
      />
    </div>
  );
}

/**
 * Javob variant tugmasi. `state`:
 *  "idle"    — hali javob berilmagan
 *  "chosen"  — foydalanuvchi shu variantni tanladi (natija ko'rsatilmaydigan rejim)
 *  "correct" — to'g'ri javob (review/natija ko'rsatilganda)
 *  "wrong"   — noto'g'ri tanlangan variant
 *  "dimmed"  — javob berilgan, lekin bu variant tanlanmagan/to'g'ri emas
 */
export function OptionButton({ letter, text, state = "idle", icon: Icon, onClick, disabled }) {
  const styles = {
    idle: { borderColor: QUIZ.border, background: QUIZ.card, color: QUIZ.text },
    chosen: { borderColor: QUIZ.text, background: "#1B222B", color: QUIZ.text },
    correct: { borderColor: QUIZ.success, background: QUIZ.successSoft, color: QUIZ.success },
    wrong: { borderColor: QUIZ.danger, background: QUIZ.dangerSoft, color: QUIZ.danger },
    dimmed: { borderColor: QUIZ.cardSoft, background: QUIZ.cardSoft, color: QUIZ.muted },
  }[state];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left rounded-2xl border px-4 py-3.5 flex items-center gap-3 transition-colors active:scale-[0.99]"
      style={styles}
    >
      <span
        className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
        style={{ borderColor: styles.color === QUIZ.text ? "rgba(244,247,250,0.3)" : styles.color }}
      >
        {letter}
      </span>
      <span className="flex-1 text-sm leading-snug">{text}</span>
      {Icon && <Icon size={18} className="shrink-0" color={styles.color} />}
    </button>
  );
}

export function QuizButton({ variant = "primary", className = "", children, ...props }) {
  const styles = {
    primary: { background: QUIZ.accent, color: QUIZ.accentInk },
    secondary: { background: QUIZ.card, color: QUIZ.text, border: `1px solid ${QUIZ.border}` },
    ghost: { background: "transparent", color: QUIZ.muted },
  }[variant];

  return (
    <button
      className={`w-full rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 ${className}`}
      style={styles}
      {...props}
    >
      {children}
    </button>
  );
}

/** Natija halqasi — conic-gradient asosida foiz ko'rsatkichi. */
export function ResultRing({ pct, color, children, size = 160, thickness = 32 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${pct}%, ${QUIZ.border} ${pct}%)`,
      }}
    >
      <div
        className="rounded-full flex flex-col items-center justify-center"
        style={{ width: size - thickness, height: size - thickness, background: QUIZ.bg }}
      >
        {children}
      </div>
    </div>
  );
}

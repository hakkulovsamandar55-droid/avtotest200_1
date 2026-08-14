import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  ClipboardCheck,
  Layers,
  TrafficCone,
  Shuffle,
  Swords,
  BarChart3,
  Globe,
  PartyPopper,
  ChevronLeft,
  X,
} from "../icons";

const STORAGE_KEY = "pravaol-onboarding-seen";

/** localStorage o'qib bo'lmasa ham ilova ishlashda davom etishi kerak —
 * shu holatda onboarding har safar qayta ko'rsatilmasligi uchun "ko'rilgan"
 * deb hisoblaymiz (aks holda foydalanuvchi har ochganda bezovta bo'ladi). */
export function hasSeenOnboarding() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch (e) {
    return true;
  }
}

export function markOnboardingSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch (e) {
    // saqlab bo'lmasa ham davom etamiz
  }
}

// Har bir slayd: ikonka + tarjima kaliti (onboarding.slides.<key>.title/.desc)
const SLIDES = [
  { key: "welcome", icon: Sparkles },
  { key: "officialExam", icon: ClipboardCheck },
  { key: "tickets", icon: Layers },
  { key: "signs", icon: TrafficCone },
  { key: "practiceTools", icon: Shuffle },
  { key: "duel", icon: Swords },
  { key: "stats", icon: BarChart3 },
  { key: "language", icon: Globe },
  { key: "ready", icon: PartyPopper },
];

const SWIPE_THRESHOLD = 45;

/**
 * Birinchi marta kirgan foydalanuvchiga ilovaning barcha asosiy
 * bo'limlarini tushuntiradigan to'liq ekranli slayd-shou.
 *
 * Eski variant: markazlashgan doiraviy ikonka + matn + pastda nuqtalar —
 * bu ilovadagi boshqa hech bir joyda ishlatilmagan, "generik" onboarding
 * qolipi edi. Endi: chetlari yumshoq qayrilgan TO'RTBURCHAK ikonka plitkasi
 * (yangi logotipning shakli bilan bir xil tilda — atayin), matn esa
 * pastda alohida GURUH kartasida (ilova bo'ylab tanish Group uslubi),
 * nuqtalar o'rniga esa segmentlangan progress-chiziq va "3/9" raqami.
 */
export default function OnboardingSlideshow({ onFinish }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];
  const Icon = slide.icon;

  const goNext = () => {
    if (isLast) {
      onFinish();
    } else {
      setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
    }
  };
  const goPrev = () => setIndex((i) => Math.max(i - 1, 0));

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -SWIPE_THRESHOLD) goNext();
    else if (dx > SWIPE_THRESHOLD) goPrev();
  };

  return (
    <div
      className="flex flex-col h-full bg-app animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tepa qator: orqaga (birinchi slayddan tashqari) + qadam raqami + o'tkazib yuborish */}
      <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-1 shrink-0">
        <button
          onClick={goPrev}
          className={`w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center active:scale-90 transition-transform ${
            index === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          aria-label={t("onboarding.back")}
        >
          <ChevronLeft size={18} className="text-main" />
        </button>

        <span className="text-[11px] font-bold text-soft tabular-nums">
          {index + 1}/{SLIDES.length}
        </span>

        {!isLast ? (
          <button
            onClick={onFinish}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface border border-line active:scale-95 transition-transform"
          >
            <span className="text-xs font-semibold text-muted">{t("onboarding.skip")}</span>
            <X size={13} className="text-muted" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
      </div>

      {/* Ikonka — yumshoq qayrilgan kvadrat plitka (logotip shakli bilan bir xil) */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div
          key={slide.key}
          className="w-24 h-24 rounded-[28px] bg-accent flex items-center justify-center mb-8 animate-pop-in"
        >
          <Icon size={40} className="text-accent-ink" strokeWidth={1.8} />
        </div>

        {/* Matn — endi alohida GURUH kartasida (ilova bo'ylab tanish uslub),
            oddiy fon ustidagi matn emas */}
        <div className="w-full max-w-[340px] rounded-2xl bg-surface border border-line px-5 py-5 text-center">
          <h2 className="text-[18px] font-extrabold tracking-tight leading-snug text-main">
            {t(`onboarding.slides.${slide.key}.title`)}
          </h2>
          <p className="text-[13.5px] leading-relaxed mt-2.5 text-muted">
            {t(`onboarding.slides.${slide.key}.desc`)}
          </p>
        </div>
      </div>

      {/* Pastki qism: segmentlangan progress-chiziq + asosiy tugma */}
      <div className="shrink-0 px-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.75rem)] pt-2">
        <div className="flex items-center gap-1.5 mb-5">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}`}
              className={`flex-1 h-[5px] rounded-full transition-colors duration-200 ${i <= index ? "bg-accent" : "bg-sunken"}`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="w-full rounded-2xl py-4 font-bold text-[15px] bg-accent text-accent-ink flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          {isLast ? t("onboarding.start") : t("onboarding.next")}
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Sparkles, Clock } from "../icons";
import { PREMIUM_PLANS, formatPrice } from "../../shared/data/premiumPlans";
import { api } from "../api";
import { QuizShell, QuizHeader, QuizButton } from "../components/exam/QuizUI";
import { QUIZ } from "../quizTheme";

// MUHIM: bu endi UCH XIL mahsulot (Lite/Pro/VIP) emas — BITTA imkoniyatlar
// to'plami, faqat MUDDATI (15/30/90 kun) tanlanadi. Shu sababli imkoniyatlar
// ro'yxati faqat BIR MARTA, yuqorida ko'rsatiladi; pastda esa foydalanuvchi
// muddatni tanlaydi (uzoqroq muddat — kunlik hisobda arzonroq).
export default function PremiumScreen({ onBack, onSelectPlan }) {
  const { t } = useTranslation();
  // Narxlar serverdan olinadi (DB'da saqlanadi, admin panelidan
  // o'zgartiriladi). So'rov muvaffaqiyatsiz bo'lsa koddagi qiymatlar
  // zaxira sifatida ishlatiladi — narx sahifasi hech qachon bo'sh qolmaydi.
  const [plans, setPlans] = useState(PREMIUM_PLANS);

  useEffect(() => {
    api
      .getPremiumPlans()
      .then((res) => {
        if (Array.isArray(res.plans) && res.plans.length > 0) setPlans(res.plans);
      })
      .catch(() => {
        // Zaxira qiymatlar allaqachon o'rnatilgan
      });
  }, []);
  const [prices, setPrices] = useState(null); // { [planKey]: { amount, originalAmount, discountPercent } }
  const [selectedKey, setSelectedKey] = useState(plans.find((p) => p.badge)?.key || plans[0]?.key);

  // Narx foydalanuvchiga qarab farq qilishi mumkin (shaxsiy chegirma).
  // PaymentScreen bilan bir xil manbadan (backend) olinadi — shu tarzda
  // foydalanuvchi bu yerda va to'lov ekranida bir xil raqamni ko'radi.
  useEffect(() => {
    let cancelled = false;
    Promise.all(plans.map((p) => api.getPlanPrice(p.key).catch(() => null))).then((results) => {
      if (cancelled) return;
      const map = {};
      results.forEach((r, i) => {
        if (r) map[plans[i].key] = r;
      });
      setPrices(map);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPlan = plans.find((p) => p.key === selectedKey) || plans[0];
  const features = selectedPlan?.features || [];

  function dailyRate(plan) {
    const priceInfo = prices?.[plan.key];
    const amount = priceInfo ? priceInfo.amount : plan.price;
    return Math.round(amount / plan.durationDays);
  }

  return (
    <QuizShell>
      <QuizHeader title={t("premium.title")} subtitle={t("premium.subtitle")} onBack={onBack} />

      {/* Imkoniyatlar — barcha muddatlar uchun bir xil, shuning uchun bir marta */}
      <div className="rounded-3xl p-5 mb-5 border" style={{ background: "rgba(45,212,191,0.08)", borderColor: "rgba(45,212,191,0.3)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: QUIZ.accent }}>
            <Sparkles size={20} color={QUIZ.accentInk} />
          </div>
          <p className="font-extrabold text-lg leading-none">{t("premium.proTitle")}</p>
        </div>
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check size={14} className="mt-[3px] shrink-0" color={QUIZ.accent} />
              <span className="text-xs leading-snug" style={{ color: "#D1D5DB" }}>
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Muddat tanlash */}
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: QUIZ.muted }}>
        {t("premium.choosePeriod")}
      </p>

      <div className="space-y-3 mb-6">
        {plans.map((plan) => {
          const priceInfo = prices?.[plan.key];
          const hasDiscount = priceInfo?.discountPercent > 0;
          const displayAmount = priceInfo ? priceInfo.amount : plan.price;
          const isSelected = selectedKey === plan.key;

          return (
            <button
              key={plan.key}
              onClick={() => setSelectedKey(plan.key)}
              className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all border"
              style={
                isSelected
                  ? { background: "rgba(45,212,191,0.1)", borderColor: QUIZ.accent }
                  : { background: QUIZ.card, borderColor: QUIZ.border }
              }
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: isSelected ? QUIZ.accent : QUIZ.border }}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: QUIZ.accent }} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm">{plan.name}</p>
                  {plan.badge && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: QUIZ.accent, color: QUIZ.accentInk }}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: QUIZ.muted }}>
                  <Clock size={10} />
                  {t("premium.perDay", { amount: formatPrice(dailyRate(plan)) })}
                </p>
              </div>

              <div className="text-right shrink-0">
                {hasDiscount && (
                  <p className="text-[11px] line-through leading-none mb-0.5" style={{ color: QUIZ.muted }}>
                    {formatPrice(priceInfo.originalAmount)}
                  </p>
                )}
                <p className="font-extrabold text-base leading-none">
                  {formatPrice(displayAmount)}
                  <span className="text-[10px] font-medium" style={{ color: QUIZ.muted }}>
                    {" "}
                    so'm
                  </span>
                </p>
                {hasDiscount && (
                  <p className="text-[10px] font-bold mt-1" style={{ color: QUIZ.success }}>
                    −{priceInfo.discountPercent}%
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <QuizButton onClick={() => onSelectPlan?.(selectedPlan)}>
        {t("premium.select", { name: selectedPlan.name })}
      </QuizButton>

      <p className="text-center text-[11px] mt-6 leading-relaxed px-4" style={{ color: QUIZ.muted }}>
        {t("premium.disclaimer")}
      </p>
    </QuizShell>
  );
}

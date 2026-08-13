import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Crown, Sparkles } from "../icons";
import { PREMIUM_PLANS, formatPrice } from "../../shared/data/premiumPlans";
import { api } from "../api";
import { ScreenHeader, Group, Button } from "../components/ui";

// MUHIM: bu endi UCH XIL mahsulot (Lite/Pro/VIP) emas — BITTA imkoniyatlar
// to'plami, faqat MUDDATI (15/30/90 kun) tanlanadi. Shu sababli imkoniyatlar
// ro'yxati faqat BIR MARTA ko'rsatiladi; muddat esa yuqorida, segment
// tugmalar orqali tanlanadi (eski vertikal narx-ro'yxati o'rniga).
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
  const priceInfo = prices?.[selectedPlan?.key];
  const hasDiscount = priceInfo?.discountPercent > 0;
  const displayAmount = priceInfo ? priceInfo.amount : selectedPlan?.price;
  const dailyRate = selectedPlan ? Math.round(displayAmount / selectedPlan.durationDays) : 0;

  return (
    <div className="flex-1 overflow-y-auto tp-safe-top pb-8 animate-slide-in">
      <div className="px-5">
        <ScreenHeader title={t("premium.title")} onBack={onBack} />
      </div>

      {/* HERO — katta belgi + sarlavha, eski kichik chap tomonlama panel o'rniga */}
      <div className="flex flex-col items-center text-center px-6 mt-2">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
          <Crown size={30} className="text-accent-ink" />
        </div>
        <h2 className="text-xl font-extrabold text-main mt-4">{t("premium.proTitle")}</h2>
        <p className="text-muted text-sm mt-1.5 max-w-[260px]">{t("premium.subtitle")}</p>
      </div>

      {/* MUDDAT — gorizontal segment tugmalar, vertikal narx-ro'yxati o'rniga */}
      <div className="px-5 mt-6">
        <div className="flex gap-2 rounded-2xl bg-sunken p-1.5">
          {plans.map((plan) => {
            const active = plan.key === selectedKey;
            return (
              <button
                key={plan.key}
                onClick={() => setSelectedKey(plan.key)}
                className={`relative flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                  active ? "bg-accent text-accent-ink" : "text-muted"
                }`}
              >
                {plan.name}
                {plan.badge && !active && (
                  <span className="absolute -top-2 -right-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-warning text-accent-ink">
                    {plan.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* NARX — markazda katta ko'rsatkich */}
      <div className="flex flex-col items-center mt-6">
        {hasDiscount && (
          <p className="text-muted text-sm line-through">{formatPrice(priceInfo.originalAmount)} so'm</p>
        )}
        <p className="text-[38px] font-extrabold text-main leading-none tabular-nums">
          {formatPrice(displayAmount)}
          <span className="text-base font-semibold text-muted"> so'm</span>
        </p>
        <p className="text-muted text-xs mt-1.5">{t("premium.perDay", { amount: formatPrice(dailyRate) })}</p>
        {hasDiscount && (
          <span className="mt-2 text-[11px] font-bold text-success bg-success/10 rounded-full px-2.5 py-1">
            −{priceInfo.discountPercent}%
          </span>
        )}
      </div>

      {/* IMKONIYATLAR — guruhlangan ro'yxat, butun ilova bilan bir xil til */}
      <div className="px-5 mt-7">
        <div className="flex items-center gap-2 mb-2 ml-1">
          <Sparkles size={13} className="text-accent" />
          <p className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted">
            {t("premium.proTitle")}
          </p>
        </div>
        <Group>
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <span className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} className="text-success" />
              </span>
              <span className="text-[13px] text-main leading-snug pt-0.5">{f}</span>
            </div>
          ))}
        </Group>
      </div>

      <div className="px-5 mt-6">
        <Button onClick={() => onSelectPlan?.(selectedPlan)} size="lg" className="w-full">
          {t("premium.select", { name: selectedPlan.name })}
        </Button>
        <p className="text-center text-soft text-[11px] mt-4 leading-relaxed px-4">{t("premium.disclaimer")}</p>
      </div>
    </div>
  );
}

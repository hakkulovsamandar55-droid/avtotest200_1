import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "../../icons";
import { api } from "../../api";
import { Button } from "../../components/ui";

const DISCOUNT_OPTIONS = [0, 10, 20, 30, 50, 75, 100];

// Foydalanuvchiga shaxsiy chegirma berish/o'zgartirish modal oynasi (spec 4-bo'lim)
export default function DiscountModal({ userId, current, onClose, onSaved }) {
  const { t } = useTranslation();
  const [percent, setPercent] = useState(current?.percent ?? 0);
  const [expiresAt, setExpiresAt] = useState(current?.expiresAt ? current.expiresAt.slice(0, 10) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleApply() {
    setBusy(true);
    setError("");
    try {
      await api.setUserDiscount(userId, percent, expiresAt || null);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setError("");
    try {
      await api.removeUserDiscount(userId);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="w-full sm:max-w-sm rounded-3xl bg-modal border border-line shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-extrabold text-main text-base">{t("admin.discount.title")}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center">
            <X size={15} className="text-soft" />
          </button>
        </div>

        <p className="text-muted text-xs mb-2">{t("admin.discount.percent")}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {DISCOUNT_OPTIONS.map((opt) => {
            const active = percent === opt;
            return (
              <button
                key={opt}
                onClick={() => setPercent(opt)}
                className={`rounded-xl px-3.5 py-2 text-sm font-bold transition-transform active:scale-95 border ${
                  active ? "bg-accent text-accent-ink border-accent" : "bg-surface-2 text-main border-line"
                }`}
              >
                {opt}%
              </button>
            );
          })}
        </div>

        <p className="text-muted text-xs mb-2">{t("admin.discount.expiresAt")}</p>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full rounded-xl bg-sunken border border-line px-3 py-2.5 text-sm mb-1"
        />
        <p className="text-muted text-[11px] mb-4">{t("admin.discount.noExpiry")}</p>

        {error && <p className="text-danger text-xs mb-3">{error}</p>}

        <div className="flex gap-2">
          {current && (
            <Button variant="secondary" onClick={handleRemove} disabled={busy} className="flex-1">
              {t("admin.discount.remove")}
            </Button>
          )}
          <Button onClick={handleApply} disabled={busy} className="flex-1">
            {t("admin.discount.apply")}
          </Button>
        </div>
      </div>
    </div>
  );
}

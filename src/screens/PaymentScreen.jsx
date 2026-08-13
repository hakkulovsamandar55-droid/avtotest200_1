import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, Upload, Clock, XCircle, MessageCircle } from "../icons";
import { api } from "../api";
import { formatPrice } from "../data/premiumData";
import { ScreenHeader, Card, Button } from "../components/ui";

// Backend limiti bilan bir xil (backend/src/lib/upload.js)
const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;

// Foydalanuvchi karta raqamiga pul o'tkazadi, chekni yuklaydi, admin tasdig'ini kutadi.
// Bosqichlar: card -> uploading -> result (pending yoki duplicate)
export default function PaymentScreen({ plan, onBack, onOpenSupport }) {
  const { t } = useTranslation();
  const [cardInfo, setCardInfo] = useState(null);
  const [priceInfo, setPriceInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState("card");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.getCardInfo().then(setCardInfo).catch(() => {});
    api.getPlanPrice(plan.key).then(setPriceInfo).catch(() => {});
  }, [plan.key]);

  function handleCopy() {
    if (!cardInfo?.cardNumber) return;
    navigator.clipboard?.writeText(cardInfo.cardNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // URL.createObjectURL bilan yaratilgan manzil qo'lda bo'shatilmasa,
  // rasm brauzer xotirasida qolib ketadi (memory leak). Foydalanuvchi
  // bir necha marta rasm almashtirsa, bu sezilarli bo'ladi.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFilePick(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    // Katta fayl serverga yuborilib, keyin 413 xatosi qaytishidan ko'ra
    // shu yerda darhol ogohlantirgan yaxshi (backend limiti ham 8MB).
    if (f.size > MAX_RECEIPT_BYTES) {
      setError(t("payment.fileTooLarge"));
      return;
    }
    if (!f.type.startsWith("image/")) {
      setError(t("payment.notAnImage"));
      return;
    }

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    setFile(f);
    setError("");
  }

  async function handleSubmit() {
    if (!file || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const { payment } = await api.submitPayment(file, plan.key);
      setResult({ payment });
      setStep("result");
    } catch (err) {
      if (err.code === "duplicate_receipt") {
        setResult({ duplicate: true });
        setStep("result");
      } else if (err.code === "pending_exists") {
        // Foydalanuvchida allaqachon ko'rib chiqilmagan so'rov bor —
        // bu xato emas, shuning uchun "kutilmoqda" ekranini ko'rsatamiz.
        setResult({ alreadyPending: true });
        setStep("result");
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-8 bg-app min-h-full animate-slide-in">
      <ScreenHeader title={`${plan.name} ${t("payment.title")}`} onBack={onBack} />

      {step === "card" && (
        <>
          <Card className="p-5 mb-4">
            <p className="text-muted text-xs mb-1">{t("payment.amountLabel")}</p>
            <p className="text-2xl font-extrabold text-main mb-1">
              {priceInfo ? formatPrice(priceInfo.amount) : "..."} <span className="text-sm font-medium text-muted">so'm</span>
            </p>
            {priceInfo?.discountPercent > 0 && (
              <p className="text-xs text-success font-semibold">
                {t("payment.discountApplied", { percent: priceInfo.discountPercent })} · {t("payment.originalPrice")}:{" "}
                {formatPrice(priceInfo.originalAmount)} so'm
              </p>
            )}
          </Card>

          <Card className="p-5 mb-4">
            <p className="font-bold text-main text-sm mb-3">{t("payment.cardTitle")}</p>
            <div className="rounded-2xl p-4 mb-3 bg-accent">
              <p className="text-accent-ink/70 text-[11px] mb-1">{t("payment.cardNumber")}</p>
              <p className="text-accent-ink text-lg font-bold tracking-wider mb-3">{cardInfo?.cardNumber || "…"}</p>
              <p className="text-accent-ink/70 text-[11px] mb-0.5">{t("payment.cardOwner")}</p>
              <p className="text-accent-ink text-sm font-semibold">{cardInfo?.cardOwner || "…"}</p>
            </div>
            <Button variant="secondary" onClick={handleCopy} className="w-full">
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? t("payment.copied") : t("payment.copyCard")}
            </Button>
          </Card>

          <div className="rounded-2xl bg-surface-2 border border-line px-4 py-3 mb-5">
            <p className="text-muted text-xs leading-relaxed">{t("payment.instructions")}</p>
          </div>

          <Button onClick={() => setStep("uploading")} size="lg" className="w-full">
            {t("payment.iHavePaid")}
          </Button>
        </>
      )}

      {step === "uploading" && (
        <>
          <p className="text-muted text-sm mb-4">{t("payment.uploadInstruction")}</p>

          <label className="block rounded-3xl border-2 border-dashed border-line bg-surface-2 p-8 text-center cursor-pointer mb-4">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFilePick} />
            {previewUrl ? (
              <img src={previewUrl} alt="" className="max-h-64 mx-auto rounded-xl object-contain" />
            ) : (
              <>
                <Upload size={28} className="mx-auto mb-2 text-soft" />
                <p className="text-main text-sm font-semibold">{t("payment.selectReceipt")}</p>
                <p className="text-muted text-xs mt-1">{t("payment.selectReceiptSubtitle")}</p>
              </>
            )}
          </label>

          {error && <p className="text-danger text-xs text-center mb-3">{error}</p>}

          <Button onClick={handleSubmit} disabled={!file || submitting} size="lg" className="w-full">
            {submitting ? t("payment.sending") : t("payment.sendReceipt")}
          </Button>
        </>
      )}

      {step === "result" && result?.alreadyPending && (
        <div className="flex flex-col items-center text-center mt-8 px-4">
          <Clock size={48} className="mb-4 text-warning" />
          <p className="font-bold text-main text-base mb-2">{t("payment.alreadyPendingTitle")}</p>
          <p className="text-muted text-sm mb-6">{t("payment.alreadyPendingBody")}</p>
          <Button variant="secondary" onClick={onOpenSupport} className="w-full">
            <MessageCircle size={15} /> {t("payment.contactAdmin")}
          </Button>
        </div>
      )}

      {step === "result" && result?.duplicate && (
        <div className="flex flex-col items-center text-center mt-8 px-4">
          <XCircle size={48} className="mb-4 text-danger" />
          <p className="font-bold text-main text-base mb-2">{t("payment.duplicateTitle")}</p>
          <p className="text-muted text-sm mb-6">{t("payment.duplicateBody")}</p>
          <Button onClick={onOpenSupport} size="lg" className="w-full">
            <MessageCircle size={16} /> {t("payment.contactAdmin")}
          </Button>
        </div>
      )}

      {step === "result" && result?.payment && (
        <div className="flex flex-col items-center text-center mt-8 px-4">
          <Clock size={48} className="mb-4 text-warning" />
          <p className="font-bold text-main text-base mb-2">{t("payment.pendingTitle")}</p>
          <p className="text-muted text-sm mb-1">{t("payment.pendingBody")}</p>
          <p className="text-muted text-xs mb-6">{t("payment.pendingEta")}</p>

          {result.payment.ocr?.warnings?.length > 0 && (
            <div className="w-full rounded-2xl bg-surface-2 border border-line px-4 py-3 mb-6 text-left">
              <p className="text-muted text-xs leading-relaxed">{t("payment.warningsNotice")}</p>
            </div>
          )}

          <Button variant="secondary" onClick={onOpenSupport} className="w-full">
            <MessageCircle size={15} /> {t("payment.contactAdmin")}
          </Button>
        </div>
      )}
    </div>
  );
}

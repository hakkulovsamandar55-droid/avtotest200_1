import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, CreditCard, Check, Pencil } from "../../icons";
import { api, resolveUploadUrl } from "../../api";
import { Card, Button } from "../../components/ui";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

// Admin karta ma'lumotlarini shu yerdan o'zgartiradi — .env yoki deploy shart emas,
// saqlangan zahoti to'lov ekranida va OCR solishtirishda kuchga kiradi.
function CardSettingsForm() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [editing, setEditing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardOwner, setCardOwner] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function load() {
    api.getPaymentSettings().then((data) => {
      setSettings(data);
      setCardNumber(data.cardNumber);
      setCardOwner(data.cardOwner);
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    setBusy(true);
    setError("");
    try {
      const data = await api.updatePaymentSettings(cardNumber, cardOwner);
      setSettings(data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!settings) return null;

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-main text-sm flex items-center gap-2">
          <CreditCard size={15} className="text-accent" />
          {t("admin.payments.cardSettingsTitle")}
        </p>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs font-semibold flex items-center gap-1 text-accent">
            <Pencil size={12} /> {t("admin.payments.editCard")}
          </button>
        )}
      </div>

      {editing ? (
        <>
          <p className="text-muted text-[11px] mb-1">{t("payment.cardNumber")}</p>
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="8600 1234 5678 9012"
            className="w-full rounded-xl bg-sunken border border-line px-3 py-2.5 text-sm mb-3"
          />
          <p className="text-muted text-[11px] mb-1">{t("payment.cardOwner")}</p>
          <input
            value={cardOwner}
            onChange={(e) => setCardOwner(e.target.value)}
            placeholder="Ism Familiya"
            className="w-full rounded-xl bg-sunken border border-line px-3 py-2.5 text-sm mb-3"
          />
          {error && <p className="text-danger text-xs mb-2">{error}</p>}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditing(false);
                setCardNumber(settings.cardNumber);
                setCardOwner(settings.cardOwner);
              }}
              className="flex-1"
            >
              {t("admin.payments.cancelEdit")}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={busy} className="flex-1">
              {t("admin.save")}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-main text-sm font-semibold tracking-wide">{settings.cardNumber || "—"}</p>
          <p className="text-muted text-xs mt-0.5">{settings.cardOwner || "—"}</p>
          {saved && (
            <p className="text-success text-[11px] font-semibold mt-2 flex items-center gap-1">
              <Check size={12} /> {t("admin.saved")}
            </p>
          )}
        </>
      )}
    </Card>
  );
}

function PaymentCard({ payment, onApprove, onReject }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState("");
  const warnings = payment.ocr.warnings || [];

  return (
    <Card className="p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0">
          <p className="font-bold text-main text-sm truncate">{payment.user.name}</p>
          <p className="text-muted text-xs truncate">
            {payment.planName} · {payment.amount.toLocaleString()} so'm
            {payment.discountPercent > 0 && ` (${payment.discountPercent}% chegirma)`}
          </p>
        </div>
        {warnings.length === 0 ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-success bg-success/15 rounded-full px-2 py-1 shrink-0">
            <CheckCircle2 size={11} /> {payment.ocr.confidence}%
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/15 rounded-full px-2 py-1 shrink-0">
            <AlertTriangle size={11} /> {warnings.length}
          </span>
        )}
      </div>

      <img
        src={resolveUploadUrl(payment.receiptImageUrl)}
        alt=""
        className="w-full max-h-56 object-contain rounded-xl bg-sunken mb-3 cursor-pointer"
        onClick={() => window.open(resolveUploadUrl(payment.receiptImageUrl), "_blank")}
      />

      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center justify-between text-xs font-semibold text-muted mb-2">
        {t("admin.payments.ocrTitle")}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="rounded-xl bg-sunken border border-line p-3 mb-3 space-y-1.5">
          <p className="text-[11px] text-muted">
            {t("admin.payments.ocrAmount")}: <span className="text-main font-semibold">{payment.ocr.extractedAmount?.toLocaleString() || "—"}</span>
          </p>
          <p className="text-[11px] text-muted">
            {t("admin.payments.ocrCard")}: <span className="text-main font-semibold">{payment.ocr.extractedCard || "—"}</span>
          </p>
          <p className="text-[11px] text-muted">
            {t("admin.payments.ocrDate")}:{" "}
            <span className="text-main font-semibold">{payment.ocr.extractedDate ? fmtDate(payment.ocr.extractedDate) : "—"}</span>
          </p>
          <div>
            <p className="text-[11px] text-muted mb-1">{t("admin.payments.ocrWarnings")}:</p>
            {warnings.length === 0 ? (
              <p className="text-[11px] text-success font-medium">{t("admin.payments.noWarnings")}</p>
            ) : (
              <ul className="space-y-0.5">
                {warnings.map((w) => (
                  <li key={w} className="text-[11px] text-warning">
                    • {t(`admin.payments.warning.${w}`)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {payment.ocr.extractedText && (
            <details className="mt-1">
              <summary className="text-[11px] text-muted cursor-pointer">{t("admin.payments.ocrText")}</summary>
              <p className="text-[10px] text-muted mt-1 whitespace-pre-wrap break-words">{payment.ocr.extractedText}</p>
            </details>
          )}
        </div>
      )}

      {payment.status === "PENDING" ? (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setBusy("reject");
              await onReject(payment.id);
              setBusy("");
            }}
            disabled={busy !== ""}
            className="flex-1 rounded-xl py-2.5 text-xs font-bold border border-danger/40 text-danger bg-danger/15 disabled:opacity-50"
          >
            {t("admin.payments.reject")}
          </button>
          <button
            onClick={async () => {
              setBusy("approve");
              await onApprove(payment.id);
              setBusy("");
            }}
            disabled={busy !== ""}
            className="flex-1 rounded-xl py-2.5 text-xs font-bold bg-accent text-accent-ink disabled:opacity-50"
          >
            {t("admin.payments.approve")}
          </button>
        </div>
      ) : (
        <p className={`text-center text-xs font-bold ${payment.status === "APPROVED" ? "text-success" : "text-danger"}`}>
          {payment.status === "APPROVED" ? t("admin.payments.approved") : t("admin.payments.rejected")}
          {payment.rejectionReason ? ` — ${payment.rejectionReason}` : ""}
        </p>
      )}
    </Card>
  );
}

// Admin tomoni: to'lovlarni ko'rib chiqish (spec 8-11-bo'limlar) — OCR faqat
// ma'lumot beradi, tasdiqlash/rad etish har doim admin qo'li bilan
//
// moderatorMode: mini-admin (MODERATOR) buni ochganda karta sozlamalari
// formasi (CardSettingsForm) ko'rsatilmaydi — backend baribir uni
// requireAdminUser bilan rad etadi (faqat to'liq ADMIN karta raqamini
// o'zgartira oladi), shuning uchun moderatorga bosib bo'lmaydigan forma
// ko'rsatishning ma'nosi yo'q.
export default function AdminPaymentsTab({ moderatorMode = false }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState("PENDING");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.getPayments(status).then((data) => setPayments(data.payments)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [status]);
  useEffect(() => {
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [status]);

  async function handleApprove(id) {
    await api.approvePayment(id);
    load();
  }

  async function handleReject(id) {
    const reason = window.prompt(t("admin.payments.rejectReasonPrompt")) || "";
    await api.rejectPayment(id, reason);
    load();
  }

  return (
    <div>
      {!moderatorMode && <CardSettingsForm />}

      <div className="flex gap-2 mb-3">
        {[
          { key: "PENDING", label: t("admin.payments.filterPending") },
          { key: "APPROVED", label: t("admin.payments.filterApproved") },
          { key: "REJECTED", label: t("admin.payments.filterRejected") },
        ].map((f) => {
          const active = status === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors border ${
                active ? "bg-accent text-accent-ink border-accent" : "bg-surface-2 text-muted border-line"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {payments.map((p) => (
        <PaymentCard key={p.id} payment={p} onApprove={handleApprove} onReject={handleReject} />
      ))}
      {!loading && payments.length === 0 && <p className="text-center text-muted text-sm mt-10">{t("admin.payments.noPayments")}</p>}
    </div>
  );
}

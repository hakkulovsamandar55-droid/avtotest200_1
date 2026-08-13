import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck, ShieldOff, Crown, XCircle, Ban, CheckCircle2,
  MessageCircle, Trash2, Percent, Clock, CreditCard, Check,
} from "../../icons";
import { api } from "../../api";
import DiscountModal from "./DiscountModal";
import { ScreenHeader, Card, Button } from "../../components/ui";

function initials(name) {
  return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

// Faqat adminlar ko'radigan shaxsiy eslatma — foydalanuvchiga hech qachon ko'rsatilmaydi.
// Alohida "Saqlash" tugmasi bilan (har harfda so'rov yubormaslik uchun).
function AdminNotesBox({ userId, initialNotes }) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState(initialNotes || "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      await api.setUserNotes(userId, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-4 mb-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("admin.profile.notesPlaceholder")}
        rows={3}
        className="w-full rounded-xl bg-sunken border border-line px-3 py-2.5 text-xs resize-none mb-2"
      />
      <div className="flex items-center justify-between">
        {saved ? (
          <span className="text-success text-[11px] font-semibold flex items-center gap-1">
            <Check size={12} /> {t("admin.saved")}
          </span>
        ) : (
          <span />
        )}
        <Button size="sm" onClick={handleSave} disabled={busy}>
          {t("admin.save")}
        </Button>
      </div>
    </Card>
  );
}

function StatCell({ label, value, tone }) {
  return (
    <div className="rounded-2xl bg-sunken border border-line px-3 py-3">
      <p className="text-muted text-[11px] mb-0.5">{label}</p>
      <p className={`font-extrabold text-sm ${tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-main"}`}>
        {value}
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-line last:border-0">
      <span className="text-muted text-xs">{label}</span>
      <span className="text-main text-xs font-semibold">{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger, busy }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold border transition-transform active:scale-[0.97] disabled:opacity-50 ${
        danger ? "bg-danger/10 border-danger/25 text-danger" : "bg-surface-2 border-line text-main"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

const STATUS_TONE = {
  APPROVED: "text-success",
  REJECTED: "text-danger",
  PENDING: "text-warning",
};

const TIMELINE_ICONS = {
  REGISTERED: "🎉",
  TEST_COMPLETED: "📝",
  PREMIUM_GRANTED: "👑",
  PREMIUM_EXTENDED: "⏳",
  PREMIUM_EXPIRED: "⌛",
  DISCOUNT_GRANTED: "🏷️",
  PAYMENT_SUBMITTED: "💳",
  PAYMENT_APPROVED: "✅",
  PAYMENT_REJECTED: "❌",
  SUPPORT_MESSAGE: "💬",
  BLOCKED: "🚫",
  UNBLOCKED: "🔓",
  MADE_ADMIN: "🛡️",
  REMOVED_ADMIN: "🛡️",
  REFERRAL_JOINED: "🤝",
  REFERRAL_REWARD_GIVEN: "🎁",
};

// Admin tomoni: bitta foydalanuvchining to'liq profili — umumiy, statistika,
// premium, to'lovlar, timeline va harakat tugmalari (spec 2/3/6/7-bo'limlar)
export default function UserProfileScreen({ userId, onBack, onOpenChat, isSuperAdmin }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [showDiscount, setShowDiscount] = useState(false);

  function load() {
    setLoading(true);
    api.getUserProfile(userId).then(setProfile).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [userId]);

  async function runAction(key, fn) {
    setBusy(key);
    setError("");
    try {
      await fn();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-app">
        <p className="text-muted text-sm">...</p>
      </div>
    );
  }

  const { general, statistics, premium, discount, referral, payments, timeline } = profile;
  const isAdmin = general.role === "ADMIN";
  // Mini-admin: faqat to'lovlar/statistika/foydalanuvchilar ro'yxatiga kira oladi.
  const isModerator = general.role === "MODERATOR";

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-8 bg-app min-h-full animate-slide-in">
      <ScreenHeader title={t("admin.profile.backToUsers")} onBack={onBack} />

      {/* UMUMIY */}
      <Card className="p-5 mb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-accent text-accent-ink flex items-center justify-center text-lg font-bold shrink-0">
            {initials(general.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-main text-base truncate flex items-center gap-1.5">
              {general.name}
              {isAdmin && <ShieldCheck size={14} className="text-accent" />}
              {isModerator && <ShieldCheck size={14} className="text-sky-400" />}
              {premium.isPremium && <Crown size={14} className="text-warning" />}
            </p>
            <p className="text-muted text-xs truncate">{general.username ? `@${general.username}` : "—"}</p>
          </div>
          {general.isBlocked && (
            <span className="text-[10px] font-bold text-danger bg-danger/15 rounded-full px-2.5 py-1 shrink-0">
              {t("admin.profile.blockedBadge")}
            </span>
          )}
        </div>

        <InfoRow label={t("admin.profile.telegramId")} value={general.telegramId} />
        <InfoRow label={t("admin.profile.registeredAt")} value={fmtDate(general.registeredAt)} />
        <InfoRow label={t("admin.profile.lastOnline")} value={general.lastOnlineAt ? fmtDate(general.lastOnlineAt) : "—"} />
        {general.phone && <InfoRow label="Telefon" value={general.phone} />}
        {general.age != null && <InfoRow label={t("admin.profile.age")} value={general.age} />}
        {general.dailyStudyMinutes != null && (
          <InfoRow label={t("admin.profile.dailyStudyMinutes")} value={`${general.dailyStudyMinutes} ${t("admin.profile.minutesShort")}`} />
        )}
      </Card>

      {/* STATISTIKA */}
      <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2 ml-1">{t("admin.profile.statsTitle")}</p>
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <StatCell label={t("admin.profile.testsCompleted")} value={statistics.testsCompleted} />
        <StatCell label={t("admin.profile.aiRating")} value={`${statistics.aiRating}%`} />
        <StatCell label={t("admin.profile.correctAnswers")} value={statistics.correctAnswers} tone="success" />
        <StatCell label={t("admin.profile.wrongAnswers")} value={statistics.wrongAnswers} tone="danger" />
        <StatCell label={t("admin.profile.successPercent")} value={`${statistics.successPercent}%`} />
        <StatCell label={t("admin.profile.averageScore")} value={`${statistics.averageScore}%`} />
      </div>

      {/* PREMIUM */}
      <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2 ml-1">{t("admin.profile.premiumTitle")}</p>
      <Card className="p-4 mb-3">
        <InfoRow label={t("admin.profile.currentPlan")} value={premium.plan || t("admin.profile.noPlan")} />
        {premium.isPremium && (
          <>
            <InfoRow label={t("admin.profile.premiumStart")} value={fmtDate(premium.startedAt)} />
            <InfoRow label={t("admin.profile.premiumEnd")} value={fmtDate(premium.expiresAt)} />
          </>
        )}
        {discount && (
          <InfoRow
            label={t("admin.discount.title")}
            value={`${discount.percent}%${discount.expiresAt ? ` · ${fmtDate(discount.expiresAt)} gacha` : ""}${discount.isExpired ? " (muddati o'tgan)" : ""}`}
          />
        )}
      </Card>

      {/* TO'LOVLAR */}
      <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2 ml-1">{t("admin.profile.paymentsTitle")}</p>
      <Card className="p-4 mb-3">
        {payments.length === 0 ? (
          <p className="text-muted text-xs text-center py-2">{t("admin.profile.noPayments")}</p>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <CreditCard size={13} className="text-soft" />
                <div className="min-w-0">
                  <p className="text-main text-xs font-semibold truncate">
                    {p.planName} · {p.amount.toLocaleString()} so'm
                  </p>
                  <p className="text-muted text-[10px]">{fmtDate(p.createdAt)}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold shrink-0 ${STATUS_TONE[p.status]}`}>{p.status}</span>
            </div>
          ))
        )}
      </Card>

      {/* REFERRAL */}
      <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2 ml-1">{t("admin.profile.referralTitle")}</p>
      <Card className="p-4 mb-3">
        <InfoRow label={t("admin.profile.referralCode")} value={referral.code || "—"} />
        <InfoRow
          label={t("admin.profile.referredBy")}
          value={
            referral.referredBy
              ? `${referral.referredBy.name}${referral.referredBy.username ? ` (@${referral.referredBy.username})` : ""}`
              : t("admin.profile.noReferrer")
          }
        />
        <InfoRow label={t("admin.profile.referralsCount")} value={referral.referralsCount} />
        {referral.referrals.length > 0 && (
          <div className="mt-2 pt-2 border-t border-line space-y-1.5">
            {referral.referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <span className="text-main text-xs truncate">
                  {r.name}
                  {r.username ? ` (@${r.username})` : ""}
                </span>
                {r.isPremium && <Crown size={12} className="shrink-0 text-warning" />}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* HARAKAT TUGMALARI */}
      <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2 ml-1">Amallar</p>
      {general.isSuperAdmin ? (
        <p className="text-xs text-muted mb-4">{t("admin.superAdminLocked")}</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-5">
          <ActionButton icon={MessageCircle} label={t("admin.profile.actions.openChat")} onClick={onOpenChat} />

          {premium.isPremium ? (
            <>
              <ActionButton
                icon={Clock}
                label={t("admin.profile.actions.extendPremium")}
                busy={busy === "extend"}
                onClick={() => {
                  const days = Number(window.prompt(t("admin.profile.extendDaysPrompt"), "30"));
                  if (days > 0) runAction("extend", () => api.extendPremium(userId, days));
                }}
              />
              <ActionButton
                icon={XCircle}
                label={t("admin.removePremium")}
                busy={busy === "premium"}
                onClick={() => runAction("premium", () => api.setUserPremium(userId, false))}
              />
            </>
          ) : (
            <ActionButton
              icon={Crown}
              label={t("admin.profile.actions.givePremium")}
              busy={busy === "premium"}
              onClick={() => runAction("premium", () => api.setUserPremium(userId, true, { planKey: "days30", days: 30 }))}
            />
          )}

          <ActionButton icon={Percent} label={t("admin.profile.actions.giveDiscount")} onClick={() => setShowDiscount(true)} />

          {isAdmin ? (
            <ActionButton
              icon={ShieldOff}
              label={t("admin.profile.actions.removeAdmin")}
              busy={busy === "role"}
              onClick={() => runAction("role", () => api.setUserRole(userId, "USER"))}
            />
          ) : isModerator ? (
            <ActionButton
              icon={ShieldOff}
              label={t("admin.profile.actions.removeModerator")}
              busy={busy === "role"}
              onClick={() => runAction("role", () => api.setUserRole(userId, "USER"))}
            />
          ) : (
            <>
              <ActionButton
                icon={ShieldCheck}
                label={t("admin.profile.actions.makeAdmin")}
                busy={busy === "role"}
                onClick={() => runAction("role", () => api.setUserRole(userId, "ADMIN"))}
              />
              <ActionButton
                icon={ShieldCheck}
                label={t("admin.profile.actions.makeModerator")}
                busy={busy === "role"}
                onClick={() => runAction("role", () => api.setUserRole(userId, "MODERATOR"))}
              />
            </>
          )}

          {general.isBlocked ? (
            <ActionButton
              icon={CheckCircle2}
              label={t("admin.profile.actions.unblock")}
              busy={busy === "block"}
              onClick={() => runAction("block", () => api.setUserBlocked(userId, false))}
            />
          ) : (
            <ActionButton
              icon={Ban}
              label={t("admin.profile.actions.block")}
              danger
              busy={busy === "block"}
              onClick={() => {
                if (!window.confirm(t("admin.profile.confirmBlock"))) return;
                const reason = window.prompt(t("admin.profile.blockReasonPlaceholder")) || "";
                runAction("block", () => api.setUserBlocked(userId, true, reason));
              }}
            />
          )}

          {isSuperAdmin && (
            <ActionButton
              icon={Trash2}
              label={t("admin.profile.actions.deleteAccount")}
              danger
              busy={busy === "delete"}
              onClick={() => {
                if (!window.confirm(t("admin.profile.confirmDelete"))) return;
                runAction("delete", async () => {
                  await api.deleteUser(userId);
                  onBack();
                });
              }}
            />
          )}
        </div>
      )}

      {error && <p className="text-danger text-xs text-center mb-4">{error}</p>}

      {/* ADMIN NOTES */}
      <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2 ml-1">{t("admin.profile.notesTitle")}</p>
      <AdminNotesBox userId={userId} initialNotes={general.adminNotes} />

      {/* TIMELINE */}
      <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2 ml-1">{t("admin.profile.timelineTitle")}</p>
      <Card className="p-4">
        {timeline.length === 0 ? (
          <p className="text-muted text-xs text-center py-2">{t("admin.profile.noActivity")}</p>
        ) : (
          <div className="space-y-0">
            {timeline.map((item, idx) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-base leading-none mt-0.5">{TIMELINE_ICONS[item.type] || "•"}</span>
                  {idx < timeline.length - 1 && <div className="w-px flex-1 bg-line my-1" style={{ minHeight: 16 }} />}
                </div>
                <div className="pb-3 min-w-0">
                  <p className="text-main text-xs font-medium">{item.message}</p>
                  <p className="text-muted text-[10px] mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showDiscount && (
        <DiscountModal
          userId={userId}
          current={discount}
          onClose={() => setShowDiscount(false)}
          onSaved={() => {
            setShowDiscount(false);
            load();
          }}
        />
      )}
    </div>
  );
}

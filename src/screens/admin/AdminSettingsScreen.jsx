import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Check, Loader2, Link2, Bot, Crown, Gift } from "../../icons";
import { api } from "../../api";
import { useSettings } from "../../SettingsContext";
import { ScreenHeader, Card } from "../../components/ui";

/**
 * ADMIN: global sozlamalar.
 *
 *  - Global bepul rejim: bitta tugma, hamma imkoniyat hammaga ochiladi
 *  - Har bir imkoniyat alohida: TEKIN yoki PREMIUM
 *  - "Telegram" tugmasi havolasi (admin DM yoki kanal)
 *  - Bot username (referral havolasi shundan quriladi)
 *
 * Saqlash DARHOL bo'ladi (alohida "Saqlash" tugmasi yo'q) — sozlama kam
 * va aniq, har o'zgarishdan keyin tasdiqlash bosish ortiqcha bo'lardi.
 * Matn maydonlari esa fokusdan chiqqanda saqlanadi.
 */
export default function AdminSettingsScreen({ onBack }) {
  const { t } = useTranslation();
  const { reload: reloadPublic } = useSettings();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(0);

  const [supportLink, setSupportLink] = useState("");
  const [botUsername, setBotUsername] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = await api.getAdminSettings();
      setData(s);
      setSupportLink(s.supportLink || "");
      setBotUsername(s.botUsername || "");
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(patch) {
    setSaving(true);
    setError("");
    try {
      const s = await api.updateAdminSettings(patch);
      setData(s);
      setSavedAt(Date.now());
      // Ochiq sozlamalar ham yangilansin — admin o'zgartirgan narsa
      // uning o'z ilovasida darhol ko'rinishi kerak.
      reloadPublic();
    } catch (err) {
      setError(err.message);
      // Xato bo'lsa serverdagi haqiqiy holatni qayta o'qiymiz, aks holda
      // ekranda saqlanmagan qiymat turib qolardi.
      load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-app">
        <Loader2 size={22} className="animate-spin text-soft" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-8 bg-app min-h-full animate-slide-in">
      <ScreenHeader
        title={t("adminSettings.title")}
        onBack={onBack}
        right={
          saving ? (
            <Loader2 size={16} className="animate-spin text-soft" />
          ) : savedAt > 0 && Date.now() - savedAt < 2500 ? (
            <Check size={16} className="text-success" />
          ) : null
        }
      />

      {error && <p className="text-danger text-xs mb-4 leading-relaxed">{error}</p>}

      {/* Global bepul rejim */}
      <div className={`rounded-2xl p-4 mb-5 ${data?.globalFreeMode ? "bg-accent" : "bg-surface border border-line"}`}>
        <div className="flex items-center gap-3">
          <Gift size={20} className={data?.globalFreeMode ? "text-accent-ink" : "text-soft"} />
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${data?.globalFreeMode ? "text-accent-ink" : "text-main"}`}>
              {t("adminSettings.globalFreeTitle")}
            </p>
            <p className={`text-xs mt-0.5 leading-relaxed ${data?.globalFreeMode ? "text-accent-ink/80" : "text-muted"}`}>
              {t("adminSettings.globalFreeDesc")}
            </p>
          </div>
          <Toggle checked={Boolean(data?.globalFreeMode)} onChange={(v) => save({ globalFreeMode: v })} />
        </div>
      </div>

      {/* Imkoniyatlar ro'yxati */}
      <h2 className="text-sm font-bold text-main mb-1">{t("adminSettings.featuresTitle")}</h2>
      <p className="text-muted text-xs mb-3 leading-relaxed">
        {data?.globalFreeMode ? t("adminSettings.featuresDisabledHint") : t("adminSettings.featuresHint")}
      </p>

      <Card className="overflow-hidden mb-6" style={{ opacity: data?.globalFreeMode ? 0.45 : 1 }}>
        {(data?.features || []).map((f, i) => {
          const isFree = data.featureAccess?.[f.key] === "FREE";
          return (
            <div key={f.key} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}>
              {isFree ? <Sparkles size={15} className="shrink-0 text-success" /> : <Crown size={15} className="shrink-0 text-warning" />}
              <span className="flex-1 min-w-0 text-[13px] text-main">{t(f.labelKey)}</span>
              <button
                disabled={data?.globalFreeMode}
                onClick={() =>
                  save({
                    featureAccess: { ...data.featureAccess, [f.key]: isFree ? "PREMIUM" : "FREE" },
                  })
                }
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold disabled:opacity-60 ${
                  isFree ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                }`}
              >
                {isFree ? t("adminSettings.free") : t("adminSettings.premium")}
              </button>
            </div>
          );
        })}
      </Card>

      {/* Havolalar */}
      <h2 className="text-sm font-bold text-main mb-3">{t("adminSettings.linksTitle")}</h2>

      <label className="block text-xs font-semibold text-muted mb-1.5">{t("adminSettings.supportLinkLabel")}</label>
      <div className="relative mb-1">
        <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft" />
        <input
          value={supportLink}
          onChange={(e) => setSupportLink(e.target.value)}
          onBlur={() => {
            if ((data?.supportLink || "") !== supportLink) save({ supportLink });
          }}
          placeholder="https://t.me/username"
          className="w-full rounded-2xl bg-surface border border-line pl-10 pr-4 py-3 text-sm"
        />
      </div>
      <p className="text-muted text-[11px] mb-5 leading-relaxed">{t("adminSettings.supportLinkHint")}</p>

      <label className="block text-xs font-semibold text-muted mb-1.5">{t("adminSettings.botUsernameLabel")}</label>
      <div className="relative mb-1">
        <Bot size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft" />
        <input
          value={botUsername}
          onChange={(e) => setBotUsername(e.target.value)}
          onBlur={() => {
            if ((data?.botUsername || "") !== botUsername) save({ botUsername });
          }}
          placeholder="pravaolbot"
          autoCapitalize="none"
          className="w-full rounded-2xl bg-surface border border-line pl-10 pr-4 py-3 text-sm"
        />
      </div>
      <p className="text-muted text-[11px] leading-relaxed">{t("adminSettings.botUsernameHint")}</p>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full shrink-0 transition-colors relative ${checked ? "bg-white/40" : "bg-sunken"}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform bg-white`}
        style={{ left: 2, transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

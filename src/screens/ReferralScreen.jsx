import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, Users, Gift, Loader2, Crown } from "../icons";
import { api } from "../api";
import { ScreenHeader, Card, Button } from "../components/ui";

/**
 * DO'STLARNI TAKLIF QILISH.
 *
 * NIMA UCHUN QO'SHILDI: referral tizimi bazada allaqachon ishlab turgan edi —
 * har foydalanuvchiga kod beriladi, ro'yxatdan o'tishda kim kimni chaqirgani
 * yozib qo'yiladi. Lekin foydalanuvchi o'z kodini HECH QAYERDAN ko'ra
 * olmasdi (faqat admin panelida ko'rinardi). Ya'ni tayyor funksiya bor,
 * lekin unga yetib bo'lmaydi edi.
 *
 * NUSXA OLISH: Telegram WebView'da `navigator.clipboard` ba'zi versiyalarda
 * ishlamaydi (HTTPS va ruxsat talab qiladi). Shuning uchun zaxira usul ham
 * bor — vaqtinchalik textarea orqali.
 */
export default function ReferralScreen({ onBack }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null); // "code" | "link" | null

  useEffect(() => {
    api
      .getReferralInfo()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function copy(text, which) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Zaxira: Telegram WebView'da clipboard API bloklangan bo'lishi mumkin
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError(t("referral.copyFailed"));
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-8 animate-slide-in">
      <ScreenHeader title={t("referral.title")} onBack={onBack} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-soft" />
        </div>
      ) : error && !data ? (
        <p className="text-danger text-sm">{error}</p>
      ) : data ? (
        <>
          {/* Tushuntirish */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Gift size={18} className="shrink-0 mt-0.5 text-accent" />
              <p className="text-xs leading-relaxed text-muted">{t("referral.howItWorks")}</p>
            </div>
          </Card>

          {/* Kod */}
          <Card className="p-4 mt-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.11em] mb-2 text-muted">
              {t("referral.yourCode")}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xl font-extrabold tracking-wider tabular-nums text-main">{data.code}</code>
              <button
                onClick={() => copy(data.code, "code")}
                className="w-9 h-9 rounded-xl bg-surface-2 border border-line flex items-center justify-center shrink-0"
                aria-label={t("referral.copy")}
              >
                {copied === "code" ? <Check size={15} className="text-success" /> : <Copy size={15} className="text-soft" />}
              </button>
            </div>
          </Card>

          {/* Havola — bot username sozlanmagan bo'lsa ko'rsatilmaydi */}
          {data.link && (
            <Button onClick={() => copy(data.link, "link")} size="lg" className="w-full mt-3">
              {copied === "link" ? <Check size={16} /> : <Copy size={16} />}
              {copied === "link" ? t("referral.copied") : t("referral.copyLink")}
            </Button>
          )}

          {/* Taklif qilinganlar */}
          <div className="flex items-center gap-2 mt-7 mb-3">
            <Users size={15} className="text-soft" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted">
              {t("referral.invitedCount", { count: data.invitedCount })}
            </p>
          </div>

          {data.invited.length === 0 ? (
            <p className="text-xs text-center py-8 leading-relaxed text-muted">{t("referral.noneYet")}</p>
          ) : (
            <div className="space-y-2">
              {data.invited.map((u, i) => (
                <Card key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-main">{(u.name || "?").charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate text-main">{u.name}</p>
                    <p className="text-[10px] mt-0.5 text-muted">{formatDate(u.joinedAt)}</p>
                  </div>
                  {u.isPremium && <Crown size={14} className="shrink-0 text-warning" />}
                </Card>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}`;
}

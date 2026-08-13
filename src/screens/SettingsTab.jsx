import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle, Send, ChevronRight, ShieldCheck, Crown, Check, Trophy, Gift } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useFontSize } from "../FontSizeContext";
import { api } from "../api";
import { useSettings, useFeature } from "../SettingsContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { Card, ListRow } from "../components/ui";

function PremiumRow({ onClick }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left bg-warning text-accent-ink active:scale-[0.99] transition-transform"
    >
      <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center shrink-0">
        <Crown size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-sm">{t("settings.premium")}</p>
        <p className="text-xs opacity-80">{t("settings.premiumSubtitle")}</p>
      </div>
      <ChevronRight size={18} />
    </button>
  );
}

// Reytingda ko'rinish tugmasi.
//
// Maxfiylik: o'chirilsa, foydalanuvchi ommaviy reytinglardan BUTUNLAY
// chiqariladi (o'z o'rnini ham ko'rmaydi). Holat serverda saqlanadi,
// shuning uchun boshqa qurilmada ham amal qiladi.
function LeaderboardToggle() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .examMe()
      .then((res) => {
        if (!cancelled) setVisible(res.showOnLeaderboard);
      })
      .catch(() => {
        // Sozlama yuklanmasa, tugma ko'rsatilmaydi
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (visible === null) return null;

  async function toggle() {
    if (saving) return;
    const next = !visible;
    setVisible(next); // optimistik
    setSaving(true);
    try {
      await api.setLeaderboardVisibility(next);
    } catch {
      setVisible(!next); // qaytarish
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card onClick={toggle} disabled={saving} className={`px-4 py-3.5 ${saving ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3">
        <Trophy size={18} className="text-soft" />
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium text-main text-sm">{t("settings.showOnLeaderboard")}</p>
          <p className="text-muted text-xs mt-0.5 leading-snug">
            {t("settings.showOnLeaderboardHint")}
          </p>
        </div>
        <span className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${visible ? "bg-accent" : "bg-sunken"}`}>
          <span
            className="block w-5 h-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: visible ? "translateX(20px)" : "translateX(0)" }}
          />
        </span>
      </div>
    </Card>
  );
}

// Light / Dark uchun katta tanlov tugmasi
function ThemeModePill({ item, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center transition-transform active:scale-[0.98] border-2 ${
        isActive ? "border-accent" : "border-line"
      }`}
      style={{ background: item.vars["--bg-app"], color: item.vars["--text-primary"] }}
    >
      {item.label}
    </button>
  );
}

// Qolgan ranglar uchun ro'yxat qatori
function ThemeColorRow({ item, isActive, isLocked, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-2.5 active:opacity-70 transition-opacity">
      <span
        className={`w-7 h-7 rounded-full shrink-0 ${isActive ? "ring-2 ring-offset-2 ring-offset-surface ring-accent" : ""}`}
        style={{ backgroundColor: item.accent }}
      />
      <span className="flex-1 text-left text-sm font-medium text-main">{item.label}</span>
      {isLocked && <Crown size={15} className="text-warning" />}
      {isActive && <Check size={17} className="text-accent" strokeWidth={3} />}
    </button>
  );
}

function ThemePickerRow({ isPremium, onOpenPremium }) {
  const { t } = useTranslation();
  const { themeKey, setThemeKey, themeList } = useTheme();
  const [open, setOpen] = useState(false);

  // Kunduzgi/tungi — asosiy rejimlar, yuqorida katta tugma sifatida.
  // Qolganlari rang varianti. Kalitlar themes.js dan keladi, shuning uchun
  // yangi tema qo'shilsa bu ro'yxat o'zi yangilanadi.
  const MODE_KEYS = ["day", "night"];
  const modePills = themeList.filter((it) => MODE_KEYS.includes(it.key));
  const colorOptions = themeList.filter((it) => !MODE_KEYS.includes(it.key));
  const activeItem = themeList.find((it) => it.key === themeKey);

  function choose(key, locked) {
    if (locked) {
      // To'g'ridan-to'g'ri premium sahifasiga o'tkazamiz — foydalanuvchi
      // nima uchun bloklanganini ko'radi va sotib olishi mumkin.
      onOpenPremium?.();
      return;
    }
    setThemeKey(key);
  }

  return (
    <Card className="px-4 py-3.5">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between">
        <span className="font-medium text-main text-sm">{t("settings.theme")}</span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: activeItem?.accent }} />
          <ChevronRight
            size={16}
            className="text-soft transition-transform"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          />
        </span>
      </button>

      {open && (
        <div className="mt-3.5 pt-3.5 border-t border-line">
          <div className="flex gap-3">
            {modePills.map((item) => (
              <ThemeModePill
                key={item.key}
                item={item}
                isActive={item.key === themeKey}
                onClick={() => choose(item.key, false)}
              />
            ))}
          </div>

          <div className="mt-1 divide-y divide-line">
            {colorOptions.map((item) => (
              <ThemeColorRow
                key={item.key}
                item={item}
                isActive={item.key === themeKey}
                isLocked={!isPremium}
                onClick={() => choose(item.key, !isPremium)}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// Shrift o'lchamini tanlash qatori — Aa harflari orqali kichik/o'rta/katta
// tanlash, xuddi ThemePickerRow uslubida ochilib-yopiladi.
function FontSizePickerRow() {
  const { t } = useTranslation();
  const { fontSizeKey, setFontSizeKey, fontSizeList } = useFontSize();
  const [open, setOpen] = useState(false);

  return (
    <Card className="px-4 py-3.5">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between">
        <span className="font-medium text-main text-sm">{t("settings.fontSize")}</span>
        <span className="flex items-center gap-2">
          <span className="text-muted text-xs">{t(`settings.fontSizeOptions.${fontSizeKey}`)}</span>
          <ChevronRight
            size={16}
            className="text-soft transition-transform"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          />
        </span>
      </button>

      {open && (
        <div className="mt-3.5 pt-3.5 border-t border-line flex gap-2.5">
          {fontSizeList.map((item) => {
            const isActive = item.key === fontSizeKey;
            return (
              <button
                key={item.key}
                onClick={() => setFontSizeKey(item.key)}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 border transition-transform active:scale-[0.97] ${
                  isActive ? "bg-accent text-accent-ink border-accent" : "bg-sunken text-main border-line"
                }`}
              >
                <span style={{ fontSize: `${item.rootPx}px`, lineHeight: 1 }} className="font-bold">
                  Aa
                </span>
                <span className="text-[10px] font-medium">{t(`settings.fontSizeOptions.${item.key}`)}</span>
                {isActive && <Check size={11} />}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// 2c-EKRAN: "Sozlamalar" bo'limi
export default function SettingsTab({
  user,
  onOpenAdmin,
  onOpenModerator,
  onOpenPremium,
  onOpenSupport,
  onOpenReferral,
}) {
  const { t } = useTranslation();
  const isAdmin = user?.role === "ADMIN";
  // Mini-admin: faqat to'lovlar/statistika/foydalanuvchilar ro'yxati.
  // ADMIN uchun to'liq panel ochiladi (yuqoridagi isAdmin), MODERATOR uchun
  // esa cheklangan ModeratorPanelScreen.
  const isModerator = user?.role === "MODERATOR";
  const { supportLink } = useSettings();
  // Premium ranglar endi sozlanadigan imkoniyat: global bepul rejim
  // yoqilgan yoki admin buni TEKIN qilgan bo'lsa, qulf ochiladi.
  const themesUnlocked = useFeature("premium_themes", user);
  const isPremium = themesUnlocked || isAdmin;

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-4 animate-fade-in">
      <h1 className="text-xl font-extrabold text-main text-center mb-5">{t("settings.title")}</h1>

      <Card className="p-5 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-accent text-accent-ink flex items-center justify-center text-xl font-bold shrink-0">
          {(user?.name || "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-main truncate">{user?.name || "—"}</p>
          <p className="text-muted text-sm truncate">{user?.username ? `@${user.username}` : ""}</p>
        </div>
      </Card>

      <div className="mt-3 space-y-3">
        <PremiumRow onClick={onOpenPremium} />
        <LanguageSwitcher variant="row" />
        <ThemePickerRow isPremium={isPremium} onOpenPremium={onOpenPremium} />
        <FontSizePickerRow />
        <LeaderboardToggle />
        <Card>
          <ListRow icon={Gift} label={t("settings.inviteFriends")} onClick={onOpenReferral} />
        </Card>
        <Card>
          <ListRow icon={HelpCircle} label={t("settings.support")} onClick={onOpenSupport} />
        </Card>
      </div>

      {supportLink && (
        <button
          onClick={() => {
            const tg = window.Telegram?.WebApp;
            // Telegram ichida openTelegramLink to'g'ri ishlaydi (ilovadan
            // chiqmasdan chatni ochadi). Tashqarida oddiy yangi oyna.
            if (tg?.openTelegramLink && /^https:\/\/t\.me\//i.test(supportLink)) {
              tg.openTelegramLink(supportLink);
            } else if (tg?.openLink) {
              tg.openLink(supportLink);
            } else {
              window.open(supportLink, "_blank");
            }
          }}
          className="w-full mt-3 rounded-2xl px-4 py-4 flex items-center gap-3 text-white text-left active:scale-[0.99] transition-transform bg-accent"
        >
          <Send size={18} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{t("settings.channelTitle")}</p>
            <p className="text-white/70 text-xs">{t("settings.channelSubtitle")}</p>
          </div>
          <ChevronRight size={18} />
        </button>
      )}

      {isAdmin && (
        <Card className="mt-3">
          <ListRow icon={ShieldCheck} label={t("settings.adminPanel")} onClick={onOpenAdmin} />
        </Card>
      )}

      {isModerator && (
        <Card className="mt-3">
          <ListRow icon={ShieldCheck} label={t("settings.moderatorPanel")} onClick={onOpenModerator} />
        </Card>
      )}
    </div>
  );
}

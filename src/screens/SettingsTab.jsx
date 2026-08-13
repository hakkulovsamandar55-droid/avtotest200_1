import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle, Send, ChevronRight, ShieldCheck, Check, Trophy, Gift, Globe } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useFontSize } from "../FontSizeContext";
import { api } from "../api";
import { useSettings } from "../SettingsContext";
import { LANGUAGES } from "../i18n";
import { Group } from "../components/ui";

/** Guruh ichidagi ochilib-yopiladigan qator: sarlavha qatori + (ochiq
 * bo'lsa) alohida bo'lim. Group'ning divide-y xossasi ular orasiga
 * avtomatik chiziq qo'yadi — qo'shimcha karta o'rash shart emas. */
function ExpandableRow({ label, value, open, onToggle, children }) {
  return (
    <>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3.5 active:bg-surface-2 transition-colors">
        <span className="font-medium text-main text-sm">{label}</span>
        <span className="flex items-center gap-2">
          {value}
          <ChevronRight
            size={16}
            className="text-soft transition-transform"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          />
        </span>
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </>
  );
}

function LanguageRow() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentLabel = t(`languageNames.${i18n.language}`);

  return (
    <ExpandableRow label={t("settings.language")} value={<span className="text-muted text-sm">{currentLabel}</span>} open={open} onToggle={() => setOpen((v) => !v)}>
      <div className="space-y-0.5">
        {LANGUAGES.map(({ code, nativeKey }) => {
          const active = i18n.language === code;
          return (
            <button
              key={code}
              onClick={() => {
                i18n.changeLanguage(code);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-left active:bg-surface-2"
            >
              <span className="flex items-center gap-2 text-main">
                <Globe size={14} className="text-soft" />
                {t(`languageNames.${nativeKey}`)}
              </span>
              {active && <Check size={15} className="text-accent" />}
            </button>
          );
        })}
      </div>
    </ExpandableRow>
  );
}

function ThemeRow() {
  const { t } = useTranslation();
  const { themeKey, setThemeKey, themeList } = useTheme();
  const [open, setOpen] = useState(false);
  const activeItem = themeList.find((it) => it.key === themeKey);

  return (
    <ExpandableRow
      label={t("settings.theme")}
      value={<span className="text-muted text-sm">{activeItem?.label}</span>}
      open={open}
      onToggle={() => setOpen((v) => !v)}
    >
      <div className="flex gap-2.5">
        {themeList.map((item) => (
          <button
            key={item.key}
            onClick={() => setThemeKey(item.key)}
            className={`flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center border-2 transition-transform active:scale-[0.98] ${
              item.key === themeKey ? "border-accent" : "border-line"
            }`}
            style={{ background: item.vars["--bg-app"], color: item.vars["--text-primary"] }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </ExpandableRow>
  );
}

function FontSizeRow() {
  const { t } = useTranslation();
  const { fontSizeKey, setFontSizeKey, fontSizeList } = useFontSize();
  const [open, setOpen] = useState(false);

  return (
    <ExpandableRow
      label={t("settings.fontSize")}
      value={<span className="text-muted text-xs">{t(`settings.fontSizeOptions.${fontSizeKey}`)}</span>}
      open={open}
      onToggle={() => setOpen((v) => !v)}
    >
      <div className="flex gap-2">
        {fontSizeList.map((item) => {
          const isActive = item.key === fontSizeKey;
          return (
            <button
              key={item.key}
              onClick={() => setFontSizeKey(item.key)}
              className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-2.5 border transition-transform active:scale-[0.97] ${
                isActive ? "bg-accent text-accent-ink border-accent" : "bg-sunken text-main border-line"
              }`}
            >
              <span style={{ fontSize: `${item.rootPx}px`, lineHeight: 1 }} className="font-bold">
                Aa
              </span>
              <span className="text-[9px] font-medium">{t(`settings.fontSizeOptions.${item.key}`)}</span>
            </button>
          );
        })}
      </div>
    </ExpandableRow>
  );
}

// Reytingda ko'rinish tugmasi.
function LeaderboardRow() {
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
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (visible === null) return null;

  async function toggle() {
    if (saving) return;
    const next = !visible;
    setVisible(next);
    setSaving(true);
    try {
      await api.setLeaderboardVisibility(next);
    } catch {
      setVisible(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button onClick={toggle} disabled={saving} className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${saving ? "opacity-60" : ""}`}>
      <Trophy size={16} className="text-soft shrink-0" />
      <span className="flex-1 min-w-0">
        <span className="block font-medium text-main text-sm">{t("settings.showOnLeaderboard")}</span>
        <span className="block text-muted text-[11px] mt-0.5 leading-snug">{t("settings.showOnLeaderboardHint")}</span>
      </span>
      <span className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${visible ? "bg-accent" : "bg-sunken"}`}>
        <span className="block w-5 h-5 rounded-full bg-white shadow transition-transform" style={{ transform: visible ? "translateX(20px)" : "translateX(0)" }} />
      </span>
    </button>
  );
}

function Row({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-surface-2 transition-colors">
      <Icon size={16} className="text-soft shrink-0" />
      <span className="flex-1 text-sm font-medium text-main">{label}</span>
      <ChevronRight size={16} className="text-soft shrink-0" />
    </button>
  );
}

// 2c-EKRAN: "Sozlamalar" — endi har bir qator o'z alohida kartasida
// emas, mavzu bo'yicha guruhlangan yaxlit ro'yxatlarda joylashadi.
export default function SettingsTab({ user, onOpenAdmin, onOpenModerator, onOpenSupport, onOpenReferral }) {
  const { t } = useTranslation();
  const isAdmin = user?.role === "ADMIN";
  const isModerator = user?.role === "MODERATOR";
  const { supportLink } = useSettings();

  return (
    <div className="flex-1 overflow-y-auto tp-safe-top pb-4 animate-fade-in">
      <h1 className="text-xl font-extrabold text-main text-center">{t("settings.title")}</h1>

      {/* Profil - band shaklida, alohida karta emas */}
      <div className="flex flex-col items-center text-center mt-5 px-5">
        <div className="w-16 h-16 rounded-full bg-accent text-accent-ink flex items-center justify-center text-2xl font-bold">
          {(user?.name || "?").slice(0, 1).toUpperCase()}
        </div>
        <p className="font-bold text-main mt-2.5">{user?.name || "—"}</p>
        <p className="text-muted text-sm">{user?.username ? `@${user.username}` : ""}</p>
      </div>

      <div className="px-5 mt-5">
        <Group>
          <LanguageRow />
          <ThemeRow />
          <FontSizeRow />
        </Group>
      </div>

      <div className="px-5 mt-3">
        <Group>
          <LeaderboardRow />
          <Row icon={Gift} label={t("settings.inviteFriends")} onClick={onOpenReferral} />
          <Row icon={HelpCircle} label={t("settings.support")} onClick={onOpenSupport} />
        </Group>
      </div>

      {supportLink && (
        <div className="px-5 mt-3">
          <button
            onClick={() => {
              const tg = window.Telegram?.WebApp;
              if (tg?.openTelegramLink && /^https:\/\/t\.me\//i.test(supportLink)) {
                tg.openTelegramLink(supportLink);
              } else if (tg?.openLink) {
                tg.openLink(supportLink);
              } else {
                window.open(supportLink, "_blank");
              }
            }}
            className="w-full rounded-2xl px-4 py-4 flex items-center gap-3 text-left active:scale-[0.99] transition-transform bg-accent"
          >
            <Send size={18} className="text-accent-ink" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-accent-ink">{t("settings.channelTitle")}</p>
              <p className="text-accent-ink/70 text-xs">{t("settings.channelSubtitle")}</p>
            </div>
            <ChevronRight size={18} className="text-accent-ink" />
          </button>
        </div>
      )}

      {(isAdmin || isModerator) && (
        <div className="px-5 mt-3">
          <Group>
            {isAdmin && <Row icon={ShieldCheck} label={t("settings.adminPanel")} onClick={onOpenAdmin} />}
            {isModerator && <Row icon={ShieldCheck} label={t("settings.moderatorPanel")} onClick={onOpenModerator} />}
          </Group>
        </div>
      )}
    </div>
  );
}

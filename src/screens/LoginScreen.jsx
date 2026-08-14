import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Check } from "../icons";
import GradientIcon from "../components/GradientIcon";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { Button, Group } from "../components/ui";
import { api, setToken } from "../api";

// Foydalanuvchi bir marta to'ldirgan ro'yxatdan o'tish anketasi shu yerda
// saqlanadi — keyingi safar ilova ochilganda forma qayta so'ralmaydi,
// Telegram orqali kirish esa har safar orqa fonda, ko'rinmas holda ketadi.
const PROFILE_KEY = "pravaol_profile";

function getSavedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage yo'q/bloklangan bo'lsa ham ilova ishlashda davom etadi —
    // bu safar shunchaki har kirishda anketa qayta chiqishi mumkin.
  }
}

const STUDY_TIME_OPTIONS = [
  { value: 10, labelKey: "login.studyTime.min10" },
  { value: 20, labelKey: "login.studyTime.min20" },
  { value: 30, labelKey: "login.studyTime.min30" },
  { value: 60, labelKey: "login.studyTime.min60" },
  { value: 90, labelKey: "login.studyTime.min90plus" },
];

// Guruh ichidagi bitta qator — chap tomonda yorliq, o'ngda tahrirlanadigan
// maydon. Eski variant har bir maydonni alohida (icon + label + input)
// blok qilib chizardi; endi Sozlamalar bo'limidagi kabi bitta yaxlit
// ro'yxat qatorlari, ilova ichida allaqachon tanish bo'lgan uslub.
function FieldRow({ label, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="text-sm font-medium text-main w-24 shrink-0">{label}</span>
      {children}
    </div>
  );
}

// 1-EKRAN: Ro'yxatdan o'tish (anketa) — Telegram orqali kirish orqa fonda ketadi
export default function LoginScreen({ onLogin, externalNotice }) {
  const { t } = useTranslation();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(externalNotice || "");

  // Anketa maydonlari
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [studyMinutes, setStudyMinutes] = useState(null);

  const savedProfile = getSavedProfile();
  // Sessiya tugagani/bloklangani sababli qaytarilgan bo'lsak, saqlangan
  // profil bo'lsa ham forma ko'rsatilmaydi (aks holda cheksiz silent-login
  // sinash aylanasiga tushib qolamiz) — lekin foydalanuvchiga nima
  // bo'lganini tushuntiramiz va qayta urinish imkoni beriladi.
  const [silentLoginFailed, setSilentLoginFailed] = useState(false);
  const needsForm = !savedProfile || silentLoginFailed;

  const performTelegramLogin = async (profile) => {
    setError("");
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;

    if (!initData) {
      setError(
        "Bu ilova faqat Telegram ichida ochilganda ishlaydi. Botdagi tugma orqali kiring."
      );
      setConnecting(false);
      return;
    }

    // Zaxira yo'l — bot.py orqali "?startapp=ref_KOD" bilan ochilgan
    // bo'lsa (imzolanmagan, oddiy URL parametri sifatida) shu yerdan
    // o'qiladi. Backend buni faqat imzolangan start_param topilmasa
    // ishlatadi.
    const fallbackStartParam = new URLSearchParams(window.location.search).get("startapp");

    setConnecting(true);
    try {
      const { token, user } = await api.loginWithTelegram(initData, profile, fallbackStartParam);
      setToken(token);
      if (profile) saveProfile(profile);
      onLogin(user);
    } catch (err) {
      setError(err.message);
      setConnecting(false);
      // Orqa fondagi (silent) urinish muvaffaqiyatsiz bo'lsa — masalan hisob
      // bloklangan bo'lsa — ilgari foydalanuvchi abadiy spinner ekranida
      // qolib ketardi, chiqish yo'li yo'q edi. Endi formaga qaytaramiz.
      if (!profile) setSilentLoginFailed(true);
    }
  };

  // Profil allaqachon saqlangan bo'lsa — foydalanuvchiga hech narsa
  // ko'rsatmasdan, ekran ochilishi bilanoq orqa fonda Telegram orqali
  // kirishni boshlaymiz (foydalanuvchi ID va @username shu yo'l bilan olinadi).
  useEffect(() => {
    if (savedProfile) {
      performTelegramLogin(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !age || !studyMinutes) return;

    const profile = {
      name: name.trim(),
      age: Number(age),
      dailyStudyMinutes: studyMinutes,
    };
    performTelegramLogin(profile);
  };

  const isFormValid = name.trim().length > 0 && age && studyMinutes;

  // Profil bor bo'lsa — orqa fondagi silent-login tugagunicha oddiy
  // yuklanish holatini ko'rsatamiz (forma umuman ko'rinmaydi).
  if (!needsForm) {
    return (
      <div className="flex flex-col h-full bg-app px-6 items-center justify-center gap-5">
        <GradientIcon size={112} />
        <span className="w-5 h-5 rounded-full border-2 border-line border-t-accent animate-spin" />
        {error && (
          <p className="text-center text-danger text-xs leading-relaxed px-2 max-w-xs">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-app overflow-y-auto">
      {/* Sarlavha — endi kompakt gorizontal qator (katta markazlashgan hero
          o'rniga), logotip va nom yonma-yon, forma uchun ko'proq joy qoladi */}
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
        <div className="flex items-center gap-3 min-w-0">
          <GradientIcon size={44} />
          <div className="min-w-0">
            <h1 className="text-[17px] font-extrabold text-main leading-tight truncate">{t("login.title")}</h1>
            <p className="text-[11px] text-muted truncate">{t("login.subtitle")}</p>
          </div>
        </div>
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="px-5 mt-6">
        <p className="text-muted text-[13px] mb-3 ml-1">{t("login.registerSubtitle")}</p>

        <form onSubmit={handleSubmit}>
          <Group>
            <FieldRow label={t("login.nameLabel")}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("login.namePlaceholder")}
                maxLength={80}
                className="flex-1 min-w-0 bg-transparent border-none px-0 py-0 text-sm text-right focus:outline-none"
              />
            </FieldRow>
            <FieldRow label={t("login.ageLabel")}>
              <input
                type="number"
                inputMode="numeric"
                min={5}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={t("login.agePlaceholder")}
                className="flex-1 min-w-0 bg-transparent border-none px-0 py-0 text-sm text-right focus:outline-none"
              />
            </FieldRow>
          </Group>

          {/* Kuniga qancha shug'ullanish — endi gorizontal suriladigan
              kapsulalar qatori, 2 ustunli katak to'ri o'rniga */}
          <p className="text-muted text-[13px] mt-5 mb-2 ml-1">{t("login.studyTimeLabel")}</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
            {STUDY_TIME_OPTIONS.map((opt) => {
              const active = studyMinutes === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setStudyMinutes(opt.value)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold border transition-colors ${
                    active ? "bg-accent text-accent-ink border-accent" : "bg-surface text-muted border-line"
                  }`}
                >
                  {active && <Check size={13} />}
                  {t(opt.labelKey)}
                </button>
              );
            })}
          </div>

          <Button type="submit" size="lg" disabled={!isFormValid || connecting} className="w-full mt-6">
            {connecting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-accent-ink/40 border-t-accent-ink animate-spin" />
                {t("login.connecting")}
              </>
            ) : (
              <>
                {t("login.registerButton")}
                <ChevronRight size={17} />
              </>
            )}
          </Button>

          <p className="text-center text-soft text-xs leading-relaxed px-2 mt-4">{t("login.consent")}</p>
          {error && <p className="text-center text-danger text-xs leading-relaxed px-2 mt-2">{error}</p>}
        </form>
      </div>

      <div className="pb-8 mt-auto pt-6 text-center text-soft text-xs">
        @{import.meta.env.VITE_BOT_USERNAME || "pravaolbot"}
      </div>
    </div>
  );
}

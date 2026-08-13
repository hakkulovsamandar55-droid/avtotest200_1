// ============================================================================
// TEMALAR — "solid flat" uslubi
//
// Ataylab FAQAT ikkita tema: Kunduzgi va Tungi. Ortiqcha rang variantlari
// (endi kerak emas deb topildi) olib tashlandi — kamroq tanlov, tezroq
// qaror, ilova ko'rinishi izchilroq bo'ladi.
// ============================================================================

export const THEMES = {
  night: {
    label: "Tungi",
    isDark: true,
    accent: "#2DD4BF",
    vars: {
      "--bg-app": "#0B0F14",
      "--bg-surface": "#141A21",
      "--bg-surface-raised": "#1B222B",
      "--bg-sunken": "#0D1218",
      "--bg-modal": "#141A21",
      "--border": "#232B35",
      "--border-strong": "#323D4A",

      "--text-primary": "#F4F7FA",
      "--text-secondary": "#94A3B3",
      "--text-tertiary": "#5C6B7A",

      "--accent": "#2DD4BF",
      "--accent-text": "#052420",
      "--accent-soft": "rgba(45,212,191,0.14)",

      "--success": "#34D399",
      "--danger": "#F87171",
      "--warning": "#FBBF24",

      "--shadow-sm": "0 2px 10px rgba(0,0,0,0.28)",
    },
  },

  day: {
    label: "Kunduzgi",
    isDark: false,
    accent: "#0D9488",
    vars: {
      "--bg-app": "#F6F7F9",
      "--bg-surface": "#FFFFFF",
      "--bg-surface-raised": "#F0F2F5",
      "--bg-sunken": "#EEF1F4",
      "--bg-modal": "#FFFFFF",
      "--border": "#E4E7EC",
      "--border-strong": "#CBD2DB",

      "--text-primary": "#101828",
      "--text-secondary": "#5B6472",
      "--text-tertiary": "#98A2B3",

      "--accent": "#0D9488",
      "--accent-text": "#FFFFFF",
      "--accent-soft": "rgba(13,148,136,0.10)",

      "--success": "#0D9488",
      "--danger": "#DC2626",
      "--warning": "#D97706",

      "--shadow-sm": "0 2px 10px rgba(16,24,40,0.06)",
    },
  },
};

export const THEME_ORDER = ["day", "night"];

export const DEFAULT_THEME = "night";

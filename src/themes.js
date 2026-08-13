// ============================================================================
// TEMALAR — "solid flat" uslubi
//
// Eski "frosted glass" (shisha, xira fon, rangli blob'lar, backdrop-filter)
// butunlay olib tashlandi. O'rniga: TEKIS, qattiq ranglar; ingichka (1px)
// chegaralar; soya deyarli yo'q yoki juda kam. Chuqurlik blur bilan emas,
// ranglar farqi va chegara bilan beriladi — bu ham tezroq (backdrop-filter
// yo'q), ham "ixcham" va aniqroq ko'rinadi.
//
// Har bir tema BITTA aksent rangga ega (gradient juftlik emas) — bu butun
// tizimni soddaroq va izchilroq qiladi: aksent qayerda ishlatilsa ham bir xil.
// ============================================================================

export const THEMES = {
  // ---- TUNGI (asosiy) ----
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

  // ---- KUNDUZGI ----
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

  // ---- SIYOH (binafsha, quyuq) ----
  ink: {
    label: "Siyoh",
    isDark: true,
    accent: "#C4B5FD",
    vars: {
      "--bg-app": "#0F0B1A",
      "--bg-surface": "#181228",
      "--bg-surface-raised": "#211A34",
      "--bg-sunken": "#100B1C",
      "--bg-modal": "#181228",
      "--border": "#2A2140",
      "--border-strong": "#3B2F58",

      "--text-primary": "#F5F3FF",
      "--text-secondary": "#A79FC2",
      "--text-tertiary": "#6C6389",

      "--accent": "#C4B5FD",
      "--accent-text": "#1E1533",
      "--accent-soft": "rgba(196,181,253,0.14)",

      "--success": "#6EE7B7",
      "--danger": "#FB7185",
      "--warning": "#FBBF24",

      "--shadow-sm": "0 2px 10px rgba(0,0,0,0.32)",
    },
  },

  // ---- CHO'L (issiq, yorug') ----
  dune: {
    label: "Cho'l",
    isDark: false,
    accent: "#B45309",
    vars: {
      "--bg-app": "#FBF6EF",
      "--bg-surface": "#FFFFFF",
      "--bg-surface-raised": "#F5EDE0",
      "--bg-sunken": "#F3EADB",
      "--bg-modal": "#FFFFFF",
      "--border": "#EBDFCB",
      "--border-strong": "#D9C6A5",

      "--text-primary": "#2A1D10",
      "--text-secondary": "#6B5A44",
      "--text-tertiary": "#A5926F",

      "--accent": "#B45309",
      "--accent-text": "#FFFFFF",
      "--accent-soft": "rgba(180,83,9,0.10)",

      "--success": "#15803D",
      "--danger": "#B91C1C",
      "--warning": "#B45309",

      "--shadow-sm": "0 2px 10px rgba(120,80,40,0.08)",
    },
  },

  // ---- O'RMON (zumrad, quyuq) ----
  forest: {
    label: "O'rmon",
    isDark: true,
    accent: "#86EFAC",
    vars: {
      "--bg-app": "#081410",
      "--bg-surface": "#0F1F19",
      "--bg-surface-raised": "#152A21",
      "--bg-sunken": "#0A1712",
      "--bg-modal": "#0F1F19",
      "--border": "#1E3A2C",
      "--border-strong": "#2A4E3A",

      "--text-primary": "#F1FBF5",
      "--text-secondary": "#8FB3A0",
      "--text-tertiary": "#587465",

      "--accent": "#86EFAC",
      "--accent-text": "#052E17",
      "--accent-soft": "rgba(134,239,172,0.14)",

      "--success": "#86EFAC",
      "--danger": "#FCA5A5",
      "--warning": "#FDE68A",

      "--shadow-sm": "0 2px 10px rgba(0,0,0,0.30)",
    },
  },
};

// Sozlamalarda ko'rinish tartibi. Kunduzgi/tungi birinchi — bular asosiy
// rejimlar, qolganlari rang varianti.
export const THEME_ORDER = ["day", "night", "ink", "dune", "forest"];

export const DEFAULT_THEME = "night";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: "var(--bg-app)",
        surface: "var(--bg-surface)",
        "surface-2": "var(--bg-surface-raised)",
        sunken: "var(--bg-sunken)",
        modal: "var(--bg-modal)",
        line: "var(--border)",
        "line-strong": "var(--border-strong)",
        main: "var(--text-primary)",
        muted: "var(--text-secondary)",
        soft: "var(--text-tertiary)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-text)",
        "accent-soft": "var(--accent-soft)",
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(28px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "slide-in": "slideInRight 0.32s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fadeIn 0.28s ease-out both",
        "pop-in": "popIn 0.22s cubic-bezier(0.16,1,0.3,1) both",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};

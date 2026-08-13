import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { LANGUAGES } from "../i18n";
import { ListRow } from "./ui";

// Til tanlovchi — ikki ko'rinishda ishlaydi:
//  variant="compact" -> Login ekrani uchun (kichik pill tugma)
//  variant="row"      -> Sozlamalar ro'yxatidagi qator sifatida
export default function LanguageSwitcher({ variant = "row" }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const currentLabel = t(`languageNames.${i18n.language}`);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const Dropdown = () => (
    <div className="absolute z-30 mt-2 w-56 rounded-2xl overflow-hidden shadow-xl right-0 bg-modal border border-line">
      {LANGUAGES.map(({ code, nativeKey }) => {
        const active = i18n.language === code;
        return (
          <button
            key={code}
            onClick={() => handleSelect(code)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-left text-main active:bg-surface-2 transition-colors"
          >
            <span>{t(`languageNames.${nativeKey}`)}</span>
            {active && <Check size={16} className="text-accent" />}
          </button>
        );
      })}
    </div>
  );

  if (variant === "compact") {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted"
        >
          <Globe size={13} />
          {currentLabel}
        </button>
        {open && <Dropdown />}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <ListRow icon={Globe} label={t("settings.language")} right={<span className="text-muted text-sm">{currentLabel}</span>} onClick={() => setOpen((o) => !o)} />
      {open && <Dropdown />}
    </div>
  );
}

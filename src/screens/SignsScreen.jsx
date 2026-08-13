import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Search, X, GraduationCap } from "lucide-react";
import { CATEGORIES, CATEGORY_META, getSignsByCategory, searchSigns, TOTAL_SIGNS } from "../data/signsData";
import SignIcon from "../components/SignIcon";
import { getSignDescription } from "../../shared/data/signDescriptions";
import SignsQuizScreen from "./SignsQuizScreen";
import { ScreenHeader, Button } from "../components/ui";

// Yo'l belgilarini o'rganish — asosiy ekran: qidiruv + kategoriyalar ro'yxati
export default function SignsScreen({ onBack }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedSign, setSelectedSign] = useState(null);
  // quizCategory: null = test yopiq, "all" = barcha belgilar, aks holda toifa kaliti
  const [quizCategory, setQuizCategory] = useState(null);

  const results = useMemo(() => searchSigns(query), [query]);

  if (quizCategory) {
    return <SignsQuizScreen category={quizCategory === "all" ? null : quizCategory} onBack={() => setQuizCategory(null)} />;
  }

  if (selectedSign) {
    return <SignDetail sign={selectedSign} onBack={() => setSelectedSign(null)} onSelectSign={setSelectedSign} />;
  }

  if (openCategory) {
    return (
      <CategoryView
        catKey={openCategory}
        onBack={() => setOpenCategory(null)}
        onSelectSign={setSelectedSign}
        onStartQuiz={() => setQuizCategory(openCategory)}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-6 bg-app min-h-full animate-slide-in">
      <ScreenHeader title={t("signs.title")} subtitle={t("signs.subtitle", { count: TOTAL_SIGNS })} onBack={onBack} />

      {/* Test — o'rganish va sinash bir ekranda. Ro'yxatdan OLDIN turadi,
          chunki qaytib kelgan foydalanuvchi ko'pincha o'qish emas, sinash
          uchun kiradi. */}
      <Button onClick={() => setQuizCategory("all")} className="w-full mb-4">
        <GraduationCap size={17} />
        {t("signsQuiz.startAll")}
      </Button>

      {/* Qidiruv */}
      <div className="relative">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("signs.searchPlaceholder")}
          className="w-full rounded-2xl bg-surface border border-line pl-11 pr-10 py-3 text-sm text-main"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center"
          >
            <X size={13} className="text-soft" />
          </button>
        )}
      </div>

      {/* Qidiruv natijalari */}
      {query ? (
        <div className="mt-4 space-y-2">
          {results.length === 0 ? (
            <p className="text-center text-muted text-sm mt-10">{t("signs.noResults")}</p>
          ) : (
            results.map((sign) => <SignRow key={sign.code} sign={sign} onClick={() => setSelectedSign(sign)} />)
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {CATEGORIES.map((catKey) => {
            const meta = CATEGORY_META[catKey];
            const items = getSignsByCategory(catKey);
            const preview = items.slice(0, 4);
            return (
              <button
                key={catKey}
                onClick={() => setOpenCategory(catKey)}
                className="w-full text-left rounded-2xl bg-surface border border-line p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: meta.bg }}>
                    <div className="w-5 h-5 rounded-md" style={{ backgroundColor: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-main text-sm">{t(`signs.categories.${catKey}`)}</p>
                    <p className="text-muted text-xs mt-0.5">{t("signs.signCount", { count: items.length })}</p>
                  </div>
                  <ChevronRight size={18} className="text-soft" />
                </div>
                <div className="flex items-center gap-2 mt-3 pl-0.5">
                  {preview.map((s) => (
                    <div key={s.code} className="w-11 h-11 rounded-xl bg-surface-2 flex items-center justify-center">
                      <SignIcon code={s.code} shape={s.shape} pic={s.pic} size={38} />
                    </div>
                  ))}
                  {items.length > 4 && (
                    <div className="w-11 h-11 rounded-xl bg-surface-2 flex items-center justify-center text-muted text-xs font-semibold">
                      +{items.length - 4}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SignRow({ sign, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 rounded-2xl bg-surface border border-line px-3.5 py-3 text-left">
      <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
        <SignIcon code={sign.code} shape={sign.shape} pic={sign.pic} size={40} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-main text-sm truncate">{sign.name}</p>
        <p className="text-muted text-xs">{sign.code}</p>
      </div>
      <ChevronRight size={16} className="text-soft" />
    </button>
  );
}

function CategoryView({ catKey, onBack, onSelectSign, onStartQuiz }) {
  const { t } = useTranslation();
  const items = getSignsByCategory(catKey);

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-6 bg-app min-h-full animate-slide-in">
      <ScreenHeader title={t(`signs.categories.${catKey}`)} subtitle={t("signs.signCount", { count: items.length })} onBack={onBack} />

      {/* Toifa bo'yicha test — bu eng samarali o'rganish yo'li: avval bitta
          toifani o'qib, keyin darhol shu toifadan sinaladi. Chalg'ituvchi
          variantlar ham shu toifadan olinadi (signsQuiz.js). */}
      {onStartQuiz && items.length >= 4 && (
        <Button onClick={onStartQuiz} size="sm" className="w-full mb-4">
          <GraduationCap size={16} />
          {t("signsQuiz.startCategory")}
        </Button>
      )}

      <div className="grid grid-cols-3 gap-3">
        {items.map((sign) => (
          <button
            key={sign.code}
            onClick={() => onSelectSign(sign)}
            className="rounded-2xl bg-surface border border-line p-2.5 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 flex items-center justify-center">
              <SignIcon code={sign.code} shape={sign.shape} pic={sign.pic} size={56} />
            </div>
            <p className="text-[10px] font-bold text-muted">{sign.code}</p>
            <p
              className="text-[11px] font-medium text-main text-center leading-tight"
              style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {sign.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SignDetail({ sign, onBack, onSelectSign }) {
  const { t, i18n } = useTranslation();
  const description = getSignDescription(sign.code, i18n.language);

  // Shu kategoriyadagi qo'shni belgilar (o'xshashlarni ko'rish uchun)
  const siblings = useMemo(() => getSignsByCategory(sign.cat).filter((s) => s.code !== sign.code).slice(0, 6), [sign]);

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-6 bg-app min-h-full animate-slide-in">
      <ScreenHeader title={t(`signs.categories.${sign.cat}`)} onBack={onBack} />

      <div className="rounded-3xl p-6 text-center bg-accent">
        <div className="w-32 h-32 mx-auto rounded-3xl bg-white flex items-center justify-center shadow-lg">
          <SignIcon code={sign.code} shape={sign.shape} pic={sign.pic} size={104} />
        </div>
        <p className="text-accent-ink/70 text-xs font-bold tracking-wide mt-4 uppercase">{sign.code}</p>
        <h2 className="text-accent-ink text-xl font-extrabold mt-1 leading-snug">{sign.name}</h2>
      </div>

      {/* Izoh: rasmiy qoidalarga tayangan qisqa tushuntirish.
          Barcha 258 belgi izohlangan, shuning uchun zaxira matn kerak emas.
          Agar kelajakda yangi belgi qo'shilsa va izohi yozilmasa, blok
          umuman ko'rsatilmaydi (bo'sh karta chiqmasligi uchun). */}
      {description && (
        <div className="mt-4 rounded-2xl bg-surface border border-line p-4">
          <p className="text-sm leading-relaxed text-main">{description}</p>
          <p className="text-[10px] mt-3 text-muted">{t("signs.sourceNote")}</p>
        </div>
      )}

      {siblings.length > 0 && (
        <>
          <p className="text-muted text-sm font-semibold mt-5 mb-2.5">{t("signs.similarSigns")}</p>
          <div className="grid grid-cols-4 gap-2.5">
            {siblings.map((s) => (
              <button
                key={s.code}
                onClick={() => onSelectSign && onSelectSign(s)}
                className="rounded-xl bg-surface border border-line p-2 flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <SignIcon code={s.code} shape={s.shape} pic={s.pic} size={40} />
                <p className="text-[9px] font-bold text-muted">{s.code}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import React from "react";
import { useTranslation } from "react-i18next";
import { Users, User } from "lucide-react";
import { ScreenHeader, Card, ListRow } from "../components/ui";

/**
 * XATOLAR BILAN ISHLASH — ikki bo'limga ajratuvchi ekran.
 *
 * NIMA UCHUN ALOHIDA EKRAN: foydalanuvchi so'roviga ko'ra bu bo'lim
 * bosilganda IKKI narsa taklif qilinadi:
 *   1) Ko'pchilik xato qiladigan savollar (global statistika)
 *   2) Mening xatolarim (shaxsiy)
 *
 * Ular butunlay boshqa manbadan keladi va boshqa maqsadga xizmat qiladi:
 * birinchisi "qaysi savollar chalg'ituvchi" ni ko'rsatadi, ikkinchisi
 * "menda nima zaif" ni. Bitta ro'yxatga qo'shib bo'lmaydi.
 */
export default function MistakesHubScreen({ onBack, onOpenCommon, onOpenMine }) {
  const { t } = useTranslation();

  const options = [
    {
      key: "common",
      icon: Users,
      title: t("mistakes.commonMistakes"),
      desc: t("mistakes.commonDesc"),
      onClick: onOpenCommon,
    },
    {
      key: "mine",
      icon: User,
      title: t("mistakes.myMistakes"),
      desc: t("mistakes.myDesc"),
      onClick: onOpenMine,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-5 tp-safe-top pb-8 animate-slide-in">
      <ScreenHeader title={t("home.mistakes")} onBack={onBack} />

      <div className="space-y-3">
        {options.map(({ key, icon, title, desc, onClick }) => (
          <Card key={key}>
            <ListRow icon={icon} label={title} sublabel={desc} onClick={onClick} />
          </Card>
        ))}
      </div>
    </div>
  );
}

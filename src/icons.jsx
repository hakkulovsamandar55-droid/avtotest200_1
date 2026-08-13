import React from "react";
import * as Ph from "@phosphor-icons/react";

// ============================================================================
// IKONKALAR — Phosphor Icons asosida, lucide-react bilan bir xil nomlar
// ostida qayta eksport qilinadi.
//
// NIMA UCHUN SHUNDAY: butun ilova bo'ylab 80+ joyda ikonka nomi bo'yicha
// import qilingan (masalan `import { ChevronLeft } from "./icons"`).
// Kutubxonani almashtirish uchun har bir chaqiruv joyini qayta yozish
// shart emas — faqat import manbasini shu faylga o'zgartirish kifoya,
// chunki bu yerda xuddi o'sha nomlar saqlanadi, faqat orqasida boshqa
// (vizual jihatdan butunlay farqli) ikonka to'plami turadi.
//
// Har bir ikonka standart "bold" og'irlikda chiziladi — lucide'ning
// yupqa chiziqlaridan farqli, qalinroq va quyuqroq ko'rinadi. Chaqiruv
// joyida `weight` prop uzatilsa, o'sha ustunlik qiladi.
// ============================================================================

function bold(Icon) {
  return function BoldIcon(props) {
    return <Icon weight="bold" {...props} />;
  };
}

export const AlertTriangle = bold(Ph.Warning);
export const Ban = bold(Ph.Prohibit);
export const BarChart3 = bold(Ph.ChartBar);
export const Bell = bold(Ph.Bell);
export const BookOpen = bold(Ph.BookOpen);
export const Bookmark = bold(Ph.Bookmark);
export const BookmarkCheck = bold(Ph.BookmarkSimple);
export const Bot = bold(Ph.Robot);
export const Cake = bold(Ph.Cake);
export const CalendarDays = bold(Ph.CalendarDots);
export const Check = bold(Ph.Check);
export const CheckCheck = bold(Ph.Checks);
export const CheckCircle2 = bold(Ph.CheckCircle);
export const ChevronDown = bold(Ph.CaretDown);
export const ChevronLeft = bold(Ph.CaretLeft);
export const ChevronRight = bold(Ph.CaretRight);
export const ChevronUp = bold(Ph.CaretUp);
export const CircleParking = bold(Ph.Car);
export const ClipboardCheck = bold(Ph.ClipboardText);
export const Clock = bold(Ph.Clock);
export const Copy = bold(Ph.Copy);
export const CornerUpRight = bold(Ph.ArrowBendUpRight);
export const CreditCard = bold(Ph.CreditCard);
export const Crown = bold(Ph.Crown);
export const Eye = bold(Ph.Eye);
export const EyeOff = bold(Ph.EyeSlash);
export const Flame = bold(Ph.Flame);
export const Footprints = bold(Ph.Footprints);
export const Frown = bold(Ph.SmileySad);
export const Gauge = bold(Ph.Gauge);
export const Gift = bold(Ph.Gift);
export const GitFork = bold(Ph.GitFork);
export const Globe = bold(Ph.Globe);
export const GraduationCap = bold(Ph.GraduationCap);
export const Handshake = bold(Ph.Handshake);
export const HeartPulse = bold(Ph.Heartbeat);
export const HelpCircle = bold(Ph.Question);
export const History = bold(Ph.ClockCounterClockwise);
export const Home = bold(Ph.House);
export const Image = bold(Ph.Image);
export const Info = bold(Ph.Info);
export const Layers = bold(Ph.Stack);
export const Link2 = bold(Ph.Link);
export const ListChecks = bold(Ph.ListChecks);
export const Loader2 = bold(Ph.CircleNotch);
export const Lock = bold(Ph.Lock);
export const MessageCircle = bold(Ph.ChatCircle);
export const Minus = bold(Ph.Minus);
export const MinusCircle = bold(Ph.MinusCircle);
export const Package = bold(Ph.Package);
export const PartyPopper = bold(Ph.Confetti);
export const Pencil = bold(Ph.PencilSimple);
export const Percent = bold(Ph.Percent);
export const Play = bold(Ph.Play);
export const RotateCcw = bold(Ph.ArrowCounterClockwise);
export const Save = bold(Ph.FloppyDisk);
export const Scale = bold(Ph.Scales);
export const Search = bold(Ph.MagnifyingGlass);
export const Send = bold(Ph.PaperPlaneTilt);
export const Settings = bold(Ph.Gear);
export const ShieldCheck = bold(Ph.ShieldCheck);
export const ShieldOff = bold(Ph.ShieldSlash);
export const Shuffle = bold(Ph.Shuffle);
export const Signpost = bold(Ph.Signpost);
export const SlidersHorizontal = bold(Ph.SlidersHorizontal);
export const Sparkles = bold(Ph.Sparkle);
export const Swords = bold(Ph.Sword);
export const Target = bold(Ph.Target);
export const Timer = bold(Ph.Timer);
export const TrafficCone = bold(Ph.TrafficCone);
export const Train = bold(Ph.Train);
export const Trash2 = bold(Ph.Trash);
export const TrendingDown = bold(Ph.TrendDown);
export const TrendingUp = bold(Ph.TrendUp);
export const TriangleAlert = bold(Ph.Warning);
export const Trophy = bold(Ph.Trophy);
export const Unlock = bold(Ph.LockOpen);
export const Upload = bold(Ph.Upload);
export const User = bold(Ph.User);
export const UserCircle2 = bold(Ph.UserCircle);
export const UserPlus = bold(Ph.UserPlus);
export const Users = bold(Ph.Users);
export const Wrench = bold(Ph.Wrench);
export const X = bold(Ph.X);
export const XCircle = bold(Ph.XCircle);
export const Zap = bold(Ph.Lightning);

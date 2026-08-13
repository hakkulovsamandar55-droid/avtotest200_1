import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, Crown } from "../../icons";
import { api } from "../../api";
import { Card } from "../../components/ui";

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

// Mini-admin (MODERATOR) uchun foydalanuvchilar ro'yxati — ATAYLAB faqat
// asosiy ma'lumot: ism, username, premium holati, ro'yxatdan o'tgan sana.
// Telefon, faollik, tayyorgarlik va h.k. bu yerda YO'Q (ADMIN'ning to'liq
// profiliga qarang) — moderator faqat "kimlar bor, premiummi" ko'rishi kerak.
export default function ModeratorUsersTab() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      api.getModeratorUsers(query).then((data) => setUsers(data.users)).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div>
      <div className="relative mb-3">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("admin.moderator.searchPlaceholder")}
          className="w-full rounded-2xl bg-surface border border-line pl-11 pr-10 py-3 text-sm"
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

      <p className="text-muted text-xs mb-3 ml-1">{loading ? "..." : t("admin.resultsCount", { count: users.length })}</p>

      <div className="space-y-2.5">
        {users.map((user) => (
          <Card key={user.id} className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-11 h-11 rounded-full bg-accent text-accent-ink flex items-center justify-center text-sm font-bold shrink-0">
              {initials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-main text-sm truncate flex items-center gap-1.5">
                {user.name}
                {user.isPremium && <Crown size={13} className="text-warning" />}
              </p>
              <p className="text-muted text-xs truncate">{user.username ? `@${user.username}` : "—"}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-muted text-[11px]">{fmtDate(user.createdAt)}</p>
            </div>
          </Card>
        ))}
        {!loading && users.length === 0 && <p className="text-center text-muted text-sm mt-10">{t("admin.noResults")}</p>}
      </div>
    </div>
  );
}

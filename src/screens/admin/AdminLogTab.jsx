import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../api";
import { Card } from "../../components/ui";

const ACTION_ICONS = {
  PREMIUM_GRANTED: "👑",
  PREMIUM_REMOVED: "❌",
  PREMIUM_EXTENDED: "⏳",
  DISCOUNT_GRANTED: "🏷️",
  DISCOUNT_REMOVED: "🏷️",
  USER_BLOCKED: "🚫",
  USER_UNBLOCKED: "🔓",
  ADMIN_GRANTED: "🛡️",
  ADMIN_REMOVED: "🛡️",
  ACCOUNT_DELETED: "🗑️",
  PAYMENT_APPROVED: "✅",
  PAYMENT_REJECTED: "❌",
  SUPPORT_REPLIED: "💬",
  SUPPORT_CLOSED: "🔒",
  SUPPORT_REOPENED: "🔓",
  BROADCAST_SENT: "📢",
};

function fmt(iso) {
  return new Date(iso).toLocaleString();
}

// Admin tomoni: har bir admin harakati jurnali (spec 13-bo'lim)
export default function AdminLogTab() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminLogs().then((data) => setLogs(data.logs || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="font-bold text-main text-sm mb-3">{t("admin.logs.title")}</p>
      <div className="space-y-2">
        {logs.map((log) => (
          <Card key={log.id} className="px-4 py-3 flex items-start gap-3">
            <span className="text-base leading-none mt-0.5">{ACTION_ICONS[log.action] || "•"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-main text-xs font-semibold">
                {log.actorName} — {log.action.replaceAll("_", " ")}
                {log.targetLabel ? ` → ${log.targetLabel}` : ""}
              </p>
              {log.details && <p className="text-muted text-[11px] mt-0.5">{log.details}</p>}
              <p className="text-muted text-[10px] mt-0.5">{fmt(log.createdAt)}</p>
            </div>
          </Card>
        ))}
        {!loading && logs.length === 0 && <p className="text-center text-muted text-sm mt-10">{t("admin.logs.noLogs")}</p>}
      </div>
    </div>
  );
}

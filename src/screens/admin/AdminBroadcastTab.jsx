import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "../../icons";
import { api } from "../../api";
import { Button } from "../../components/ui";

// Admin tomoni: ommaviy xabar yuborish (spec 12-bo'lim)
export default function AdminBroadcastTab() {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const audiences = [
    { key: "ALL", label: t("admin.broadcast.audienceAll") },
    { key: "PREMIUM", label: t("admin.broadcast.audiencePremium") },
    { key: "BLOCKED", label: t("admin.broadcast.audienceBlocked") },
  ];

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    setError("");
    setResult(null);
    try {
      const data = await api.sendBroadcast(text.trim(), audience);
      setResult(data.recipientCount);
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <p className="font-bold text-main text-sm mb-3">{t("admin.broadcast.title")}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {audiences.map((a) => {
          const active = audience === a.key;
          return (
            <button
              key={a.key}
              onClick={() => setAudience(a.key)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-transform active:scale-95 border ${
                active ? "bg-accent text-accent-ink border-accent" : "bg-surface-2 text-main border-line"
              }`}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("admin.broadcast.textPlaceholder")}
        rows={5}
        className="w-full rounded-2xl bg-surface border border-line px-4 py-3 text-sm resize-none mb-3"
      />

      {error && <p className="text-danger text-xs mb-3">{error}</p>}
      {result != null && <p className="text-success text-xs font-semibold mb-3">{t("admin.broadcast.sent", { count: result })}</p>}

      <Button onClick={handleSend} disabled={!text.trim() || sending} size="lg" className="w-full">
        <Send size={16} /> {t("admin.broadcast.send")}
      </Button>
    </div>
  );
}

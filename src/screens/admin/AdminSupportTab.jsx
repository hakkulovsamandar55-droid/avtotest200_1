import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ChevronLeft, Send, Image as ImageIcon, Lock, Unlock, UserCircle2 } from "lucide-react";
import { api, resolveUploadUrl } from "../../api";
import { Card } from "../../components/ui";

function initials(name) {
  return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ConversationRow({ conv, onClick }) {
  return (
    <Card onClick={onClick} className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-11 h-11 rounded-full bg-accent text-accent-ink flex items-center justify-center text-sm font-bold shrink-0">
        {initials(conv.user.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-bold text-main text-sm truncate">{conv.user.name}</p>
          {conv.status === "CLOSED" && <Lock size={11} className="text-soft" />}
        </div>
        <p className="text-muted text-xs truncate">{conv.lastMessage ? conv.lastMessage.text || "📷 Rasm" : "—"}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-muted text-[10px] mb-1">{timeAgo(conv.lastMessageAt)}</p>
        {conv.unreadForAdmin > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-accent-ink px-1 bg-accent">
            {conv.unreadForAdmin}
          </span>
        )}
      </div>
    </Card>
  );
}

function ConversationDetail({ conversationId, onBack, onOpenProfile }) {
  const { t } = useTranslation();
  const [conv, setConv] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  function load() {
    api.getConversation(conversationId).then(setConv);
  }

  useEffect(() => {
    load();
  }, [conversationId]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [conv?.messages?.length]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    const value = text.trim();
    setText("");
    try {
      const { message } = await api.replyToConversation(conversationId, value);
      setConv((prev) => ({ ...prev, messages: [...prev.messages, message] }));
    } finally {
      setSending(false);
    }
  }

  async function handleImage(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setSending(true);
    try {
      const { message } = await api.replyToConversationImage(conversationId, file);
      setConv((prev) => ({ ...prev, messages: [...prev.messages, message] }));
    } finally {
      setSending(false);
    }
  }

  async function toggleStatus() {
    const next = conv.status === "OPEN" ? "CLOSED" : "OPEN";
    await api.setConversationStatus(conversationId, next);
    setConv((prev) => ({ ...prev, status: next }));
  }

  if (!conv) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted text-sm">...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-app">
      <div className="flex items-center gap-3 px-5 tp-safe-top pb-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center shrink-0">
          <ChevronLeft size={20} className="text-soft" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-main text-sm truncate">{conv.user.name}</p>
          <p className="text-muted text-xs truncate">{conv.user.username ? `@${conv.user.username}` : conv.user.telegramId}</p>
        </div>
        <button
          onClick={() => onOpenProfile(conv.user.id)}
          className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center shrink-0"
          title={t("admin.support.openProfile")}
        >
          <UserCircle2 size={18} className="text-soft" />
        </button>
        <button onClick={toggleStatus} className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center shrink-0">
          {conv.status === "OPEN" ? <Lock size={16} className="text-soft" /> : <Unlock size={16} className="text-soft" />}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-2">
        {conv.messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "ADMIN" ? "justify-end" : "justify-start"} mb-2.5`}>
            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${m.sender === "ADMIN" ? "bg-accent" : "bg-surface border border-line"}`}>
              {m.imageUrl && <img src={resolveUploadUrl(m.imageUrl)} alt="" className="rounded-xl mb-1.5 max-w-full max-h-64 object-cover" />}
              {m.text && (
                <p className={`text-sm leading-snug whitespace-pre-wrap ${m.sender === "ADMIN" ? "text-accent-ink" : "text-main"}`}>{m.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {conv.status === "CLOSED" ? (
        <div className="mx-4 mb-4 rounded-2xl bg-surface-2 border border-line px-4 py-3 text-center">
          <p className="text-muted text-xs">{t("admin.support.filterClosed")}</p>
        </div>
      ) : (
        <div className="px-4 pb-4 pt-2 flex items-end gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="w-11 h-11 rounded-full bg-surface border border-line flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            <ImageIcon size={18} className="text-soft" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t("admin.support.replyPlaceholder")}
            rows={1}
            className="flex-1 rounded-2xl px-4 py-3 text-sm resize-none max-h-28"
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="w-11 h-11 rounded-full bg-accent flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            <Send size={17} className="text-accent-ink" />
          </button>
        </div>
      )}
    </div>
  );
}

// Admin tomoni: qo'llab-quvvatlash moduli (spec 1-bo'lim, admin qismi)
export default function AdminSupportTab({ onOpenProfile }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  function load() {
    setLoading(true);
    api
      .getConversations({ ...(filter ? { status: filter } : {}), ...(query ? { query } : {}) })
      .then((data) => setConversations(data.conversations))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const handle = setTimeout(load, 250);
    return () => clearTimeout(handle);
  }, [filter, query]);

  useEffect(() => {
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [filter, query]);

  if (activeId) {
    return (
      <ConversationDetail
        conversationId={activeId}
        onBack={() => {
          setActiveId(null);
          load();
        }}
        onOpenProfile={onOpenProfile}
      />
    );
  }

  return (
    <div>
      <div className="relative mb-3">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("admin.support.searchPlaceholder")}
          className="w-full rounded-2xl bg-surface border border-line pl-11 pr-4 py-3 text-sm"
        />
      </div>

      <div className="flex gap-2 mb-3">
        {[
          { key: "", label: t("admin.support.filterAll") },
          { key: "OPEN", label: t("admin.support.filterOpen") },
          { key: "CLOSED", label: t("admin.support.filterClosed") },
        ].map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors border ${
                active ? "bg-accent text-accent-ink border-accent" : "bg-surface-2 text-muted border-line"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5">
        {conversations.map((c) => (
          <ConversationRow key={c.id} conv={c} onClick={() => setActiveId(c.id)} />
        ))}
        {!loading && conversations.length === 0 && <p className="text-center text-muted text-sm mt-10">{t("admin.support.noConversations")}</p>}
      </div>
    </div>
  );
}

import React from "react";
import { ChevronRight } from "../../icons";

/**
 * Sozlamalar/admin ro'yxatlarida ishlatiladigan qator: ikonka + matn + o'ng
 * tomonda chevron yoki custom kontrol (switch, badge va h.k.).
 */
export default function ListRow({ icon: Icon, label, sublabel, onClick, right, danger }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${
        onClick ? "active:bg-surface-2 transition-colors" : ""
      }`}
    >
      {Icon && (
        <span
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            danger ? "bg-danger/10" : "bg-accent-soft"
          }`}
        >
          <Icon size={17} className={danger ? "text-danger" : "text-accent"} />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className={`block text-sm font-medium truncate ${danger ? "text-danger" : "text-main"}`}>
          {label}
        </span>
        {sublabel && <span className="block text-xs text-muted truncate mt-0.5">{sublabel}</span>}
      </span>
      {right !== undefined ? right : onClick ? <ChevronRight size={16} className="text-soft shrink-0" /> : null}
    </Tag>
  );
}

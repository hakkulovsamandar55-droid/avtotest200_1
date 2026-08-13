import React from "react";

export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <span className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center mb-4">
          <Icon size={24} className="text-soft" />
        </span>
      )}
      {title && <p className="text-sm font-semibold text-main">{title}</p>}
      {subtitle && <p className="text-xs text-muted mt-1.5 max-w-[240px]">{subtitle}</p>}
    </div>
  );
}

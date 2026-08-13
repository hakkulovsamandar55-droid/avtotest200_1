import React from "react";

/**
 * Guruhlangan ro'yxat konteyneri — iOS Sozlamalar uslubida: bitta yaxlit
 * yumaloq chegara, ichidagi qatorlar ingichka chiziq bilan ajratiladi.
 * Har bir qator o'z alohida kartasiga o'ralmaydi (eski uslubdan farqi shu).
 */
export default function Group({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-surface border border-line divide-y divide-line overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

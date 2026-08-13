import React from "react";

/**
 * Asosiy panel — tekis fon + ingichka chegara. `onClick` berilsa avtomatik
 * `<button>` sifatida render qilinadi (bosiladigan karta), aks holda `<div>`.
 */
export default function Card({ onClick, className = "", children, ...props }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`rounded-2xl bg-surface border border-line ${
        onClick ? "text-left w-full active:scale-[0.985] transition-transform" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

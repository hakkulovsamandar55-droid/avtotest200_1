import React from "react";

const VARIANTS = {
  primary: "bg-accent text-accent-ink",
  secondary: "bg-surface border border-line text-main",
  ghost: "bg-transparent text-main",
  danger: "bg-danger text-white",
};

const SIZES = {
  md: "px-4 py-3 text-sm rounded-xl",
  lg: "px-5 py-3.5 text-[15px] rounded-2xl",
  sm: "px-3 py-2 text-xs rounded-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`font-semibold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

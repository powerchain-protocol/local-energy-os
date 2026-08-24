"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../lib/cn";

export type ButtonVariant = "dark-green" | "onyx" | "black" | "white" | "red" | "framed" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  "dark-green": "border-emerald-900 bg-emerald-900 text-white shadow-[0_8px_20px_rgba(6,78,59,.14)] hover:border-emerald-800 hover:bg-emerald-800 hover:shadow-[0_12px_28px_rgba(6,78,59,.2)]",
  onyx: "border-[#171c1a] bg-[#171c1a] text-white hover:bg-[#242b28]",
  black: "border-black bg-black text-white hover:bg-zinc-800",
  white: "border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300 hover:bg-slate-50",
  red: "border-red-600 bg-red-600 text-white hover:bg-red-500",
  framed: "border-[var(--border)] bg-transparent text-[var(--text)] hover:border-emerald-800/35 hover:bg-emerald-950/[.04]",
  ghost: "border-transparent bg-transparent text-[var(--text)] hover:bg-black/[.045] dark:hover:bg-white/[.06]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
  icon: "h-10 w-10 p-0",
};

export function buttonClassName({
  variant = "dark-green",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-[13px] border font-semibold transition-[transform,background-color,border-color,box-shadow,color] duration-150 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[.985] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/15 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant = "dark-green",
  size = "md",
  className,
  type = "button",
  loading = false,
  loadingLabel = "Loading",
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {loading ? loadingLabel : children}
    </button>
  );
}

export function ButtonLink({
  variant = "dark-green",
  size = "md",
  className,
  children,
  ...props
}: LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children?: ReactNode;
  }) {
  return (
    <Link className={buttonClassName({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}

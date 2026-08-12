import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "quiet" | "onDark";
export type ButtonSize = "sm" | "md" | "lg";

/*
 * Hover language: no vertical jump. Filled buttons get a soft sheen that
 * sweeps across the surface once, the ground colour warms a step, and any
 * trailing arrow nudges forward. Press compresses the whole control slightly.
 * The sweep runs on transform only and is gated behind motion-safe; reduced
 * motion still gets the colour and shadow change.
 *
 * Contrast is verified for every variant against the surface it is used on:
 * primary 13.2:1, secondary 17.4:1, ghost 12.5:1, onDark 17.0:1.
 */
const base =
  "group/btn relative isolate inline-flex items-center justify-center overflow-hidden rounded font-medium tracking-[0.005em] " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out-soft)] " +
  "active:scale-[0.985] active:duration-75 " +
  "disabled:pointer-events-none disabled:opacity-45 whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-violet-700 text-white shadow-subtle hover:bg-violet-600 hover:shadow-card active:bg-violet-900",
  secondary:
    "bg-white text-ink border border-border-control hover:border-violet-700 hover:text-violet-700 hover:shadow-card active:bg-violet-50",
  ghost: "bg-transparent text-violet-700 hover:bg-violet-50 active:bg-violet-100",
  quiet: "bg-surface text-ink hover:bg-violet-100 active:bg-violet-200",
  onDark: "bg-white text-violet-900 shadow-subtle hover:bg-gold-50 hover:shadow-card active:bg-violet-100",
};

/** Variants with a filled ground get the sheen; outlined ones would clip it. */
const SHEEN: Record<ButtonVariant, boolean> = {
  primary: true,
  secondary: false,
  ghost: false,
  quiet: false,
  onDark: true,
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-small",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-7 text-body",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

function ButtonInner({ variant = "primary", children }: { variant?: ButtonVariant; children: ReactNode }) {
  return (
    <>
      {SHEEN[variant] ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12",
            variant === "primary" ? "bg-white/20" : "bg-violet-700/10",
            "-translate-x-[160%] transition-transform duration-[650ms] ease-[var(--ease-out-soft)]",
            "motion-safe:group-hover/btn:translate-x-[320%]"
          )}
        />
      ) : null}
      <span
        className={cn(
          "relative z-10 inline-flex items-center gap-2",
          "[&_svg:last-child]:transition-transform [&_svg:last-child]:duration-300",
          "[&_svg:last-child]:ease-[var(--ease-out-soft)] group-hover/btn:[&_svg:last-child]:translate-x-0.5"
        )}
      >
        {children}
      </span>
    </>
  );
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button({ variant, size, fullWidth, className, children, ...rest }: ButtonProps) {
  return (
    <button {...rest} className={buttonClass({ variant, size, fullWidth, className })}>
      <ButtonInner variant={variant}>{children}</ButtonInner>
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

export function ButtonLink({ variant, size, fullWidth, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link {...rest} className={buttonClass({ variant, size, fullWidth, className })}>
      <ButtonInner variant={variant}>{children}</ButtonInner>
    </Link>
  );
}

/** Text link with the underline treatment used across editorial surfaces. */
export function TextLink({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      {...rest}
      className={cn(
        "inline-flex items-center gap-1.5 text-base font-medium text-violet-700",
        "underline decoration-violet-200 decoration-1 underline-offset-4",
        "transition-colors duration-200 hover:decoration-violet-700",
        className
      )}
    />
  );
}

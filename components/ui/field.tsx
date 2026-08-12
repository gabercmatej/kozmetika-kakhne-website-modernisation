import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Warning } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded border bg-white px-3.5 text-body text-ink placeholder:text-faint " +
  "transition-colors duration-200 " +
  "focus:border-violet-700 focus:outline-2 focus:outline-offset-2 focus:outline-violet-500 " +
  "disabled:bg-surface disabled:text-muted";

/** Label above, helper below it, error below the control. Never a placeholder label. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-faint">neobvezno</span> : null}
      </label>
      {hint ? (
        <p id={`${htmlFor}-hint`} className="-mt-1 text-small text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          className="flex items-start gap-1.5 text-small font-medium text-danger"
        >
          <Warning size={15} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  invalid,
  ...rest
}: ComponentPropsWithoutRef<"input"> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(
        control,
        "h-11",
        invalid ? "border-danger bg-danger-soft" : "border-border-control",
        className
      )}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...rest
}: ComponentPropsWithoutRef<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(
        control,
        "min-h-28 py-3 leading-relaxed",
        invalid ? "border-danger bg-danger-soft" : "border-border-control",
        className
      )}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...rest
}: ComponentPropsWithoutRef<"select"> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        {...rest}
        aria-invalid={invalid || undefined}
        className={cn(
          control,
          "h-11 appearance-none pr-10",
          invalid ? "border-danger bg-danger-soft" : "border-border-control",
          className
        )}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/**
 * Checkbox and radio share one 44px-tall row so touch targets are consistent.
 *
 * The control is a real input kept visually hidden with `peer`, and the box is
 * a sibling span carrying an inline SVG tick. An earlier version styled the
 * input directly with `checked:bg-[url(<inline svg>)]`, which silently lost to
 * `checked:bg-violet-700` during class merging: the filter worked but never
 * looked checked. Drawing the mark as real markup removes that whole class of
 * failure and keeps the tick crisp at any zoom.
 */
export function Choice({
  type = "checkbox",
  label,
  description,
  count,
  className,
  ...rest
}: ComponentPropsWithoutRef<"input"> & {
  type?: "checkbox" | "radio";
  label: string;
  description?: string;
  count?: number;
}) {
  return (
    <label
      className={cn(
        "group flex min-h-11 cursor-pointer items-center gap-3 py-1.5 text-base text-ink",
        rest.disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input {...rest} type={type} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "relative flex h-[19px] w-[19px] shrink-0 items-center justify-center border bg-white",
          "border-border-control transition-[background-color,border-color] duration-150",
          "group-hover:border-violet-500",
          type === "radio" ? "rounded-full" : "rounded-xs",
          "peer-checked:border-violet-700 peer-checked:bg-violet-700",
          // The mark is a child of this span, so it is driven from here.
          "peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100",
          "peer-checked:[&>span]:scale-100",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-500"
        )}
      >
        {type === "checkbox" ? (
          <svg
            viewBox="0 0 16 16"
            className="h-3 w-3 scale-50 text-white opacity-0 transition-[opacity,transform] duration-150 ease-[var(--ease-out-soft)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8.4l3.2 3.2L13 4.8" />
          </svg>
        ) : (
          <span className="h-1.5 w-1.5 scale-0 rounded-full bg-white transition-transform duration-150" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
        <span className="min-w-0">
          <span className="block truncate group-hover:text-violet-700">{label}</span>
          {description ? (
            <span className="block text-small text-muted">{description}</span>
          ) : null}
        </span>
        {count !== undefined ? (
          <span className="shrink-0 text-small tabular-nums text-faint">
            {count}
            <span className="sr-only"> izdelkov</span>
          </span>
        ) : null}
      </span>
    </label>
  );
}

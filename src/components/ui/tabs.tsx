"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "./cn";
import { useI18n } from "@/i18n/provider";

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

/**
 * Underlined tab list (ARIA tabs pattern). Arrow keys follow reading
 * direction, so they work naturally in RTL.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  idBase,
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  idBase: string;
  className?: string;
}) {
  const { dir } = useI18n();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    let next = -1;
    if (e.key === forward) next = (i + 1) % items.length;
    if (e.key === backward) next = (i - 1 + items.length) % items.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      onChange(items[next].value);
      refs.current[next]?.focus();
    }
  };

  return (
    <div role="tablist" aria-label={label} className={cn("flex border-b border-line", className)}>
      {items.map((item, i) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${idBase}-tab-${item.value}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative flex-1 px-3 py-3.5 text-[0.95rem] font-medium transition-colors",
              selected ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {item.label}
            <span
              aria-hidden
              className={cn(
                "absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-primary transition-[width]",
                selected ? "w-12" : "w-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  idBase,
  value,
  children,
}: {
  idBase: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div role="tabpanel" id={`${idBase}-panel`} aria-labelledby={`${idBase}-tab-${value}`}>
      {children}
    </div>
  );
}

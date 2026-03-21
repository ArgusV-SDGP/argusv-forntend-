"use client";

import { useEffect, useRef } from "react";

export function ScanLine({ color }: { color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.top = "0%";
    el.style.opacity = "0.8";
    const id = requestAnimationFrame(() => {
      el.style.transition = "top 1.1s linear, opacity 0.3s ease";
      el.style.top = "100%";
      el.style.opacity = "0";
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      ref={ref}
      className="absolute left-0 w-full h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
    />
  );
}

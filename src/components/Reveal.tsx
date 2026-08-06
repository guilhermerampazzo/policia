"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveal on scroll — progressivo: o conteúdo nasce VISÍVEL no HTML
 * (SSR/SEO/capturas) e o JS apenas esconde + revela ao entrar na viewport.
 * Sem JS, ou com observer indisponível, tudo permanece visível.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer" | "figure";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [estado, setEstado] = useState<"pronto" | "in">("pronto");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setEstado("in");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setEstado("in");
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag
      ref={ref as any}
      data-estado={estado}
      className={`reveal ${estado === "in" ? "in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

type Tool = {
  href: string;
  label: string;
  detail: string;
  image: string;
  icon: string;
};

export default function MentorToolRail({ tools }: { tools: Tool[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const syncArrows = () => {
    const rail = railRef.current;
    if (!rail) return;
    setCanPrev(rail.scrollLeft > 4);
    setCanNext(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  };

  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows);
    return () => window.removeEventListener("resize", syncArrows);
  }, []);

  const move = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(280, rail.clientWidth * 0.82), behavior: "smooth" });
    window.setTimeout(syncArrows, 280);
  };

  return (
    <div className="mentor-carousel">
      <button
        type="button"
        className="mentor-carousel-arrow mentor-carousel-arrow-prev"
        aria-label="Voltar cards do arsenal"
        disabled={!canPrev}
        onClick={() => move(-1)}
      >
        <Icon name="chevron" size={22} />
      </button>
      <div ref={railRef} className="mentor-tool-rail" onScroll={syncArrows}>
        {tools.map((f, index) => (
          <Link key={f.href} href={f.href} className="mentor-tool-card" style={{ backgroundImage: `url('${f.image}')` }}>
            <div className="mentor-tool-overlay" />
            <span className="mentor-tool-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="mentor-tool-icon"><Icon name={f.icon} size={17} /></span>
            <div className="mentor-tool-copy">
              <span>{f.detail}</span>
              <h3>{f.label}</h3>
              <span className="mentor-tool-cta">Abrir ferramenta <b>↗</b></span>
            </div>
          </Link>
        ))}
      </div>
      <button
        type="button"
        className="mentor-carousel-arrow mentor-carousel-arrow-next"
        aria-label="Avançar cards do arsenal"
        disabled={!canNext}
        onClick={() => move(1)}
      >
        <Icon name="chevron" size={22} />
      </button>
    </div>
  );
}

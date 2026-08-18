"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

export default function RailArrows({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [prev, setPrev] = useState(false);
  const [next, setNext] = useState(false);
  function sync() {
    const rail = ref.current;
    if (!rail) return;
    setPrev(rail.scrollLeft > 4);
    setNext(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }
  useEffect(() => { sync(); window.addEventListener("resize", sync); return () => window.removeEventListener("resize", sync); }, []);
  function move(direction: -1 | 1) {
    ref.current?.scrollBy({ left: direction * Math.max(280, (ref.current?.clientWidth ?? 400) * .8), behavior: "smooth" });
    window.setTimeout(sync, 300);
  }
  return <div className="rail-arrows"><button type="button" className="rail-arrow rail-arrow-prev" aria-label={`Voltar em ${label}`} disabled={!prev} onClick={() => move(-1)}><Icon name="chevron" size={20} /></button><div ref={ref} className="nf-rail" onScroll={sync}>{children}</div><button type="button" className="rail-arrow rail-arrow-next" aria-label={`Avançar em ${label}`} disabled={!next} onClick={() => move(1)}><Icon name="chevron" size={20} /></button></div>;
}

"use client";

import { useEffect, useState } from "react";
import { formatBrasiliaTime } from "@/lib/brasilia-time";

export function BrasiliaClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const formatted = now ? formatBrasiliaTime(now) : null;

  return (
    <time
      className="topbar-clock"
      dateTime={now?.toISOString()}
      aria-label={
        formatted
          ? `Horário de Brasília: ${formatted.date} às ${formatted.time}`
          : "Carregando horário de Brasília"
      }
      title="Horário de Brasília"
    >
      <span className="clock-date">{formatted?.date ?? "--/--/----"}</span>
      <span className="clock-time">
        {formatted?.time ?? "--:--:--"}
        <span className="clock-zone">Brasília</span>
      </span>
    </time>
  );
}

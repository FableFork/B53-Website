"use client";

import { useEffect, useState } from "react";

export default function LiveClock({ className }: { className?: string }) {
  const [time, setTime] = useState("GST 00:00:00");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setTime(`GST ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className={className} suppressHydrationWarning>{time}</span>;
}

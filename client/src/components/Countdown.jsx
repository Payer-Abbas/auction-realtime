import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function Countdown({ startAt, endAt }) {
  const [now, setNow] = useState(Date.now());

  const startMs = dayjs(startAt).valueOf();
  const endMs = dayjs(endAt).valueOf();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;

  // small buffer to avoid boundary flicker
  const beforeStart = now + 500 < startMs;
  const during = now >= startMs && now < endMs;

  const secs = beforeStart
    ? Math.max(0, Math.floor((startMs - now) / 1000))
    : during
    ? Math.max(0, Math.floor((endMs - now) / 1000))
    : 0;

  const label = beforeStart
    ? "⏳ Auction starts in"
    : during
    ? "🔥 Auction ends in"
    : "✅ Auction ended";

  if (!beforeStart && !during) return <span>{label}</span>;
  return <span>{label} {format(secs)}</span>;
}

function format(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

"use client";

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactElement } from "react";
import { emit } from "@/lib/bus";

const INK = "#4a3558";

export function Sparkle({ color = "#fff1a8", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1c1 6 5 10 11 11-6 1-10 5-11 11-1-6-5-10-11-11 6-1 10-5 11-11z" fill={color} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function Heart({ color = "#ff9ec7", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21C7 17 2 14 2 8.5A5 5 0 0 1 12 6a5 5 0 0 1 10 2.5C22 14 17 17 12 21z" fill={color} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function Cloud({ size = 90 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 80 44" aria-hidden="true">
      <path d="M18 40h46a12 12 0 0 0 0-24 16 16 0 0 0-30-4A13 13 0 0 0 18 40z" fill="#fffaf3" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M26 30c2 2 5 2 7 0M46 30c2 2 5 2 7 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="22" cy="33" rx="3" ry="1.8" fill="#ff9ec7" />
      <ellipse cx="58" cy="33" rx="3" ry="1.8" fill="#ff9ec7" />
    </svg>
  );
}

function Duck() {
  return (
    <svg width="70" height="64" viewBox="0 0 70 64" aria-hidden="true">
      <path d="M20 28a14 14 0 1 1 26 7c8-2 18-4 20 3 2 12-12 22-30 22S6 54 8 42c1-7 8-8 14-6-2-2-2-5-2-8z" fill="#fff1a8" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M44 24c6-2 12 0 14 3-4 3-10 3-14 1z" fill="#ffb27a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="37" cy="20" r="2.6" fill={INK} />
      <ellipse cx="33" cy="27" rx="3.2" ry="2" fill="#ff9ec7" />
      <path d="M22 46c6 5 14 5 20 1" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Cherry() {
  return (
    <svg width="54" height="58" viewBox="0 0 54 58" aria-hidden="true">
      <path d="M17 36C20 20 28 10 40 4M37 38C36 24 38 14 40 4" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 4c6 0 10 4 11 9-7 1-11-3-11-9z" fill="#8fe0b5" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="15" cy="42" r="10" fill="#ff9ec7" stroke={INK} strokeWidth="2.5" />
      <circle cx="37" cy="44" r="10" fill="#ff9ec7" stroke={INK} strokeWidth="2.5" />
      <path d="M10 39a4 4 0 0 1 4-3M32 41a4 4 0 0 1 4-3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Floppy() {
  return (
    <svg width="54" height="54" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M6 6h30l6 6v30H6z" fill="#b9a3ff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="13" y="6" width="18" height="11" fill="#e4d9ff" stroke={INK} strokeWidth="2.2" />
      <rect x="25" y="8" width="4" height="7" fill={INK} />
      <rect x="11" y="24" width="26" height="16" rx="2" fill="#fffaf3" stroke={INK} strokeWidth="2.2" />
      <path d="M24 36c-2-1.6-4-2.6-4-4.4a1.9 1.9 0 0 1 4-.5 1.9 1.9 0 0 1 4 .5c0 1.8-2 2.8-4 4.4z" fill="#ff7eb0" />
    </svg>
  );
}

type StickerKind = "duck" | "cloud" | "cherry" | "floppy" | "star" | "heart";
const STICKERS: { kind: StickerKind; x: number; y: number; delay: number }[] = [
  { kind: "cloud", x: 0.38, y: 0.08, delay: 0 },
  { kind: "duck", x: 0.84, y: 0.62, delay: 1.2 },
  { kind: "cherry", x: 0.55, y: 0.34, delay: 0.6 },
  { kind: "floppy", x: 0.9, y: 0.18, delay: 2 },
  { kind: "star", x: 0.26, y: 0.56, delay: 0.3 },
  { kind: "heart", x: 0.7, y: 0.1, delay: 1.6 },
];

const stickerArt: Record<StickerKind, () => ReactElement> = {
  duck: () => <Duck />,
  cloud: () => <Cloud />,
  cherry: () => <Cherry />,
  floppy: () => <Floppy />,
  star: () => <Sparkle size={46} />,
  heart: () => <Heart size={42} />,
};

const quips: Record<StickerKind, string> = {
  duck: "that's my rubber duck debugger 🦆",
  cloud: "the cloud where my code is deployed ☁",
  cherry: "cherries! sweet like a green CI build",
  floppy: "remember to save your work ♡",
  star: "✦ you found a star ✦",
  heart: "thanks for visiting ♥",
};

function StickerItem({ s, index }: { s: (typeof STICKERS)[number]; index: number }) {
  const [p, setP] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);

  useEffect(() => {
    const narrow = window.innerWidth < 700;
    setP({
      x: s.x * (window.innerWidth - (narrow ? 80 : 110)),
      y: narrow ? window.innerHeight * (0.4 + s.y * 0.42) : s.y * (window.innerHeight - 160),
    });
  }, [s]);

  if (!p) return null;

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    drag.current = { dx: e.clientX - p.x, dy: e.clientY - p.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current.moved = true;
    setP({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy });
  };
  const up = () => {
    if (drag.current && !drag.current.moved) emit("tonny-say", { text: quips[s.kind] });
    drag.current = null;
  };

  return (
    <div
      className="sticker"
      style={{ left: p.x, top: p.y, animationDelay: `${s.delay}s`, zIndex: 3 + index }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      title="drag me!"
    >
      <div className={`sticker-inner ${s.kind === "cloud" ? "drift" : ""}`} style={{ animationDelay: `${s.delay}s` }}>
        {stickerArt[s.kind]()}
      </div>
    </div>
  );
}

export function Stickers() {
  return (
    <>
      {STICKERS.map((s, i) => (
        <StickerItem key={s.kind} s={s} index={i} />
      ))}
    </>
  );
}

// ambient floating particles
type P = { id: number; left: number; size: number; dur: number; delay: number; kind: number; color: string };
const COLORS = ["#fff1a8", "#ffc4dd", "#cdb8ff", "#bff0d4", "#bfe3ff", "#ffd6b8"];

export function Floaties() {
  const [ps, setPs] = useState<P[]>([]);
  useEffect(() => {
    const n = window.innerWidth < 700 ? 12 : 22;
    setPs(
      Array.from({ length: n }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 16,
        dur: 14 + Math.random() * 16,
        delay: -Math.random() * 30,
        kind: i % 3,
        color: COLORS[i % COLORS.length],
      })),
    );
  }, []);
  return (
    <div className="floaties" aria-hidden="true">
      {ps.map((p) => (
        <span key={p.id} className="floaty" style={{ left: `${p.left}%`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>
          <span className="floaty-wobble" style={{ animationDuration: `${3 + (p.id % 4)}s` }}>
            {p.kind === 0 ? (
              <Sparkle size={p.size} color={p.color} />
            ) : p.kind === 1 ? (
              <Heart size={p.size} color={p.color} />
            ) : (
              <span className="bubble" style={{ width: p.size, height: p.size }} />
            )}
          </span>
        </span>
      ))}
    </div>
  );
}

// sparkle trail following the cursor
export function CursorTrail() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let last = 0;
    const mv = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 45 || !layer.current) return;
      last = now;
      const s = document.createElement("span");
      s.className = "trail";
      s.textContent = ["✦", "✧", "♡", "⋆"][Math.floor(Math.random() * 4)];
      s.style.left = `${e.clientX + 8}px`;
      s.style.top = `${e.clientY + 8}px`;
      s.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      layer.current.appendChild(s);
      setTimeout(() => s.remove(), 800);
    };
    window.addEventListener("pointermove", mv);
    return () => window.removeEventListener("pointermove", mv);
  }, []);
  return <div ref={layer} className="trail-layer" aria-hidden="true" />;
}

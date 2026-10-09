"use client";

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { emit } from "@/lib/bus";

type Tool = "pencil" | "brush" | "spray" | "eraser" | "fill" | "heart" | "star";

const TOOLS: { id: Tool; label: string; glyph: string }[] = [
  { id: "pencil", label: "Pencil", glyph: "✎" },
  { id: "brush", label: "Brush", glyph: "🖌" },
  { id: "spray", label: "Airbrush", glyph: "💨" },
  { id: "eraser", label: "Eraser", glyph: "▭" },
  { id: "fill", label: "Fill", glyph: "🪣" },
  { id: "heart", label: "Heart stamp", glyph: "♥" },
  { id: "star", label: "Star stamp", glyph: "★" },
];

const COLORS = [
  "#4a3558", "#ffffff", "#ff7eb0", "#ffc4dd", "#b39dfa", "#e4d9ff",
  "#8fe0b5", "#bff0d4", "#7cc4ff", "#bfe3ff", "#ffe28a", "#fff1a8",
  "#ffb27a", "#ffd6b8", "#e8673f", "#9b85ec",
];

const CW = 720;
const CH = 460;

function hexToRgba(hex: string): [number, number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

export default function PaintApp() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState("#ff7eb0");
  const [size, setSize] = useState(6);
  const [coords, setCoords] = useState("");
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const sprayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const sprayAt = useRef({ x: 0, y: 0 });

  const ctx = () => canvas.current!.getContext("2d", { willReadFrequently: true })!;

  const reset = () => {
    const c = ctx();
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, CW, CH);
    c.fillStyle = "#cdb8ff";
    c.font = "28px Gaegu, 'Comic Sans MS', cursive";
    c.textAlign = "center";
    c.fillText("draw something for tonny ♡", CW / 2, CH / 2);
  };

  useEffect(() => {
    reset();
    if (document.fonts) document.fonts.ready.then(() => reset());
    return () => {
      if (sprayTimer.current) clearInterval(sprayTimer.current);
    };
  }, []);

  const pt = (e: RPointerEvent<HTMLCanvasElement>) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * CW, y: ((e.clientY - r.top) / r.height) * CH };
  };

  const stroke = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const c = ctx();
    c.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    c.lineCap = tool === "pencil" ? "square" : "round";
    c.lineJoin = "round";
    c.lineWidth = tool === "pencil" ? Math.max(2, size / 3) : tool === "eraser" ? size * 3 : size;
    c.beginPath();
    c.moveTo(a.x, a.y);
    c.lineTo(b.x, b.y);
    c.stroke();
  };

  const spray = () => {
    const c = ctx();
    c.fillStyle = color;
    const r = size * 3;
    for (let i = 0; i < 18; i++) {
      const ang = Math.random() * Math.PI * 2;
      const d = Math.random() * r;
      c.fillRect(sprayAt.current.x + Math.cos(ang) * d, sprayAt.current.y + Math.sin(ang) * d, 1.6, 1.6);
    }
  };

  const stamp = (p: { x: number; y: number }, kind: "heart" | "star") => {
    const c = ctx();
    const s = size * 4 + 14;
    c.save();
    c.translate(p.x, p.y);
    c.fillStyle = color;
    c.strokeStyle = "#4a3558";
    c.lineWidth = 3;
    c.beginPath();
    if (kind === "heart") {
      c.moveTo(0, s * 0.35);
      c.bezierCurveTo(-s * 0.9, -s * 0.2, -s * 0.4, -s * 0.8, 0, -s * 0.35);
      c.bezierCurveTo(s * 0.4, -s * 0.8, s * 0.9, -s * 0.2, 0, s * 0.35);
    } else {
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? s * 0.55 : s * 0.24;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      c.closePath();
    }
    c.fill();
    c.stroke();
    c.restore();
  };

  const fill = (p: { x: number; y: number }) => {
    const c = ctx();
    const img = c.getImageData(0, 0, CW, CH);
    const d = img.data;
    const x0 = Math.min(CW - 1, Math.max(0, Math.floor(p.x)));
    const y0 = Math.min(CH - 1, Math.max(0, Math.floor(p.y)));
    const i0 = (y0 * CW + x0) * 4;
    const t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
    const f = hexToRgba(color);
    if (t.every((v, i) => Math.abs(v - f[i]) < 3)) return;
    const tol = 48;
    const match = (i: number) =>
      Math.abs(d[i] - t[0]) + Math.abs(d[i + 1] - t[1]) + Math.abs(d[i + 2] - t[2]) + Math.abs(d[i + 3] - t[3]) <= tol;
    const stack = [x0, y0];
    const seen = new Uint8Array(CW * CH);
    while (stack.length) {
      const y = stack.pop()!;
      let x = stack.pop()!;
      while (x >= 0 && match((y * CW + x) * 4) && !seen[y * CW + x]) x--;
      x++;
      let up = false;
      let dn = false;
      while (x < CW && match((y * CW + x) * 4) && !seen[y * CW + x]) {
        const k = y * CW + x;
        seen[k] = 1;
        d.set(f, k * 4);
        if (y > 0) {
          const m = match(((y - 1) * CW + x) * 4) && !seen[(y - 1) * CW + x];
          if (m && !up) stack.push(x, y - 1);
          up = m;
        }
        if (y < CH - 1) {
          const m = match(((y + 1) * CW + x) * 4) && !seen[(y + 1) * CW + x];
          if (m && !dn) stack.push(x, y + 1);
          dn = m;
        }
        x++;
      }
    }
    c.putImageData(img, 0, 0);
  };

  const down = (e: RPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pt(e);
    if (tool === "fill") return fill(p);
    if (tool === "heart" || tool === "star") return stamp(p, tool);
    drawing.current = true;
    last.current = p;
    if (tool === "spray") {
      sprayAt.current = p;
      spray();
      sprayTimer.current = setInterval(spray, 30);
    } else {
      stroke(p, { x: p.x + 0.01, y: p.y + 0.01 });
    }
  };
  const move = (e: RPointerEvent<HTMLCanvasElement>) => {
    const p = pt(e);
    setCoords(`${Math.round(p.x)}, ${Math.round(p.y)}px`);
    if (!drawing.current || !last.current) return;
    if (tool === "spray") sprayAt.current = p;
    else stroke(last.current, p);
    last.current = p;
  };
  const up = () => {
    drawing.current = false;
    last.current = null;
    if (sprayTimer.current) clearInterval(sprayTimer.current);
    sprayTimer.current = null;
  };

  const save = () => {
    const a = document.createElement("a");
    a.download = "untitled.png";
    a.href = canvas.current!.toDataURL("image/png");
    a.click();
    emit("tonny-say", { text: "a masterpiece!! saved ♡", mood: "love" });
  };

  return (
    <div className="paint">
      <div className="paint-work">
        <div className="paint-tools" role="toolbar" aria-label="Tools">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`ptool ${tool === t.id ? "on" : ""}`}
              onClick={() => setTool(t.id)}
              title={t.label}
              aria-label={t.label}
              aria-pressed={tool === t.id}
            >
              {t.glyph}
            </button>
          ))}
          <div className="psizes">
            {[3, 6, 12].map((s) => (
              <button key={s} className={`psize ${size === s ? "on" : ""}`} onClick={() => setSize(s)} aria-label={`Size ${s}`}>
                <span style={{ width: s + 2, height: s + 2 }} />
              </button>
            ))}
          </div>
        </div>
        <div className="paint-canvas-wrap">
          <canvas
            ref={canvas}
            width={CW}
            height={CH}
            className={`paint-canvas tool-${tool}`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onPointerLeave={() => setCoords("")}
          />
        </div>
      </div>
      <div className="paint-bottom">
        <div className="pcurrent" title="Current colour">
          <span style={{ background: color }} />
        </div>
        <div className="palette">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${c === color ? "on" : ""}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
            />
          ))}
        </div>
        <div className="paint-actions">
          <button className="btn98" onClick={reset}>
            Clear
          </button>
          <button className="btn98" onClick={save}>
            Save .png
          </button>
        </div>
      </div>
      <div className="paint-status">
        <span>For Help, click Help Topics on the Help Menu.</span>
        <span>{coords}</span>
      </div>
    </div>
  );
}

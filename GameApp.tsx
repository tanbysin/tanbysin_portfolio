"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PixelGirl, { buildGrid, ColaCan, PALETTE, type Expression } from "../PixelGirl";
import { emit } from "@/lib/bus";

// ---------------- config ----------------
const GW = 480;
const GH = 360;
const PS = 3; // player pixel scale
const PW = 16 * PS;
const PH = 22 * PS;
const GROUND = GH - 30;
const COLA_EVERY = 10;
const INK = "#4a3558";

type Kind = "star" | "heart" | "bug" | "cola";
type Item = { x: number; y: number; vy: number; kind: Kind; rot: number; spin: number };
type Pop = { x: number; y: number; text: string; t: number; color: string };

type Status = "ready" | "playing" | "over" | "drinking";

const store = {
  get(k: string, d: number) {
    try {
      const v = localStorage.getItem(k);
      return v ? Number(v) || d : d;
    } catch {
      return d;
    }
  },
  set(k: string, v: number) {
    try {
      localStorage.setItem(k, String(v));
    } catch {}
  },
};

// ---------------- drawing helpers ----------------
const spriteCache = new Map<string, HTMLCanvasElement>();
function sprite(expr: Expression, frame: 0 | 1 | 2) {
  const key = `${expr}-${frame}`;
  let c = spriteCache.get(key);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = PW;
  c.height = PH;
  const x = c.getContext("2d")!;
  buildGrid(frame, expr).forEach((row, y) => {
    for (let i = 0; i < 16; i++) {
      const ch = row[i];
      if (!ch || ch === ".") continue;
      x.fillStyle = PALETTE[ch];
      x.fillRect(i * PS, y * PS, PS, PS);
    }
  });
  spriteCache.set(key, c);
  return c;
}

function star(c: CanvasRenderingContext2D, r: number) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  c.closePath();
  c.fillStyle = "#ffe28a";
  c.fill();
  c.stroke();
}

function heart(c: CanvasRenderingContext2D, s: number) {
  c.beginPath();
  c.moveTo(0, s * 0.45);
  c.bezierCurveTo(-s * 1.1, -s * 0.2, -s * 0.45, -s, 0, -s * 0.4);
  c.bezierCurveTo(s * 0.45, -s, s * 1.1, -s * 0.2, 0, s * 0.45);
  c.fillStyle = "#ff9ec7";
  c.fill();
  c.stroke();
}

function bug(c: CanvasRenderingContext2D) {
  c.beginPath();
  for (const s of [-1, 1])
    for (const y of [-4, 2, 8]) {
      c.moveTo(s * 8, y);
      c.lineTo(s * 15, y + 3);
    }
  c.moveTo(-3, -10);
  c.lineTo(-7, -17);
  c.moveTo(3, -10);
  c.lineTo(7, -17);
  c.stroke();
  c.beginPath();
  c.ellipse(0, 2, 10, 12, 0, 0, Math.PI * 2);
  c.fillStyle = "#7a5a8e";
  c.fill();
  c.stroke();
  c.beginPath();
  c.arc(0, -10, 6, 0, Math.PI * 2);
  c.fillStyle = "#4a3558";
  c.fill();
  c.fillStyle = "#ff7eb0";
  c.fillRect(-2, -12, 2, 2);
  c.fillRect(2, -12, 2, 2);
  c.beginPath();
  c.moveTo(0, -8);
  c.lineTo(0, 14);
  c.stroke();
  c.fillStyle = "#bff0d4";
  for (const [x, y] of [[-5, 0], [5, 4], [-4, 8]]) {
    c.beginPath();
    c.arc(x, y, 2, 0, Math.PI * 2);
    c.fill();
  }
}

function can(c: CanvasRenderingContext2D) {
  c.fillStyle = "#d9d4e6";
  c.fillRect(-7, -16, 14, 4);
  c.strokeRect(-7, -16, 14, 4);
  c.fillStyle = "#e8394a";
  c.beginPath();
  c.roundRect(-9, -13, 18, 28, 3);
  c.fill();
  c.stroke();
  c.fillStyle = "#fffaf3";
  c.fillRect(-7, -4, 14, 8);
  c.fillStyle = "#e8394a";
  c.font = "bold 8px Gaegu, cursive";
  c.textAlign = "center";
  c.fillText("cola", 0, 3);
  c.fillStyle = "rgba(255,255,255,.7)";
  c.fillRect(-6, -11, 2, 6);
}

function cloud(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.beginPath();
  c.arc(0, 0, 14, Math.PI * 0.5, Math.PI * 1.5);
  c.arc(14, -12, 16, Math.PI, Math.PI * 1.85);
  c.arc(34, -4, 14, Math.PI * 1.3, Math.PI * 0.5);
  c.closePath();
  c.fillStyle = "rgba(255,250,243,.9)";
  c.fill();
  c.strokeStyle = "rgba(74,53,88,.35)";
  c.lineWidth = 2;
  c.stroke();
  c.restore();
}

// ---------------- component ----------------
export default function GameApp() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [final, setFinal] = useState({ score: 0, colas: 0, best: 0, newBest: false });
  const [fridge, setFridge] = useState(0);
  const [best, setBest] = useState(0);

  const g = useRef({
    x: GW / 2 - PW / 2,
    targetX: null as number | null,
    left: false,
    right: false,
    items: [] as Item[],
    pops: [] as Pop[],
    score: 0,
    lives: 3,
    colas: 0,
    spawn: 0,
    t: 0,
    facing: 1,
    moodUntil: 0,
    mood: "happy" as Expression,
    hurtUntil: 0,
  });

  useEffect(() => {
    setBest(store.get("tonny-cola-best", 0));
    setFridge(store.get("tonny-cola-fridge", 0));
  }, []);

  // draw a static title frame
  const drawScene = useCallback((expr: Expression = "happy", frame: 0 | 1 | 2 = 0) => {
    const c = canvas.current?.getContext("2d");
    if (!c) return;
    const s = g.current;
    const sky = c.createLinearGradient(0, 0, 0, GH);
    sky.addColorStop(0, "#cfe8ff");
    sky.addColorStop(0.55, "#efe4ff");
    sky.addColorStop(1, "#ffd9ea");
    c.fillStyle = sky;
    c.fillRect(0, 0, GW, GH);
    const drift = (s.t * 8) % (GW + 120);
    cloud(c, ((60 + drift) % (GW + 120)) - 60, 60, 1);
    cloud(c, ((300 + drift * 0.6) % (GW + 120)) - 60, 110, 0.7);
    cloud(c, ((180 + drift * 0.4) % (GW + 120)) - 60, 30, 0.55);
    // ground
    c.fillStyle = "#bff0d4";
    c.strokeStyle = INK;
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(0, GROUND + 4);
    c.quadraticCurveTo(GW / 2, GROUND - 14, GW, GROUND + 4);
    c.lineTo(GW, GH);
    c.lineTo(0, GH);
    c.closePath();
    c.fill();
    c.stroke();
    // player
    c.fillStyle = "rgba(74,53,88,.2)";
    c.beginPath();
    c.ellipse(s.x + PW / 2, GROUND + 2, 20, 5, 0, 0, Math.PI * 2);
    c.fill();
    const blinkHurt = s.hurtUntil > s.t && Math.floor(s.t * 12) % 2 === 0;
    if (!blinkHurt) {
      const spr = sprite(expr, frame);
      c.save();
      if (s.facing < 0) {
        c.translate(s.x + PW, GROUND - PH);
        c.scale(-1, 1);
        c.drawImage(spr, 0, 0);
      } else c.drawImage(spr, s.x, GROUND - PH);
      c.restore();
    }
  }, []);

  useEffect(() => {
    if (status === "ready") drawScene("happy");
  }, [status, drawScene]);

  const start = () => {
    Object.assign(g.current, {
      x: GW / 2 - PW / 2,
      targetX: null,
      items: [],
      pops: [],
      score: 0,
      lives: 3,
      colas: 0,
      spawn: 0.4,
      t: 0,
      moodUntil: 0,
      mood: "happy",
      hurtUntil: 0,
    });
    setStatus("playing");
    emit("tonny-say", { text: "go go go!! catch the stars ✦", mood: "happy" });
  };

  // game loop
  useEffect(() => {
    if (status !== "playing") return;
    const c = canvas.current!.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    const s = g.current;

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      s.t += dt;
      const level = 1 + s.score / 25;

      // movement
      const speed = 300;
      let vx = 0;
      if (s.left) vx -= 1;
      if (s.right) vx += 1;
      if (vx) s.targetX = null;
      else if (s.targetX !== null) {
        const d = s.targetX - (s.x + PW / 2);
        if (Math.abs(d) > 4) vx = Math.sign(d) * Math.min(1, Math.abs(d) / 40);
      }
      s.x = Math.max(0, Math.min(GW - PW, s.x + vx * speed * dt));
      if (vx) s.facing = vx > 0 ? 1 : -1;

      // spawn
      s.spawn -= dt;
      if (s.spawn <= 0) {
        s.spawn = Math.max(0.28, 0.9 - s.score * 0.012) * (0.7 + Math.random() * 0.6);
        const r = Math.random();
        const bugChance = Math.min(0.42, 0.18 + s.score * 0.006);
        const kind: Kind = r < 0.03 ? "cola" : r < 0.03 + bugChance ? "bug" : r < 0.8 ? "star" : "heart";
        s.items.push({
          x: 20 + Math.random() * (GW - 40),
          y: -20,
          vy: (70 + Math.random() * 50) * level,
          kind,
          rot: 0,
          spin: (Math.random() - 0.5) * 3,
        });
      }

      // update items + collisions
      const px = s.x + 8;
      const py = GROUND - PH + 10;
      const pw = PW - 16;
      const ph = PH - 12;
      s.items = s.items.filter((it) => {
        it.y += it.vy * dt;
        it.rot += it.spin * dt;
        const hit = it.x > px - 10 && it.x < px + pw + 10 && it.y > py - 6 && it.y < py + ph;
        if (hit) {
          if (it.kind === "bug") {
            if (s.hurtUntil < s.t) {
              s.lives -= 1;
              s.hurtUntil = s.t + 1.1;
              s.mood = "sad";
              s.moodUntil = s.t + 1;
              s.pops.push({ x: it.x, y: it.y, text: "ouch!", t: 0, color: "#7a5a8e" });
            }
          } else if (it.kind === "cola") {
            s.colas += 1;
            s.mood = "love";
            s.moodUntil = s.t + 1.2;
            s.pops.push({ x: it.x, y: it.y, text: "+1 cola!", t: 0, color: "#e8394a" });
          } else {
            const before = s.score;
            s.score += it.kind === "heart" ? 2 : 1;
            s.pops.push({ x: it.x, y: it.y, text: it.kind === "heart" ? "+2" : "+1", t: 0, color: "#b0356d" });
            if (Math.floor(s.score / COLA_EVERY) > Math.floor(before / COLA_EVERY)) {
              s.colas += 1;
              s.mood = "love";
              s.moodUntil = s.t + 1.2;
              s.pops.push({ x: s.x + PW / 2, y: py - 20, text: "🥤 cola earned!", t: 0, color: "#e8394a" });
            } else if (s.moodUntil < s.t) {
              s.mood = "happy";
              s.moodUntil = s.t + 0.4;
            }
          }
          return false;
        }
        return it.y < GH + 30;
      });
      s.pops = s.pops.filter((p) => (p.t += dt) < 0.9);

      // draw
      const moving = vx !== 0;
      const frame: 0 | 1 | 2 = moving ? ([1, 0, 2, 0] as const)[Math.floor(s.t * 8) % 4] : 0;
      const expr: Expression = s.moodUntil > s.t ? s.mood : moving ? "neutral" : "happy";
      drawScene(expr, frame);
      c.strokeStyle = INK;
      c.lineWidth = 2;
      for (const it of s.items) {
        c.save();
        c.translate(it.x, it.y);
        if (it.kind !== "cola") c.rotate(it.kind === "bug" ? Math.sin(s.t * 10) * 0.2 : it.rot);
        if (it.kind === "star") star(c, 12);
        else if (it.kind === "heart") heart(c, 11);
        else if (it.kind === "bug") bug(c);
        else can(c);
        c.restore();
      }
      c.textAlign = "center";
      for (const p of s.pops) {
        c.globalAlpha = 1 - p.t / 0.9;
        c.font = "bold 18px Gaegu, 'Comic Sans MS', cursive";
        c.lineWidth = 4;
        c.strokeStyle = "#fff";
        c.strokeText(p.text, p.x, p.y - p.t * 40);
        c.fillStyle = p.color;
        c.fillText(p.text, p.x, p.y - p.t * 40);
      }
      c.globalAlpha = 1;
      c.lineWidth = 2;
      c.strokeStyle = INK;

      // HUD
      c.fillStyle = "rgba(255,250,243,.85)";
      c.beginPath();
      c.roundRect(8, 8, GW - 16, 30, 8);
      c.fill();
      c.stroke();
      c.font = "600 16px 'Pixelify Sans', monospace";
      c.textAlign = "left";
      c.fillStyle = INK;
      c.fillText(`score ${s.score}`, 18, 29);
      c.fillStyle = "#ff7eb0";
      c.fillText("♥".repeat(Math.max(0, s.lives)) + "♡".repeat(Math.max(0, 3 - s.lives)), 120, 29);
      c.textAlign = "right";
      c.fillStyle = "#e8394a";
      c.fillText(`🥤 × ${s.colas}`, GW - 18, 29);
      // progress to next cola
      const prog = (s.score % COLA_EVERY) / COLA_EVERY;
      c.fillStyle = "#fff";
      c.fillRect(200, 18, 150, 10);
      c.fillStyle = "#e8394a";
      c.fillRect(200, 18, 150 * prog, 10);
      c.strokeRect(200, 18, 150, 10);

      if (s.lives <= 0) {
        const newBest = s.score > store.get("tonny-cola-best", 0);
        if (newBest) store.set("tonny-cola-best", s.score);
        const b = Math.max(s.score, store.get("tonny-cola-best", 0));
        const f = store.get("tonny-cola-fridge", 0) + s.colas;
        store.set("tonny-cola-fridge", f);
        setBest(b);
        setFridge(f);
        setFinal({ score: s.score, colas: s.colas, best: b, newBest });
        drawScene("dizzy");
        setStatus("over");
        emit("tonny-say", {
          text: s.colas ? `game over! but i won ${s.colas} cola${s.colas > 1 ? "s" : ""} 🥤` : "noo, the bugs got me @_@",
          mood: s.colas ? "wink" : "dizzy",
        });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const kd = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") s.left = true;
      else if (k === "arrowright" || k === "d") s.right = true;
      else return;
      e.preventDefault();
    };
    const ku = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") s.left = false;
      if (k === "arrowright" || k === "d") s.right = false;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      s.left = s.right = false;
    };
  }, [status, drawScene]);

  // space / enter to start
  useEffect(() => {
    if (status === "playing" || status === "drinking") return;
    const kd = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === " " && canvas.current?.closest(".win.is-focused")) {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const pointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (status !== "playing") return;
    const r = e.currentTarget.getBoundingClientRect();
    g.current.targetX = ((e.clientX - r.left) / r.width) * GW;
  };

  const drink = () => {
    if (fridge <= 0) return;
    const f = fridge - 1;
    setFridge(f);
    store.set("tonny-cola-fridge", f);
    setStatus("drinking");
    emit("tonny-drink", { text: "*gulp gulp* 🥤" });
    setTimeout(() => setStatus("over"), 2800);
  };

  const hold = (dir: "left" | "right", v: boolean) => {
    g.current[dir] = v;
  };

  return (
    <div className={`game ${status === "playing" ? "is-playing" : ""}`}>
      <div className="game-stage">
        <canvas
          ref={canvas}
          width={GW}
          height={GH}
          className="game-canvas"
          onPointerMove={pointer}
          onPointerDown={pointer}
        />

        {status === "ready" && (
          <div className="game-overlay">
            <h3 className="hand">cola catch!</h3>
            <ul className="game-rules">
              <li>
                <b className="k-star">★</b> +1 &nbsp; <b className="k-heart">♥</b> +2
              </li>
              <li>
                <b>🐞</b> bugs cost a life (you have 3)
              </li>
              <li>
                every <b>{COLA_EVERY} points</b> = one cola 🥤
              </li>
            </ul>
            <p className="game-controls">← → / A D, mouse or touch to move</p>
            <button className="btn98 big" onClick={start}>
              ▶ play
            </button>
            <p className="game-best">best: {best} · colas in fridge: {fridge}</p>
          </div>
        )}

        {status === "over" && (
          <div className="game-overlay">
            <h3 className="hand">{final.newBest ? "new high score!! ✦" : "game over!"}</h3>
            <div className="game-score">
              <div>
                <span>score</span>
                <b>{final.score}</b>
              </div>
              <div>
                <span>best</span>
                <b>{final.best}</b>
              </div>
              <div>
                <span>colas won</span>
                <b className="red">{final.colas}</b>
              </div>
            </div>
            <div className="fridge" aria-label={`${fridge} colas in the fridge`}>
              <span className="fridge-label">fridge</span>
              <div className="fridge-cans">
                {fridge === 0 && <em>empty… score {COLA_EVERY} to earn one!</em>}
                {Array.from({ length: Math.min(fridge, 8) }, (_, i) => (
                  <span key={i} className="fridge-can" style={{ animationDelay: `${i * 60}ms` }}>
                    <ColaCan size={16} />
                  </span>
                ))}
                {fridge > 8 && <b>+{fridge - 8}</b>}
              </div>
            </div>
            <div className="game-btns">
              <button className="btn98 cola" onClick={drink} disabled={fridge <= 0}>
                🥤 drink a cola
              </button>
              <button className="btn98" onClick={start}>
                ↻ play again
              </button>
            </div>
          </div>
        )}

        {status === "drinking" && (
          <div className="game-overlay drinking">
            <div className="drink-scene">
              <PixelGirl scale={6} expression="sip" />
              <span className="drink-can">
                <ColaCan size={34} />
              </span>
              <span className="fizz big" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
            <p className="hand drink-text">*gulp gulp gulp*… ahhh~ ♡</p>
          </div>
        )}
      </div>

      <div className="game-pad">
        {(["left", "right"] as const).map((d) => (
          <button
            key={d}
            className="btn98"
            onPointerDown={() => hold(d, true)}
            onPointerUp={() => hold(d, false)}
            onPointerLeave={() => hold(d, false)}
            onPointerCancel={() => hold(d, false)}
            aria-label={`Move ${d}`}
          >
            {d === "left" ? "◀" : "▶"}
          </button>
        ))}
      </div>
    </div>
  );
}

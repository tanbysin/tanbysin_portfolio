"use client";

import { useEffect, useRef, useState } from "react";
import PixelGirl, { ColaCan, type Expression } from "./PixelGirl";
import { on } from "@/lib/bus";
import { avatarLines } from "@/lib/data";

const SPEED = 170; // px per second
const W = 64;
const H = 88;
const TASKBAR = 46;
const SLEEP_AFTER = 22000;

const POKE_MOODS: Expression[] = ["happy", "love", "wink", "surprised", "smug"];

export default function Avatar() {
  const el = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef<{ x: number; y: number } | null>(null);
  const keys = useRef(new Set<string>());
  const lastActive = useRef(0);
  const lastWander = useRef(0);
  const [moving, setMoving] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [frame, setFrame] = useState<0 | 1 | 2>(0);
  const [blink, setBlink] = useState(false);
  const [mood, setMood] = useState<Expression | null>(null); // temporary expression
  const [asleep, setAsleep] = useState(false);
  const [drinking, setDrinking] = useState(false);
  const [hop, setHop] = useState(0);
  const [speech, setSpeech] = useState<string | null>(null);
  const speechTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movingRef = useRef(false);
  const facingRef = useRef<1 | -1>(1);
  const asleepRef = useRef(false);
  const drinkingRef = useRef(false);
  const pokes = useRef<number[]>([]);

  const say = (text: string, ms = 3200) => {
    setSpeech(text);
    if (speechTimer.current) clearTimeout(speechTimer.current);
    speechTimer.current = setTimeout(() => setSpeech(null), ms);
  };

  const feel = (m: Expression, ms = 1800) => {
    setMood(m);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood(null), ms);
  };

  const wake = () => {
    lastActive.current = performance.now();
    if (asleepRef.current) {
      asleepRef.current = false;
      setAsleep(false);
      feel("surprised", 900);
    }
  };

  // place her on the "ground" on mount
  useEffect(() => {
    pos.current = { x: Math.max(20, window.innerWidth * 0.62), y: window.innerHeight - TASKBAR - H - 26 };
    lastActive.current = performance.now();
    lastWander.current = performance.now();
    const t = setTimeout(() => {
      say(avatarLines[0], 3600);
      feel("happy", 3000);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  // main loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = pos.current;
      let vx = 0;
      let vy = 0;
      const k = keys.current;
      if (drinkingRef.current) {
        target.current = null;
      } else if (k.size) {
        if (k.has("ArrowLeft") || k.has("a")) vx -= 1;
        if (k.has("ArrowRight") || k.has("d")) vx += 1;
        if (k.has("ArrowUp") || k.has("w")) vy -= 1;
        if (k.has("ArrowDown") || k.has("s")) vy += 1;
        target.current = null;
      } else if (target.current) {
        const dx = target.current.x - p.x;
        const dy = target.current.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 4) {
          target.current = null;
        } else {
          vx = dx / d;
          vy = dy / d;
        }
      }
      const isMoving = vx !== 0 || vy !== 0;
      if (isMoving) {
        const len = Math.hypot(vx, vy) || 1;
        p.x += (vx / len) * SPEED * dt;
        p.y += (vy / len) * SPEED * dt;
        p.x = Math.max(0, Math.min(window.innerWidth - W, p.x));
        p.y = Math.max(0, Math.min(window.innerHeight - TASKBAR - H, p.y));
        if (vx !== 0) {
          const f: 1 | -1 = vx > 0 ? 1 : -1;
          if (f !== facingRef.current) {
            facingRef.current = f;
            setFacing(f);
          }
        }
      }
      if (isMoving !== movingRef.current) {
        movingRef.current = isMoving;
        setMoving(isMoving);
      }
      if (el.current) el.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;

      // fall asleep when nobody plays with her
      if (!isMoving && !asleepRef.current && !drinkingRef.current && now - lastActive.current > SLEEP_AFTER) {
        asleepRef.current = true;
        setAsleep(true);
        say("*yawn*… 5 more minutes", 2600);
      }

      // idle wander along the bottom (only while awake)
      if (!isMoving && !asleepRef.current && !drinkingRef.current && now - lastWander.current > 9000) {
        lastWander.current = now;
        target.current = {
          x: 30 + Math.random() * (window.innerWidth - W - 60),
          y: window.innerHeight - TASKBAR - H - 10 - Math.random() * 90,
        };
        if (Math.random() < 0.45) say(avatarLines[1 + Math.floor(Math.random() * (avatarLines.length - 1))]);
      }
      if (isMoving) lastWander.current = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // walking frames
  useEffect(() => {
    if (!moving) {
      setFrame(0);
      return;
    }
    let f = 0;
    const id = setInterval(() => {
      f = (f + 1) % 4;
      setFrame(f === 1 ? 1 : f === 3 ? 2 : 0);
    }, 120);
    return () => clearInterval(id);
  }, [moving]);

  // blinking
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3400);
    return () => clearInterval(id);
  }, []);

  // keyboard + events
  useEffect(() => {
    const isTyping = (t: EventTarget | null) => {
      const n = t as HTMLElement | null;
      return !!n && (n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.isContentEditable || !!n.closest?.(".game"));
    };
    const valid = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "a", "d", "w", "s"];
    const kd = (e: KeyboardEvent) => {
      if (isTyping(e.target) || document.querySelector(".game.is-playing")) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (!valid.includes(k)) return;
      if (k.startsWith("Arrow")) e.preventDefault();
      keys.current.add(k);
      wake();
    };
    const ku = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      keys.current.delete(k);
    };
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("blur", blur);
    const offWalk = on("tonny-walk", ({ x, y }) => {
      if (drinkingRef.current) return;
      wake();
      target.current = {
        x: Math.max(0, Math.min(window.innerWidth - W, x - W / 2)),
        y: Math.max(0, Math.min(window.innerHeight - TASKBAR - H, y - H + 6)),
      };
    });
    const offSay = on("tonny-say", ({ text, ms, mood: m }) => {
      wake();
      say(text, ms);
      feel(m ?? "happy", Math.min(ms ?? 2400, 2600));
    });
    const offDrink = on("tonny-drink", ({ text }) => {
      wake();
      target.current = null;
      drinkingRef.current = true;
      setDrinking(true);
      setMood(null);
      say(text ?? "*sip sip sip* 🥤", 2400);
      setTimeout(() => {
        drinkingRef.current = false;
        setDrinking(false);
        lastActive.current = performance.now();
        say("ahhh~ so refreshing!! ♡", 2600);
        feel("love", 2600);
      }, 2600);
    });
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", blur);
      offWalk();
      offSay();
      offDrink();
    };
  }, []);

  const poke = () => {
    if (drinkingRef.current) return;
    const now = performance.now();
    const wasAsleep = asleepRef.current;
    wake();
    setHop((h) => h + 1);
    if (wasAsleep) {
      say("huh?! i'm awake, i'm awake!");
      feel("surprised", 1400);
      return;
    }
    pokes.current = [...pokes.current.filter((t) => now - t < 2500), now];
    if (pokes.current.length >= 5) {
      pokes.current = [];
      say("stop poking meee @_@", 2400);
      feel("dizzy", 2200);
      return;
    }
    feel(POKE_MOODS[Math.floor(Math.random() * POKE_MOODS.length)]);
    say(avatarLines[Math.floor(Math.random() * avatarLines.length)]);
  };

  let expression: Expression;
  if (drinking) expression = "sip";
  else if (asleep) expression = "sleepy";
  else if (mood) expression = mood;
  else if (blink) expression = "blink";
  else expression = "neutral";

  const showHearts = mood === "love" || mood === "happy";

  return (
    <div ref={el} className={`avatar ${drinking ? "is-drinking" : ""}`} style={{ width: W, height: H }}>
      {speech && (
        <div className="avatar-speech" key={speech}>
          {speech}
        </div>
      )}
      {asleep && !speech && (
        <span className="avatar-zzz" aria-hidden="true">
          <i>z</i>
          <i>z</i>
          <i>Z</i>
        </span>
      )}
      <button
        className="avatar-btn"
        onClick={poke}
        onPointerEnter={() => {
          if (!asleepRef.current && !drinkingRef.current && !mood) feel("surprised", 700);
        }}
        aria-label="Say hi to tonny's avatar"
      >
        <div key={hop} className={`avatar-hop ${hop ? "hop" : ""}`}>
          <div className={moving || drinking ? "" : asleep ? "avatar-sleep" : "avatar-idle"} style={{ transform: `scaleX(${facing})` }}>
            <PixelGirl scale={4} frame={frame} expression={expression} />
            {drinking && (
              <span className="avatar-can">
                <ColaCan size={18} />
              </span>
            )}
          </div>
        </div>
        {drinking && (
          <span className="fizz" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        )}
        {showHearts && (
          <span className="avatar-hearts" aria-hidden="true" key={`h${hop}`}>
            <i>♥</i>
            <i>♥</i>
            <i>♥</i>
          </span>
        )}
        {mood === "dizzy" && (
          <span className="avatar-stars" aria-hidden="true">
            ✦ ✧ ✦
          </span>
        )}
        {mood === "sad" && <span className="avatar-cloud" aria-hidden="true">☁</span>}
      </button>
      <div className="avatar-shadow" />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Window, { type WinState } from "./Window";
import Icon, { type IconName } from "./Icons";
import Avatar from "./Avatar";
import PixelGirl from "./PixelGirl";
import { CursorTrail, Floaties, Stickers, Sparkle } from "./Decor";
import AboutApp from "./apps/AboutApp";
import { ExperienceApp, ProjectsApp } from "./apps/ProjectsApp";
import { EducationApp, SkillsApp } from "./apps/SkillsApp";
import ContactApp from "./apps/ContactApp";
import PaintApp from "./apps/PaintApp";
import { BinApp, ResumeApp, TunesApp } from "./apps/MiscApps";
import GameApp from "./apps/GameApp";
import type { Expression } from "./PixelGirl";
import { emit, on } from "@/lib/bus";
import { profile } from "@/lib/data";

type AppDef = {
  id: string;
  label: string;
  title: string;
  icon: IconName;
  w: number;
  h: number;
  menu?: string[];
  status?: ReactNode;
  say: string;
  mood?: Expression;
  render: () => ReactNode;
};

const APPS: AppDef[] = [
  { id: "about", label: "about_me.txt", title: "about_me.txt - Notepad", icon: "about", w: 640, h: 540, menu: ["File", "Edit", "Format", "Help"], say: "that's me! hi hi ✿", render: () => <AboutApp /> },
  { id: "projects", label: "projects", title: "C:\\tonny\\projects", icon: "projects", w: 700, h: 470, status: `${6} object(s)`, say: "my babies! the thesis is the starred one ★", render: () => <ProjectsApp /> },
  { id: "experience", label: "career.exe", title: "career.exe", icon: "experience", w: 580, h: 520, say: "where i've worked & led ✦", render: () => <ExperienceApp /> },
  { id: "skills", label: "skills", title: "Control Panel - Skills", icon: "skills", w: 620, h: 540, say: "all my installed programs ♡", render: () => <SkillsApp /> },
  { id: "education", label: "school.exe", title: "school.exe", icon: "education", w: 600, h: 400, menu: [], say: "UAP class of 2025! 🎓", render: () => <EducationApp /> },
  { id: "contact", label: "messenger", title: "tonny Messenger", icon: "contact", w: 700, h: 470, menu: ["File", "Contacts", "Actions", "Tools", "Help"], say: "come say hi! ✉", mood: "wink", render: () => <ContactApp /> },
  { id: "paint", label: "Paint", title: "untitled - Paint", icon: "paint", w: 820, h: 640, menu: ["File", "Edit", "View", "Image", "Colors", "Help"], say: "draw me something cute!", render: () => <PaintApp /> },
  { id: "resume", label: "resume.pdf", title: "resume.pdf", icon: "resume", w: 720, h: 620, menu: [], say: "the serious version of me 📄", render: () => <ResumeApp /> },
  { id: "game", label: "cola.exe", title: "cola_catch.exe", icon: "game", w: 540, h: 520, menu: ["Game", "Help"], say: "ooh a game! win me a cola 🥤", mood: "love", render: () => <GameApp /> },
  { id: "tunes", label: "tunes.exe", title: "tunes.exe", icon: "tunes", w: 380, h: 370, menu: [], say: "press play! ♪", render: () => <TunesApp /> },
  { id: "bin", label: "Recycle Bin", title: "Recycle Bin", icon: "bin", w: 520, h: 360, menu: ["File", "Edit", "View", "Help"], say: "don't look in there 🙈", mood: "surprised", render: () => <BinApp /> },
];

const byId = Object.fromEntries(APPS.map((a) => [a.id, a]));

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <span className="clock">--:--</span>;
  return <span className="clock">{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>;
}

function Boot({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPct((p) => Math.min(100, p + 7 + Math.random() * 12)), 110);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (pct >= 100) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
  }, [pct, onDone]);
  return (
    <div className="boot" onClick={onDone} role="status" aria-label="Loading">
      <div className="boot-inner">
        <PixelGirl scale={6} />
        <div className="boot-logo">
          tonny<span>OS</span>
        </div>
        <div className="boot-sub">starting up with extra sparkle…</div>
        <div className="boot-bar">
          {Array.from({ length: 16 }, (_, i) => (
            <i key={i} className={i < (pct / 100) * 16 ? "on" : ""} />
          ))}
        </div>
        <div className="boot-skip">click to skip</div>
      </div>
    </div>
  );
}

export default function Desktop() {
  const [wins, setWins] = useState<WinState[]>([]);
  const [focus, setFocus] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  const [off, setOff] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const zTop = useRef(20);
  const coarse = useRef(false);

  useEffect(() => {
    coarse.current = window.matchMedia("(pointer: coarse)").matches;
    try {
      if (sessionStorage.getItem("tonny-booted")) setBooting(false);
    } catch {}
  }, []);

  const open = useCallback((id: string) => {
    const app = byId[id];
    if (!app) return;
    setStartOpen(false);
    setWins((ws) => {
      const z = ++zTop.current;
      const existing = ws.find((w) => w.id === id);
      if (existing) return ws.map((w) => (w.id === id ? { ...w, minimized: false, z } : w));
      const vw = window.innerWidth;
      const vh = window.innerHeight - 46;
      const n = ws.length;
      const mobile = vw < 700;
      const x = mobile ? 0 : Math.max(10, Math.min(vw - app.w - 10, (vw - app.w) / 2 + ((n % 5) - 2) * 34 + 60));
      const y = mobile ? 0 : Math.max(8, Math.min(vh - app.h - 8, (vh - app.h) / 2 + ((n % 5) - 2) * 28));
      return [...ws, { id, x, y, z, minimized: false, maximized: mobile }];
    });
    setFocus(id);
    emit("tonny-say", { text: app.say, mood: app.mood });
  }, []);

  useEffect(() => on("tonny-open", ({ id }) => open(id)), [open]);

  const bootDone = useCallback(() => {
    setBooting(false);
    try {
      sessionStorage.setItem("tonny-booted", "1");
    } catch {}
  }, []);

  // open the intro on first load (desktop only)
  const openedIntro = useRef(false);
  useEffect(() => {
    if (booting || openedIntro.current) return;
    openedIntro.current = true;
    if (window.innerWidth >= 900) setTimeout(() => open("about"), 400);
  }, [booting, open]);

  const focusWin = (id: string) => {
    setFocus(id);
    setWins((ws) => {
      const w = ws.find((x) => x.id === id);
      if (w && w.z === zTop.current) return ws;
      const z = ++zTop.current;
      return ws.map((x) => (x.id === id ? { ...x, z } : x));
    });
  };
  const close = (id: string) => setWins((ws) => ws.filter((w) => w.id !== id));
  const minimize = (id: string) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
    setFocus(null);
  };
  const maximize = (id: string) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)));
  const moveWin = (id: string, x: number, y: number) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)));

  const taskClick = (id: string) => {
    const w = wins.find((x) => x.id === id);
    if (!w) return;
    if (w.minimized) {
      setWins((ws) => ws.map((x) => (x.id === id ? { ...x, minimized: false } : x)));
      focusWin(id);
    } else if (focus === id) minimize(id);
    else focusWin(id);
  };

  const bgDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    setSelected(null);
    setStartOpen(false);
    setFocus(null);
    emit("tonny-walk", { x: e.clientX, y: e.clientY });
    const id = Date.now() + Math.random();
    setSparks((s) => [...s.slice(-6), { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setSparks((s) => s.filter((p) => p.id !== id)), 700);
  };

  if (off) {
    return (
      <div className="shutdown" onClick={() => setOff(false)}>
        <div>
          <p className="hand big">it&apos;s now safe to close this tab ✿</p>
          <p>…or click anywhere to come back to tonnyOS</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`os ${wins.some((w) => w.maximized && !w.minimized) ? "has-max" : ""}`}>
      <div className="wallpaper" aria-hidden="true">
        <div className="wp-grain" />
        <div className="wp-hills">
          <svg viewBox="0 0 1440 260" preserveAspectRatio="none">
            <path d="M0 150 C 240 60, 420 70, 640 130 S 1080 210, 1440 110 V260 H0 Z" fill="#c6f0d6" stroke="#4a3558" strokeWidth="3" />
            <path d="M0 210 C 300 150, 620 160, 900 200 S 1300 230, 1440 190 V260 H0 Z" fill="#a8e6c3" stroke="#4a3558" strokeWidth="3" />
          </svg>
        </div>
      </div>
      <Floaties />

      <div className="desktop" onPointerDown={bgDown}>
        <div className="icons">
          {APPS.map((a) => (
            <button
              key={a.id}
              className={`dicon ${selected === a.id ? "sel" : ""}`}
              onClick={() => {
                setSelected(a.id);
                if (coarse.current) open(a.id);
              }}
              onDoubleClick={() => open(a.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") open(a.id);
              }}
              aria-label={`Open ${a.label}`}
            >
              <span className="dicon-img">
                <Icon name={a.icon} size={48} />
              </span>
              <span className="dicon-label">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="desk-note hand" aria-hidden="true">
          <span className="note-title">✎ welcome.txt</span>
          double-click the icons ✿<br />
          click anywhere to walk me around<br />
          arrow keys work too ♡
        </div>

        <Stickers />

        {sparks.map((s) => (
          <span key={s.id} className="spark" style={{ left: s.x, top: s.y }} aria-hidden="true">
            <Sparkle size={26} color="#fff1a8" />
          </span>
        ))}
      </div>

      {wins.map((w) => {
        const a = byId[w.id];
        return (
          <Window
            key={w.id}
            win={w}
            title={a.title}
            icon={a.icon}
            width={a.w}
            height={a.h}
            menu={a.menu}
            status={a.status}
            focused={focus === w.id}
            onFocus={() => focusWin(w.id)}
            onClose={() => close(w.id)}
            onMinimize={() => minimize(w.id)}
            onMaximize={() => maximize(w.id)}
            onMove={(x, y) => moveWin(w.id, x, y)}
          >
            {a.render()}
          </Window>
        );
      })}

      <Avatar />

      {startOpen && (
        <div className="start-menu" role="menu">
          <div className="start-side">
            <span>tonny</span>
            <b>OS</b>
          </div>
          <div className="start-main">
            <div className="start-user">
              <div className="start-pic">
                <PixelGirl scale={2} />
              </div>
              <div>
                <strong>{profile.name}</strong>
                <small>{profile.domain}</small>
              </div>
            </div>
            {APPS.map((a) => (
              <button key={a.id} role="menuitem" className="start-item" onClick={() => open(a.id)}>
                <Icon name={a.icon} size={26} />
                {a.label}
              </button>
            ))}
            <hr />
            <button role="menuitem" className="start-item" onClick={() => setOff(true)}>
              <span className="power">⏻</span> Shut down…
            </button>
          </div>
        </div>
      )}

      <footer className="taskbar">
        <button className={`start-btn ${startOpen ? "on" : ""}`} onClick={() => setStartOpen((s) => !s)} aria-expanded={startOpen}>
          <span className="flower">✿</span> start
        </button>
        <div className="task-quick" aria-hidden="true">
          <Icon name="about" size={20} />
          <Icon name="paint" size={20} />
        </div>
        <div className="tasks">
          {wins.map((w) => (
            <button key={w.id} className={`task ${focus === w.id && !w.minimized ? "on" : ""}`} onClick={() => taskClick(w.id)}>
              <Icon name={byId[w.id].icon} size={16} />
              <span>{byId[w.id].label}</span>
            </button>
          ))}
        </div>
        <div className="tray">
          <button className="tray-btn" onClick={() => open("tunes")} aria-label="Open tunes">
            ♪
          </button>
          <span className="tray-heart">♥</span>
          <Clock />
        </div>
      </footer>

      <CursorTrail />
      {booting && <Boot onDone={bootDone} />}
    </div>
  );
}

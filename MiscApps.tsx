"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/data";
import { emit } from "@/lib/bus";

// ---------- tunes.exe : tiny WebAudio chiptune player ----------
type Track = { name: string; bpm: number; lead: string[]; bass: string[]; wave: OscillatorType };

const TRACKS: Track[] = [
  {
    name: "pastel_dreams.mid",
    bpm: 132,
    wave: "square",
    lead: "E5 - G5 - A5 G5 E5 - D5 - E5 - C5 - - - E5 - G5 - B5 A5 G5 - E5 - D5 - C5 - - -".split(" "),
    bass: "C3 - - - A2 - - - F2 - - - G2 - - - C3 - - - A2 - - - F2 - - - G2 - - -".split(" "),
  },
  {
    name: "sunday_in_dhaka.mid",
    bpm: 108,
    wave: "triangle",
    lead: "A4 C5 E5 - D5 C5 A4 - G4 A4 C5 - E5 - - - A4 C5 E5 - G5 E5 D5 - C5 D5 A4 - - - - -".split(" "),
    bass: "A2 - - - F2 - - - C3 - - - G2 - - - A2 - - - F2 - - - G2 - - - E2 - - -".split(" "),
  },
  {
    name: "debug_lullaby.mid",
    bpm: 92,
    wave: "sine",
    lead: "C5 - E5 - G5 - E5 - F5 - A5 - G5 - - - E5 - D5 - C5 - D5 - E5 - C5 - - - - -".split(" "),
    bass: "C3 - - - - - - - F2 - - - G2 - - - A2 - - - - - - - F2 - G2 - C3 - - -".split(" "),
  },
];

const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const freq = (n: string) => {
  const m = 12 * (parseInt(n.slice(-1)) + 1) + NOTE[n[0]];
  return 440 * Math.pow(2, (m - 69) / 12);
};

export function TunesApp() {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [vol, setVol] = useState(0.5);
  const [step, setStep] = useState(0);
  const ac = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);

  useEffect(() => {
    if (master.current) master.current.gain.value = vol * 0.25;
  }, [vol]);

  useEffect(() => {
    if (!playing) return;
    const track = TRACKS[t];
    let s = 0;
    const stepMs = 60000 / track.bpm / 2;
    const blip = (f: number, len: number, type: OscillatorType, g: number) => {
      const ctx = ac.current!;
      const o = ctx.createOscillator();
      const gain = ctx.createGain();
      o.type = type;
      o.frequency.value = f;
      gain.gain.setValueAtTime(g, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + len);
      o.connect(gain).connect(master.current!);
      o.start();
      o.stop(ctx.currentTime + len + 0.02);
    };
    const id = setInterval(() => {
      const i = s % track.lead.length;
      const l = track.lead[i];
      const b = track.bass[i % track.bass.length];
      if (l && l !== "-") blip(freq(l), (stepMs / 1000) * 1.6, track.wave, 0.35);
      if (b && b !== "-") blip(freq(b), (stepMs / 1000) * 3.5, "triangle", 0.5);
      setStep(s);
      s++;
    }, stepMs);
    return () => clearInterval(id);
  }, [playing, t]);

  useEffect(() => () => void ac.current?.close(), []);

  const toggle = async () => {
    if (!ac.current) {
      ac.current = new AudioContext();
      master.current = ac.current.createGain();
      master.current.gain.value = vol * 0.25;
      master.current.connect(ac.current.destination);
    }
    if (ac.current.state === "suspended") await ac.current.resume();
    if (!playing) emit("tonny-say", { text: "♪ dance break ♪" });
    setPlaying((p) => !p);
  };

  return (
    <div className="tunes">
      <div className="tunes-screen">
        <div className="tunes-marquee">
          <span>
            ♪ now playing: {TRACKS[t].name} ♪ {TRACKS[t].bpm} bpm ♪ made with WebAudio ♪
          </span>
        </div>
        <div className="tunes-bars" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => (
            <span
              key={i}
              style={{
                height: playing ? `${20 + ((step * 7 + i * 13) % 11) * 7}%` : "8%",
              }}
            />
          ))}
        </div>
      </div>
      <div className="tunes-controls">
        <button className="btn98" onClick={() => setT((x) => (x + TRACKS.length - 1) % TRACKS.length)} aria-label="Previous">
          ⏮
        </button>
        <button className="btn98 big" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <button className="btn98" onClick={() => setT((x) => (x + 1) % TRACKS.length)} aria-label="Next">
          ⏭
        </button>
        <label className="vol">
          vol
          <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVol(+e.target.value)} />
        </label>
      </div>
      <ol className="tunes-list">
        {TRACKS.map((tr, i) => (
          <li key={tr.name}>
            <button className={i === t ? "on" : ""} onClick={() => setT(i)}>
              {i + 1}. {tr.name}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------- resume.pdf ----------
export function ResumeApp() {
  return (
    <div className="resume">
      <div className="resume-bar">
        <span>📄 Resume_of_Tanjina_Akhter.pdf</span>
        <div>
          <a className="btn98" href={profile.resume} target="_blank" rel="noreferrer">
            open in new tab ↗
          </a>
          <a className="btn98" href={profile.resume} download="Resume_Tanjina_Akhter_Tonny.pdf">
            download ⤓
          </a>
        </div>
      </div>
      <object data={`${profile.resume}#view=FitH`} type="application/pdf" className="resume-frame" aria-label="Resume PDF">
        <div className="resume-fallback">
          <p>your browser can&apos;t preview PDFs here —</p>
          <a className="btn98" href={profile.resume} download>
            download the resume ⤓
          </a>
        </div>
      </object>
    </div>
  );
}

// ---------- recycle bin ----------
const TRASH = [
  { f: "sleep_schedule.txt", d: "deleted during thesis season" },
  { f: "final_final_v7_REAL.psd", d: "there is always a v8" },
  { f: "mode_collapse.log", d: "the GAN only drew one face for a week" },
  { f: "merge_conflict.diff", d: "resolved (emotionally)" },
  { f: "comic_sans.ttf", d: "…kept a backup just in case" },
];

export function BinApp() {
  const [items, setItems] = useState(TRASH);
  return (
    <div className="bin">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Why it&apos;s here</th>
          </tr>
        </thead>
        <tbody>
          {items.map((x) => (
            <tr key={x.f}>
              <td>🗋 {x.f}</td>
              <td>{x.d}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={2} className="empty">
                ✨ squeaky clean ✨
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="bin-actions">
        <button className="btn98" onClick={() => setItems([])} disabled={!items.length}>
          Empty Recycle Bin
        </button>
        <button className="btn98" onClick={() => setItems(TRASH)}>
          Restore all
        </button>
      </div>
    </div>
  );
}

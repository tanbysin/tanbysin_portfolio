"use client";

import { useEffect, useRef, useState } from "react";
import PixelGirl from "../PixelGirl";
import { profile } from "@/lib/data";
import { emit } from "@/lib/bus";

type Msg = { from: "tonny" | "you"; text: string; italic?: boolean };

const START: Msg[] = [
  { from: "tonny", text: "hiii! thanks for stopping by ✿" },
  { from: "tonny", text: "i build backends, train GANs and design posters" },
  { from: "tonny", text: "wanna work together or just say hi? type below ↓" },
];

const EMOTES = ["✿", "♡", "(◕‿◕)", "☆", "^_^", "♪"];

export default function ContactApp() {
  const [msgs, setMsgs] = useState<Msg[]>(START);
  const [draft, setDraft] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "you", text }]);
    setDraft("");
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "tonny", text: "yay! opening your email app so this actually reaches me ♡" }]);
      const subject = encodeURIComponent(`hello from ${profile.domain}`);
      const body = encodeURIComponent(text);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    }, 700);
  };

  const nudge = () => {
    const w = root.current?.closest(".win");
    if (!w) return;
    w.classList.remove("shake");
    void (w as HTMLElement).offsetWidth;
    w.classList.add("shake");
    setMsgs((m) => [...m, { from: "you", text: "You just sent a nudge!", italic: true }]);
    emit("tonny-say", { text: "hey!! i felt that @_@", mood: "dizzy" });
  };

  return (
    <div className="msn" ref={root}>
      <aside className="msn-side">
        <div className="msn-me">
          <div className="msn-pic">
            <PixelGirl scale={3} expression="smug" />
          </div>
          <div>
            <strong>{profile.nickname}</strong> <span className="online">(Online)</span>
            <div className="msn-psm">♪ building cute things</div>
          </div>
        </div>
        <div className="msn-group">▾ Reach me (3)</div>
        <a className="msn-contact" href={`mailto:${profile.email}`}>
          <span className="dot on" /> email <small>{profile.email}</small>
        </a>
        <a className="msn-contact" href={profile.github} target="_blank" rel="noreferrer">
          <span className="dot on" /> GitHub <small>@{profile.handle}</small>
        </a>
        <a className="msn-contact" href={profile.linkedin} target="_blank" rel="noreferrer">
          <span className="dot away" /> LinkedIn <small>@{profile.handle}</small>
        </a>
        <div className="msn-group">▾ Based in (1)</div>
        <div className="msn-contact static">
          <span className="dot on" /> {profile.location}
        </div>
      </aside>

      <div className="msn-chat">
        <div className="msn-to">
          To: <strong>tonny</strong> &lt;{profile.email}&gt;
        </div>
        <div className="msn-log" ref={log} aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`msn-line ${m.from}`}>
              {m.italic ? (
                <em>{m.text}</em>
              ) : (
                <>
                  <b>{m.from === "tonny" ? "tonny says:" : "you say:"}</b>
                  <span>{m.text}</span>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="msn-tools">
          {EMOTES.map((e) => (
            <button key={e} className="emote" onClick={() => setDraft((d) => d + e)} aria-label={`insert ${e}`}>
              {e}
            </button>
          ))}
          <button className="emote nudge" onClick={nudge}>
            nudge!
          </button>
        </div>
        <div className="msn-compose">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="type a message…"
            aria-label="Your message"
          />
          <button className="btn98 send" onClick={send} disabled={!draft.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

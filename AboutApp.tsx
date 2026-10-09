"use client";

import { useState } from "react";
import PixelGirl, { type Expression } from "../PixelGirl";
import { profile } from "@/lib/data";

const MOODS: Expression[] = ["happy", "wink", "love", "surprised", "smug", "happy"];

export default function AboutApp() {
  const [mood, setMood] = useState(0);
  return (
    <div className="about">
      <div className="about-card">
        <div className="about-portrait">
          <button
            className="about-sky"
            onClick={() => setMood((m) => (m + 1) % MOODS.length)}
            title="click me!"
            aria-label="Change tonny's expression"
          >
            <PixelGirl scale={7} expression={MOODS[mood]} />
          </button>
          <div className="about-name">
            <strong>{profile.nickname}</strong>
            <span>● online · say hi!</span>
          </div>
        </div>
        <ul className="about-facts">
          {profile.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="about-text">
        <h2 className="hand">{profile.name}</h2>
        <p className="about-tag">{profile.tagline}</p>
        {profile.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <div className="about-lists">
        <div className="mini-win">
          <div className="mini-title">likes.exe</div>
          <ul>
            {profile.likes.map((l) => (
              <li key={l}>♡ {l}</li>
            ))}
          </ul>
        </div>
        <div className="mini-win alt">
          <div className="mini-title">dislikes.exe</div>
          <ul>
            {profile.dislikes.map((l) => (
              <li key={l}>✕ {l}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

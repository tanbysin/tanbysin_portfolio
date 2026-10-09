"use client";

import { useState } from "react";
import Icon from "../Icons";
import { projects, profile, experience } from "@/lib/data";

export function ProjectsApp() {
  const [sel, setSel] = useState(projects[0].id);
  const p = projects.find((x) => x.id === sel) ?? projects[0];
  return (
    <div className="explorer">
      <div className="addr">
        <span>Address</span>
        <div className="addr-box">C:\tonny\projects\{p.file}</div>
      </div>
      <div className="explorer-main">
        <div className="file-grid" role="listbox" aria-label="Projects">
          {projects.map((x) => (
            <button
              key={x.id}
              role="option"
              aria-selected={x.id === sel}
              className={`file ${x.id === sel ? "sel" : ""}`}
              onClick={() => setSel(x.id)}
            >
              <span className="file-ico">
                <Icon name={x.featured ? "projects" : "folder"} size={44} />
                {x.featured && <span className="file-badge">★</span>}
              </span>
              <span className="file-name">{x.file}</span>
            </button>
          ))}
        </div>
        <article className="details" key={p.id}>
          <div className="details-kind">
            {p.kind} · {p.year}
          </div>
          <h3 className="hand">{p.name}</h3>
          <p>{p.blurb}</p>
          <div className="chips">
            {p.tags.map((t) => (
              <span className="chip" key={t}>
                {t}
              </span>
            ))}
          </div>
          <a className="btn98" href={profile.github} target="_blank" rel="noreferrer">
            more on GitHub ↗
          </a>
        </article>
      </div>
    </div>
  );
}

export function ExperienceApp() {
  return (
    <div className="career">
      {experience.map((e, i) => (
          <div className="career-item" key={e.role + e.org} style={{ animationDelay: `${i * 90}ms` }}>
            <div className="career-dot" style={{ background: e.color }} />
            <div className="career-card" style={{ borderTopColor: e.color }}>
              <div className="career-head">
                <strong>{e.role}</strong>
                <span className="career-when">{e.when}</span>
              </div>
              <div className="career-org">{e.org}</div>
              <ul>
                {e.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
      ))}
    </div>
  );
}

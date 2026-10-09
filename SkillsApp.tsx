"use client";

import { education, ielts, skills } from "@/lib/data";

export function SkillsApp() {
  return (
    <div className="skills">
      <p className="hint">✿ installed programs on tonny's brain ✿</p>
      <div className="skill-groups">
        {skills.map((g, i) => (
          <fieldset className="skill-group" key={g.group} style={{ animationDelay: `${i * 70}ms` }}>
            <legend style={{ background: g.color }}>{g.group}</legend>
            <div className="chips">
              {g.items.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <fieldset className="skill-group">
        <legend style={{ background: "var(--pink)" }}>Languages spoken</legend>
        <div className="chips">
          <span className="chip">Bangla · native</span>
          <span className="chip">English · fluent</span>
        </div>
        <table className="ielts">
          <caption>IELTS</caption>
          <thead>
            <tr>
              {ielts.map((x) => (
                <th key={x.k}>{x.k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {ielts.map((x) => (
                <td key={x.k}>{x.v}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </fieldset>
    </div>
  );
}

export function EducationApp() {
  return (
    <div className="edu">
      {education.map((e, i) => (
        <div className="edu-row" key={e.degree} style={{ animationDelay: `${i * 90}ms` }}>
          <div className="edu-year">{e.when}</div>
          <div className="edu-main">
            <strong>{e.degree}</strong>
            <span>{e.school}</span>
          </div>
          <div className="edu-grade">{e.grade}</div>
        </div>
      ))}
      <p className="hint">★ gold stars for 5.00 / 5.00 twice ★</p>
    </div>
  );
}

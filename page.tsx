import Desktop from "@/components/Desktop";
import { education, experience, profile, projects } from "@/lib/data";

export default function Home() {
  return (
    <main>
      {/* Plain-text version for search engines & screen readers */}
      <div className="sr-only">
        <h1>{profile.name}</h1>
        <p>{profile.tagline}</p>
        {profile.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <h2>Projects</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              {p.name} ({p.year}): {p.blurb}
            </li>
          ))}
        </ul>
        <h2>Experience</h2>
        <ul>
          {experience.map((e) => (
            <li key={e.role + e.org}>
              {e.role}, {e.org} ({e.when})
            </li>
          ))}
        </ul>
        <h2>Education</h2>
        <ul>
          {education.map((e) => (
            <li key={e.degree}>
              {e.degree}, {e.school} ({e.when})
            </li>
          ))}
        </ul>
        <p>
          Contact: <a href={`mailto:${profile.email}`}>{profile.email}</a> · <a href={profile.github}>GitHub</a> ·{" "}
          <a href={profile.linkedin}>LinkedIn</a>
        </p>
      </div>
      <Desktop />
    </main>
  );
}

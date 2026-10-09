// Hand-drawn-ish pastel desktop icons (48x48). Thick plum outlines, flat pastel fills.
import type { ReactElement } from "react";

const S = { stroke: "#4a3558", strokeWidth: 2.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type IconName =
  | "about"
  | "projects"
  | "experience"
  | "education"
  | "skills"
  | "contact"
  | "paint"
  | "resume"
  | "tunes"
  | "bin"
  | "game"
  | "folder";

const icons: Record<IconName, ReactElement> = {
  about: (
    <>
      <path d="M11 5h20l8 8v30H11z" fill="#fffaf3" {...S} />
      <path d="M31 5v8h8" fill="#ffc4dd" {...S} />
      <path d="M16 20h17M16 26h17M16 32h11" {...S} strokeWidth={2} />
      <path d="M31 38c-2-2-5-3-5-5.5a2.3 2.3 0 0 1 5-.6 2.3 2.3 0 0 1 5 .6c0 2.5-3 3.5-5 5.5z" fill="#ff9ec7" {...S} strokeWidth={1.8} />
    </>
  ),
  projects: (
    <>
      <path d="M4 13h15l4 4h21v24H4z" fill="#ffe28a" {...S} />
      <path d="M4 20h40v21H4z" fill="#fff1a8" {...S} />
      <path d="M20 26l2 4 4.5.6-3.3 3 .8 4.4-4-2.2-4 2.2.8-4.4-3.3-3 4.5-.6z" fill="#ff9ec7" {...S} strokeWidth={1.8} />
    </>
  ),
  folder: (
    <>
      <path d="M4 13h15l4 4h21v24H4z" fill="#cdb8ff" {...S} />
      <path d="M4 20h40v21H4z" fill="#e4d9ff" {...S} />
    </>
  ),
  experience: (
    <>
      <path d="M18 14v-4h12v4" fill="none" {...S} />
      <rect x="5" y="14" width="38" height="26" rx="4" fill="#bff0d4" {...S} />
      <path d="M5 24h38" {...S} />
      <rect x="20" y="21" width="8" height="7" rx="1.5" fill="#ffc4dd" {...S} strokeWidth={2} />
    </>
  ),
  education: (
    <>
      <path d="M24 9 3 19l21 10 21-10z" fill="#cdb8ff" {...S} />
      <path d="M12 23v10c4 4 20 4 24 0V23" fill="#e4d9ff" {...S} />
      <path d="M41 21v11" {...S} />
      <circle cx="41" cy="34" r="2.5" fill="#ff9ec7" {...S} strokeWidth={2} />
    </>
  ),
  skills: (
    <>
      <rect x="5" y="7" width="38" height="27" rx="3" fill="#bfe3ff" {...S} />
      <rect x="10" y="12" width="28" height="17" fill="#fffaf3" {...S} strokeWidth={2} />
      <path d="M17 39h14M24 34v5" {...S} />
      <path d="M24 15l1.6 3.8 4 .4-3 2.7.9 4-3.5-2.1-3.5 2.1.9-4-3-2.7 4-.4z" fill="#fff1a8" {...S} strokeWidth={1.6} />
    </>
  ),
  contact: (
    <>
      <rect x="5" y="11" width="38" height="27" rx="3" fill="#ffc4dd" {...S} />
      <path d="M5 13l19 14 19-14" fill="none" {...S} />
      <path d="M24 40c-3-2.5-6.5-4-6.5-7a3 3 0 0 1 6.5-.8 3 3 0 0 1 6.5.8c0 3-3.5 4.5-6.5 7z" fill="#ff7eb0" {...S} strokeWidth={2} />
    </>
  ),
  paint: (
    <>
      <path d="M24 6C12 6 4 14 4 23c0 8 6 13 12 13 4 0 4-4 7-4 3 0 3 7 9 7 7 0 12-7 12-15C44 14 36 6 24 6z" fill="#fffaf3" {...S} />
      <circle cx="14" cy="21" r="3.2" fill="#ff9ec7" {...S} strokeWidth={1.8} />
      <circle cx="22" cy="14" r="3.2" fill="#b9a3ff" {...S} strokeWidth={1.8} />
      <circle cx="32" cy="15" r="3.2" fill="#8fe0b5" {...S} strokeWidth={1.8} />
      <circle cx="36" cy="25" r="3.2" fill="#ffe28a" {...S} strokeWidth={1.8} />
      <path d="M40 38 28 26" stroke="#4a3558" strokeWidth={5} strokeLinecap="round" />
      <path d="M40 38 30 28" stroke="#ffc4dd" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  resume: (
    <>
      <path d="M11 5h20l8 8v30H11z" fill="#fffaf3" {...S} />
      <path d="M31 5v8h8" fill="#cdb8ff" {...S} />
      <rect x="14" y="27" width="22" height="10" rx="2" fill="#ff9ec7" {...S} strokeWidth={2} />
      <text x="25" y="35" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#4a3558">
        CV
      </text>
      <path d="M17 13h9M17 18h15M17 22h12" {...S} strokeWidth={2} />
    </>
  ),
  tunes: (
    <>
      <rect x="4" y="11" width="40" height="27" rx="4" fill="#bff0d4" {...S} />
      <rect x="10" y="16" width="28" height="11" rx="5.5" fill="#fffaf3" {...S} strokeWidth={2} />
      <circle cx="16" cy="21.5" r="3" fill="#ff9ec7" {...S} strokeWidth={1.8} />
      <circle cx="32" cy="21.5" r="3" fill="#ff9ec7" {...S} strokeWidth={1.8} />
      <path d="M13 38l3-6h16l3 6" fill="#8fe0b5" {...S} strokeWidth={2} />
    </>
  ),
  game: (
    <>
      <rect x="4" y="12" width="40" height="26" rx="12" fill="#ffc4dd" {...S} />
      <path d="M13 21v8M9 25h8" {...S} />
      <circle cx="31" cy="22" r="2.6" fill="#b9a3ff" {...S} strokeWidth={1.8} />
      <circle cx="36" cy="28" r="2.6" fill="#8fe0b5" {...S} strokeWidth={1.8} />
      <rect x="31" y="3" width="11" height="15" rx="2" fill="#e8394a" {...S} strokeWidth={2} transform="rotate(14 36 10)" />
      <rect x="32.5" y="8" width="8" height="4" fill="#fffaf3" transform="rotate(14 36 10)" />
    </>
  ),
  bin: (
    <>
      <path d="M10 14h28l-3 27H13z" fill="#e4d9ff" {...S} />
      <path d="M7 14h34M19 14v-4h10v4" fill="none" {...S} />
      <path d="M18 20l1 16M24 20v16M30 20l-1 16" {...S} strokeWidth={2} />
    </>
  ),
};

export default function Icon({ name, size = 48 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="icon-svg">
      {icons[name]}
    </svg>
  );
}

"use client";

// Pixel-art redhead girl, drawn from text grids. Each char maps to a colour.
export const PALETTE: Record<string, string> = {
  O: "#4a3558", // outline
  H: "#e8673f", // copper hair
  h: "#c24a2c", // hair shade
  S: "#ffdcc8", // skin
  E: "#3b2a4a", // eyes
  G: "#ffffff", // eye shine
  B: "#ff9fb8", // blush
  M: "#d9536f", // mouth
  T: "#7cc4ff", // tear
  D: "#b9a3ff", // dress
  d: "#9b85ec", // dress shade
  W: "#ffffff", // collar
  L: "#ffc4dd", // tights
  K: "#6b4a7a", // shoes
  R: "#ff7eb0", // bow / heart eyes
};

export type Expression =
  | "neutral"
  | "blink"
  | "happy"
  | "love"
  | "wink"
  | "surprised"
  | "sleepy"
  | "sad"
  | "dizzy"
  | "smug"
  | "sip";

// 4 rows × 8 cols painted over the face (rows 5–8, cols 4–11)
const FACES: Record<Expression, string[]> = {
  neutral:   ["SSSSSSSS", "SESSSSES", "SBSSSSBS", "HSSSMSSH"],
  blink:     ["SSSSSSSS", "SEESSEES", "SBSSSSBS", "HSSSMSSH"],
  happy:     ["SESSSSES", "ESESSESE", "BSSSSSSB", "HSSMMSSH"],
  love:      ["RSRSSRSR", "RRRSSRRR", "SRSSSSRS", "HSSMMSSH"],
  wink:      ["SSSSSSSS", "SESSSEES", "SBSSSSBS", "HSSSMMSH"],
  surprised: ["SESSSSES", "SESSSSES", "SBSMMSBS", "HSSMMSSH"],
  sleepy:    ["SSSSSSSS", "SEESSEES", "SSSSSSSS", "HSSSOSSH"],
  sad:       ["SSSSSSSS", "SESSSSES", "STSSSSTS", "HSSOOSSH"],
  dizzy:     ["ESESSESE", "SESSSSES", "ESESSESE", "HSSMMSSH"],
  smug:      ["SSSSSSSS", "SEESSEES", "BSSSSSSB", "HSSSMMMH"],
  sip:       ["SSSSSSSS", "SEESSEES", "BSSSSSSB", "HSSSOSSH"],
};

const HEAD = [
  "....OOOOOOOO....",
  "...OHHHHHHHHORRO",
  "..OHHHHHHHHHHORO",
  ".OHHHHHHHHHHHHO.",
  ".OHHHSSSSSSHHHO.",
  ".OHHSSSSSSSSHHO.",
  ".OHHSESSSSESHHO.",
  ".OHHSBSSSSBSHHO.",
  ".OHHHSSSMSSHHHO.",
  "OhHHHOSSSSOHHHhO",
  "OhHHOWDDDDWOHHhO",
  "OhHOSDDDDDDSOHhO",
  ".OhOSDDDDDDSOhO.",
  "..OOSDDDDDDSOO..",
  "...ODDDDDDDDO...",
  "..ODDDDDDDDDDO..",
  "..OddddddddddO..",
  "...OOOOOOOOOO...",
];

// arm raised to the mouth (holding a can) replaces rows 11–13
const ARM_UP = ["OhHOSDDDDDDOSHhO", ".OhOSDDDDDDOSOO.", "..OOSDDDDDDOO..."];

const LEGS_IDLE = ["....OLLO.OLLO...", "....OLLO.OLLO...", "....OKKO.OKKO...", "....OOOO.OOOO..."];
const LEGS_A = ["...OLLO...OLLO..", "...OLLO...OLLO..", "...OKKO...OKKO..", "...OOOO...OOOO.."];
const LEGS_B = ["....OLLOOLLO....", ".....OLLOLLO....", ".....OKKOKKO....", ".....OOOOOOO...."];

export function buildGrid(frame: 0 | 1 | 2 = 0, expression: Expression = "neutral") {
  const legs = frame === 1 ? LEGS_A : frame === 2 ? LEGS_B : LEGS_IDLE;
  const rows = [...HEAD, ...legs];
  const face = FACES[expression];
  for (let i = 0; i < 4; i++) {
    const y = 5 + i;
    rows[y] = rows[y].slice(0, 4) + face[i] + rows[y].slice(12);
  }
  if (expression === "sip") {
    for (let i = 0; i < 3; i++) rows[11 + i] = ARM_UP[i];
  }
  return rows;
}

type Props = {
  scale?: number;
  frame?: 0 | 1 | 2;
  expression?: Expression;
  className?: string;
};

export default function PixelGirl({ scale = 4, frame = 0, expression = "neutral", className }: Props) {
  const grid = buildGrid(frame, expression);
  const w = 16;
  const h = grid.length;
  const rects: React.ReactElement[] = [];
  grid.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      const c = row[x];
      if (!c || c === ".") continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={PALETTE[c]} />);
    }
  });
  return (
    <svg
      className={className}
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}

// A generic red cola can (no brand marks) — used by the avatar and the game.
export function ColaCan({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.55} viewBox="0 0 20 31" aria-hidden="true">
      <rect x="2" y="3" width="16" height="25" rx="3" fill="#e8394a" stroke="#4a3558" strokeWidth="1.6" />
      <rect x="4" y="1" width="12" height="3" rx="1" fill="#d9d4e6" stroke="#4a3558" strokeWidth="1.2" />
      <rect x="4" y="27" width="12" height="3" rx="1" fill="#d9d4e6" stroke="#4a3558" strokeWidth="1.2" />
      <rect x="4" y="11" width="12" height="8" rx="1.5" fill="#fffaf3" />
      <text x="10" y="17.4" textAnchor="middle" fontSize="5.6" fontWeight="700" fontFamily="Gaegu, cursive" fill="#e8394a">
        cola
      </text>
      <circle cx="6" cy="7" r="1" fill="#ffc4dd" />
      <circle cx="8.5" cy="23" r="0.9" fill="#ffc4dd" />
      <circle cx="14" cy="22" r="1.2" fill="#ffc4dd" />
      <path d="M5 5v5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

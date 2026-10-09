// ✿ All portfolio content lives here — edit this file to update the site.

export const profile = {
  name: "Tanjina Akhter Tonny",
  nickname: "tonny",
  handle: "tanbysin",
  domain: "tanbysin.com",
  location: "Dhaka, Bangladesh",
  email: "tanjinaahkter@gmail.com",
  github: "https://github.com/tanbysin",
  linkedin: "https://www.linkedin.com/in/tanbysin",
  resume: "/resume.pdf",
  tagline: "backend dev · ML tinkerer · poster & pixel maker",
  intro: [
    "hi, i'm tonny! ✿ a Computer Science & Engineering graduate from the University of Asia Pacific (class of '25).",
    "i build backends with Django REST Framework, and for my thesis i taught a conditional GAN to draw faces from Bangla text descriptions using BanglaBERT.",
    "outside the terminal i design event posters, model things in Blender & Cinema 4D, take photos, and host events on stage.",
  ],
  facts: [
    "📍 Dhaka, Bangladesh",
    "🎓 CSE @ UAP · CGPA 3.62",
    "💻 backend + ML",
    "🎤 club president & host",
    "🌏 Bangla · English (IELTS 7.0)",
  ],
  likes: ["blender renders", "poster design", "photography", "hosting events", "new creative tools", "clean APIs"],
  dislikes: ["merge conflicts", "404s", "laggy renders", "mode collapse", "unlabeled data"],
};

export type Project = {
  id: string;
  name: string;
  file: string;
  year: string;
  kind: string;
  blurb: string;
  tags: string[];
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: "banglafacegen",
    name: "BanglaFaceGen",
    file: "banglafacegen.gan",
    year: "2025",
    kind: "Undergraduate thesis",
    blurb:
      "Facial image generation from Bangla text descriptions. You describe a face in Bangla, BanglaBERT turns the words into embeddings, and a conditional GAN draws the face.",
    tags: ["Conditional GAN", "BanglaBERT", "Bangla NLP", "Computer vision"],
    featured: true,
  },
  {
    id: "vintique",
    name: "Vintique",
    file: "vintique.shop",
    year: "2025",
    kind: "Web platform",
    blurb: "A preloved fashion e-commerce platform, giving good clothes a second life.",
    tags: ["E-commerce", "Web"],
  },
  {
    id: "minicompiler",
    name: "Mini Compiler",
    file: "mini_compiler.c",
    year: "2025",
    kind: "Systems",
    blurb: "A basic compiler implementing lexical analysis and parsing.",
    tags: ["Compilers", "Lexer", "Parser"],
  },
  {
    id: "pacman",
    name: "Pacman Game",
    file: "pacman.exe",
    year: "2025",
    kind: "Game",
    blurb: "The classic arcade maze game, rebuilt from scratch with OpenGL.",
    tags: ["OpenGL", "Graphics", "Game"],
  },
  {
    id: "uniconnect",
    name: "UniConnect",
    file: "uniconnect.web",
    year: "2024",
    kind: "Web platform",
    blurb: "A platform for university students to share assignments and resources.",
    tags: ["Web", "Community"],
  },
  {
    id: "traffic",
    name: "Traffic Incident Management System",
    file: "traffic_sos.web",
    year: "2024",
    kind: "Web platform",
    blurb: "A volunteer-based system for reporting road incidents.",
    tags: ["Web", "Civic tech"],
  },
];

export const experience = [
  {
    role: "Backend Web Developer Intern",
    org: "Eutropia IT",
    when: "Jul 2025 – Oct 2025",
    color: "var(--lav)",
    points: [
      "Contributed to the ez-bebsha e-commerce platform and its multi-theme template system.",
      "Worked on internal projects built with Django REST Framework.",
    ],
  },
  {
    role: "President",
    org: "Career Development Club, University of Asia Pacific",
    when: "2023 – 2025",
    color: "var(--pink)",
    points: [
      "Led club activities; organized a job fair and ideathon events.",
      "Managed the team & partnerships, logistics and coordination.",
    ],
  },
  {
    role: "Host",
    org: "Robotics Club, University of Asia Pacific",
    when: "2024",
    color: "var(--mint)",
    points: ["Hosted Robo Expo; managed audience engagement & stage flow."],
  },
  {
    role: "Host",
    org: "Cultural Club, University of Asia Pacific",
    when: "2022",
    color: "var(--butter)",
    points: ["Hosted a cultural competition event and kept the program running smoothly."],
  },
];

export const education = [
  {
    degree: "B.Sc. in Computer Science and Engineering",
    school: "University of Asia Pacific",
    when: "Jan 2022 – Dec 2025",
    grade: "CGPA 3.62 / 4.00",
  },
  {
    degree: "Higher Secondary Certificate",
    school: "Tejgaon Mohila College, Dhaka",
    when: "Jul 2018 – Jul 2020",
    grade: "GPA 5.00 / 5.00",
  },
  {
    degree: "Secondary School Certificate",
    school: "Bottomley Home Girls' High School, Dhaka",
    when: "until May 2018",
    grade: "GPA 5.00 / 5.00",
  },
];

export const skills = [
  { group: "Languages", color: "var(--lav)", items: ["C", "C++", "Java", "SQL", "Python", "TypeScript", "x86 Assembly"] },
  { group: "Frameworks", color: "var(--pink)", items: ["Django", "Django REST Framework", "ReactJS", "OpenGL"] },
  { group: "Software", color: "var(--mint)", items: ["VS Code", "Git", "MATLAB", "AutoCAD"] },
  { group: "Creative", color: "var(--peach)", items: ["Blender", "Maxon Cinema 4D", "Graphic design", "Photography"] },
  { group: "OS", color: "var(--sky)", items: ["Windows", "Linux (Ubuntu)", "macOS"] },
  { group: "AI", color: "var(--butter)", items: ["Agentic AI with Claude Code", "GANs", "BanglaBERT"] },
];

export const ielts = [
  { k: "Listening", v: "8.0" },
  { k: "Reading", v: "7.0" },
  { k: "Speaking", v: "7.5" },
  { k: "Writing", v: "6.0" },
  { k: "Overall", v: "7.0" },
];

export const avatarLines = [
  "hiii! i'm tonny ✿",
  "double-click an icon to explore!",
  "click anywhere & i'll walk there ♡",
  "psst… try the arrow keys!",
  "have you tried Paint yet? draw me something!",
  "my thesis teaches a GAN to draw faces from Bangla text!",
  "tunes.exe has chiptunes ♪",
  "win me a cola in cola_catch.exe 🥤",
  "poke me a few times… i dare you",
  "you can drag the stickers around!",
  "want to work together? open Messenger ✉",
];

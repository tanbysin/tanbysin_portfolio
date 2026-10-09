# ✿ tonnyOS — tanbysin.com

Portfolio of **Tanjina Akhter Tonny**, built as a pastel retro desktop.
Next.js (App Router) · React · TypeScript · plain CSS. No UI libraries.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production build
```

## What's inside

| Desktop icon   | What it opens |
| -------------- | ------------- |
| about_me.txt   | Notepad-style intro, profile card, likes.exe / dislikes.exe |
| projects       | Explorer window — click a file to see project details (thesis is starred) |
| career.exe     | Experience timeline |
| skills         | "Control Panel" of skills + IELTS scores |
| school.exe     | Education |
| messenger      | Messenger-style contact window (Send opens the visitor's email app; nudge shakes the window) |
| Paint          | Working paint app: pencil, brush, airbrush, eraser, fill bucket, heart/star stamps, save as PNG |
| resume.pdf     | Embedded CV + download |
| cola.exe       | "Cola Catch" mini-game: catch stars (+1) and hearts (+2), dodge bugs (3 lives). Every 10 points wins a cola; colas go in a fridge and "drink a cola" makes both avatars drink it. High score is saved in the browser |
| tunes.exe      | Tiny chiptune player (WebAudio, no audio files) |
| Recycle Bin    | Jokes |

Plus: boot screen, start menu, taskbar with clock, draggable / minimizable / maximizable windows,
a walking pixel-art redhead avatar (click the desktop or use arrow keys / WASD; click her to chat) with
11 expressions — happy, love, wink, surprised, smug, sad, dizzy (poke her 5 times fast), sleepy (leave her alone ~20s),
blinking, and drinking cola. Apps can set her mood via `emit("tonny-say", { text, mood })`,
draggable floating stickers, floating sparkles/hearts/bubbles and a sparkle cursor trail.
Animations switch off automatically for visitors with "reduce motion" enabled. On phones, icons open with one tap and windows go full-screen.

## Editing content

Almost everything lives in **`lib/data.ts`** — bio, projects, experience, education, skills, links and the avatar's speech lines.
Replace `public/resume.pdf` to update the CV.

| File | Purpose |
| ---- | ------- |
| `components/Desktop.tsx` | Window manager, icons, taskbar, start menu, boot screen. Add/rename apps in the `APPS` list |
| `components/Avatar.tsx` | Avatar movement + speech |
| `components/PixelGirl.tsx` | The pixel sprite (edit the text grids to change her look) |
| `components/Icons.tsx` | Desktop icons (SVG) |
| `components/Decor.tsx` | Stickers, floaties, cursor trail |
| `components/apps/*` | Each window's content |
| `app/globals.css` | All styling; colour tokens at the top |

## Deploy to tanbysin.com (Vercel, free)

1. Push this folder to a GitHub repo (e.g. `tanbysin/portfolio`).
2. On vercel.com → **Add New Project** → import the repo → Deploy (no settings needed).
3. Project → **Settings → Domains** → add `tanbysin.com` and `www.tanbysin.com`.
4. At your domain registrar, add the DNS records Vercel shows you
   (usually an `A` record `@ → 76.76.21.21` and a `CNAME` `www → cname.vercel-dns.com`).

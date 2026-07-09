
# Personal Portfolio — Ayush Patra-style hero + "My Universe" island

Pivoting the plan to match the reference site you shared (ayushpatra.com) for the **hero + overall structure**, while keeping the **isometric "personal universe" island** as the scroll-reveal centerpiece below the hero. Best of both.

## Structure

```text
[Hero — full viewport, ayushpatra.com style]
  Top-left:  "[Your Name]."  pill logo
  Top-right: menu icon
  Left rail (vertical):  About · Experience · Projects · Hobbies · Contact
  Center:    "Hi, I'm [Your Name]."   (huge display type)
             "Mechatronics @ Waterloo · I build, I code, I score."
             "Currently: [Credvan / current role]"
             [ About Me → ] pill button
  Bottom-left: GitHub · LinkedIn · Instagram icons
  Bottom-center: "Currently building ⚙ Credvan"  pill
  Bottom-right:  [ Email ] pill
  Background: animated dark radial gradient (indigo → magenta → warm red),
              slow drift — matches reference

        │  (user scrolls)
        ▼
[Universe section — 100vh sticky]
  Full-bleed AI-generated isometric island
  Roaming car overlay
  Hoverable/clickable landmarks → route to each section
  Section label appears on hover ("Experience →")

        │
        ▼
[Short preview strips for each section as fallback nav]

        │
        ▼
[Footer]
```

## Pages (dedicated routes)

- `/` — hero + universe + strips
- `/about` — Mechatronics @ Waterloo, Presidential Scholarship, story
- `/experience` — Credvan + past roles (timeline)
- `/projects` — BitGold, robotics (Silambam Motion Sensor, Color-Sorting Robot), IIT Madras AI/ML
- `/hobbies` — Soccer (striker) front and center, plus other interests
- `/contact` — Email, LinkedIn, GitHub, resume download slot

Each page inherits the dark gradient aesthetic so the whole site feels like one world.

## Visual system

- **Palette** (matches ayushpatra.com reference):
  - Background: near-black `oklch(0.12 0.02 280)` with animated radial gradient blobs in **deep indigo** `#3a2a8a`, **magenta** `#a8306c`, **warm red** `#c9432a`
  - Foreground: near-white
  - Accent: warm coral for CTAs and hover states
- **Type**: **Fraunces** (display, warm serif with character — like the reference's headline weight) + **Inter Tight** (body). Distinct, not generic.
- **Radius**: fully rounded pills for buttons/labels (matches reference)
- **Motion**: slow background gradient drift, subtle hover lift on nav, scroll-linked reveal for universe

## Hero content (using what you told me)

- **Name**: [your full name — needed]
- **Headline**: "Hi, I'm [Name]."
- **Tagline**: "Mechatronics @ Waterloo. I code, I solve, I build, I score."
- **Currently**: "Currently: [Credvan role — needed]"
- **CTA**: About Me →
- **Now-playing-style pill**: "Currently building ⚙ Credvan" (or swap for something else you want)
- **Socials**: GitHub, LinkedIn, Instagram [URLs needed] + Email pill

## The universe (below hero)

Generated as one high-quality isometric island image via the premium image model, then overlaid with clickable hotspots. Landmarks tied to your real life:

| Landmark | Route |
|---|---|
| Waterloo campus + Mechatronics workshop (gears, robot arm) | `/about` |
| Credvan HQ tower + vault | `/experience` |
| Lab bench (BitGold, robotics, AI chips) | `/projects` |
| Soccer pitch with goal | `/hobbies` |
| Lighthouse / mailbox | `/contact` |
| Roaming car on the roads between them | — |

Hover → floating label. Click → navigate.

## Technical build

- TanStack Start, Tailwind v4, shadcn — existing stack
- Route files: `about.tsx`, `experience.tsx`, `projects.tsx`, `hobbies.tsx`, `contact.tsx`, each with its own `head()` (unique title, description, og:title, og:description)
- Fonts via `@fontsource/fraunces` + `@fontsource/inter-tight` (bun add)
- Design tokens added to `src/styles.css` as semantic vars (no hardcoded colors in components)
- Hero background: layered CSS radial gradients with `@keyframes` slow drift
- Universe hero: one generated image in `src/assets/`, absolute-positioned `<Link>` hotspots
- Roaming car: small SVG animated with CSS `offset-path` along an invisible path
- Fully responsive: on mobile, hero collapses (nav becomes hamburger), universe becomes tap-to-label-then-tap-to-navigate
- Resume: `/contact` gets a "Download resume" button — placeholder until you upload the PDF, then I swap in the Lovable Asset URL

## Build order

1. Design tokens (palette, radii, shadows) + fonts + empty routes with proper `head()`
2. Hero page matching ayushpatra.com composition — nail this before moving on so you can approve the vibe
3. Generate the universe island image (I'll show first render before wiring)
4. Wire universe hotspots + roaming car
5. Section pages with your real content (About, Experience @ Credvan, Projects, Hobbies/Soccer, Contact)
6. Mobile pass

## What I still need from you (can start without, but need before finishing)

- **Full name** for the hero
- **Current role at Credvan** (exact wording) — or whatever "Currently:" line you want
- **GitHub / LinkedIn / Instagram URLs**
- **Email** you want shown
- **Resume PDF** whenever ready
- Any specific project details (BitGold blurb, robotics project names, IIT Madras work summary) — otherwise I'll use placeholder copy you edit later

## Honest expectations

- Hero will match the reference's feel closely — that composition is very achievable
- The isometric island image may take 2–3 regenerations to nail; I'll show each one
- If you later want true rotatable 3D on the island, that's a Spline upgrade in a future pass — the rest of the site stays put

# Dronly

Marketing site for **Dronly**, an aerial production studio offering event
coverage and real estate drone shooting.

The centrepiece is a single continuous 3D flight: one drone, fixed behind the
document, choreographed against the page's narrative as you scroll — hero →
studio → events → real estate → work → booking.

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (with the Tailwind class sorter) |

---

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — design tokens live in `@theme` inside `src/app/globals.css`
- **React Three Fiber** + **@react-three/drei** for the 3D layer
- **GSAP + ScrollTrigger** for scroll-scrubbed transforms (parallax, hero drift)
- **Framer Motion** for entrance reveals, the menu overlay and the mobile stage
- **Lenis** for smooth scrolling

### Two notes on the brief

**`@react-three/scroll-controls` does not exist as a package.** `ScrollControls`
ships inside `@react-three/drei`. More importantly, it was the wrong tool here:
it creates its own scroll container *inside* the canvas, which would have meant
proxying ScrollTrigger through a custom scroller and rebuilding every section
for the mobile path where there is no canvas at all. Instead the document
scrolls natively, and `ScrollProvider` publishes a single scroll value that
both the 3D layer and the DOM layer read. GSAP works untouched, and the
sections are identical in all three rendering tiers.

**The design reference is a light, warm, editorial system** (cream canvas, one
violet accent, 20px radii, an ultra-heavy condensed display face) while the
brief asked for dark and premium. Rather than pick one, the page alternates:
cream editorial bands carry the copy, and full-bleed **sky bands** — the
reference's own "dark hero photo zones", surface level 3 — open onto the 3D
flight. The curved cream masks between them are the reference's signature
section transition.

---

## Structure

```
src/
├─ app/
│  ├─ layout.tsx          Fonts, metadata, providers, fixed backdrop
│  ├─ page.tsx            Section order == the flight plan
│  └─ globals.css         @theme design tokens + display type utilities
│
├─ components/
│  ├─ providers/
│  │  └─ ScrollProvider   Lenis + scroll→stage mapping, ref-based state
│  ├─ three/
│  │  ├─ AerialStage      Picks the rendering tier, code-splits the canvas
│  │  ├─ SceneCanvas      The <Canvas> (dynamic import, ssr:false)
│  │  ├─ DroneScene       Camera rig + scene composition
│  │  ├─ DroneRig         Scroll → flight. All motion lives here.
│  │  ├─ Drone            Procedural aircraft (swap for a GLTF, see below)
│  │  ├─ SceneEnvironment Lights, terrain, atmosphere, flight-plan line
│  │  ├─ LiteStage        Framer Motion fallback (mobile) + static fallback
│  │  ├─ DroneGlyph       Flat SVG aircraft shared by both fallbacks
│  │  └─ SceneLoader      Pure-CSS placeholder while the 3D chunk streams
│  ├─ sections/           Hero, Manifesto, Events, RealEstate, Work, Contact
│  └─ ui/                 Button, Card, Section/Band, Reveal, MediaFrame,
│                         Nav, Footer, Marquee, Parallax, ScrollProgress,
│                         InlineThumb
│
├─ hooks/                 useReducedMotion, useSceneTier
└─ lib/
   ├─ site.ts             All copy and showcase data
   ├─ flight.ts           The keyframed flight path
   ├─ gsap.ts             Lazy GSAP loader + ScrollTrigger sync
   └─ utils.ts            cn, lerp, damp, mapRange, smoothstep
```

---

## How the scroll animation works

**1. One scroll value, published from a ref.** `ScrollProvider` runs Lenis and
writes `{ y, progress, stage, velocity }` into a `useRef`. Nothing re-renders
on scroll — the canvas reads that ref inside `useFrame`, and DOM widgets that
need it (the progress readout, the nav's tone) subscribe imperatively and write
straight to the element.

**2. Scroll position becomes a "stage".** `stage` is section-relative: `0` is
the top of section 0, `2.5` is halfway through section 2. Because it is derived
from measured section offsets, sections can change height — or you can add copy
— without the choreography drifting.

**3. The stage samples a keyframed path.** `src/lib/flight.ts` holds the flight
as keyframes on the stage axis (position, rotation, scale, rotor speed, key
light). `sampleFlight()` interpolates between them with a smootherstep and
writes into a preallocated object, so the render loop never allocates.

**4. `DroneRig` adds weight.** On top of the authored pose it layers an idle
hover, a pointer parallax, and a bank angle derived from scroll velocity — then
damps everything frame-rate independently, which is what makes the aircraft
feel like it has mass rather than snapping to a value.

To re-time the animation, edit `FLIGHT_PATH`. To re-order the story, edit
`SECTION_IDS` in `src/lib/site.ts` and `src/app/page.tsx` together.

---

## Performance

- **The 3D layer is never in the first-load bundle.** `SceneCanvas` is a
  `next/dynamic` import with `ssr: false`; three.js and drei land in a separate
  chunk. First Load JS for `/` is ~158 kB.
- **It mounts on idle.** Even on desktop the canvas waits for
  `requestIdleCallback`, so it cannot compete with hydration or LCP. A CSS-only
  `SceneLoader` holds the space in the meantime.
- **No React work per frame.** The scene renders once and animates entirely
  inside `useFrame`.
- **DPR is capped at 1.75**, the renderer pauses on `visibilitychange`, and
  lighting comes from drei `Lightformer`s rather than a CDN-hosted HDR — the
  page never waits on a third-party asset to look right.
- **GSAP is lazy too**, loaded by the first scroll-linked component that needs it.

## Responsiveness and accessibility

`useSceneTier()` resolves one of three tiers and the page commits to it:

| Tier | When | What renders |
| --- | --- | --- |
| `full` | ≥1024px, fine pointer, ≥4 cores / ≥4 GB | The R3F scroll scene |
| `lite` | phones, tablets, low-core devices | `LiteStage` — the same narrative in three composited transforms, no WebGL context |
| `still` | `prefers-reduced-motion`, or no WebGL | A static composition |

Under reduced motion, Lenis is also switched off for native scrolling, GSAP
parallax never initialises, and every reveal renders in its final state.

The animation layer is decorative throughout: the canvas is `aria-hidden` and
`pointer-events-none`, sections are labelled landmarks, form controls are
properly labelled, the menu traps `Escape`, and display headlines that are
split across line boxes for the mask reveal expose the full sentence to
assistive tech (otherwise a screen reader reads "Eyesaboveeverything").

---

## Swapping in real assets

**A real drone model.** `Drone.tsx` is built around the origin with the nose
pointing down `-Z`. `DroneRig` owns every transform, so a GLTF drops in
directly:

```tsx
// src/components/three/DroneRig.tsx
const { scene } = useGLTF('/drone.glb');
// ...
<group ref={group} dispose={null}>
  <primitive object={scene} />
</group>
```

Put the file in `public/`, and call `useGLTF.preload('/drone.glb')` at module
scope. Keep the model's rotors on a named node if you want the spin from
`Drone.tsx`.

**Real footage.** Every placeholder is a `<MediaFrame>`. Pass `src` and the
generated plate disappears while the frame, ratio, radius and reveal behaviour
stay identical:

```tsx
<MediaFrame label="Ridgeline House" src="/work/ridgeline.mp4" ratio="4/5" />
```

`.mp4`/`.webm`/`.mov` render as a muted autoplaying loop; anything else renders
as an image. For the gallery, add `media:` to the entries in `SHOWCASE`
(`src/lib/site.ts`).

**Real fonts.** fkGroteskNeue and fkScreamer are licensed. The site loads the
substitutes the reference system nominates — Inter and Antonio — through
`next/font/google` in `layout.tsx`. To use the real faces, point `next/font/local`
at the files and keep the CSS variable names (`--font-fkgroteskneue`,
`--font-fkscreamer`); nothing else needs to change.

**The booking form** currently logs the submission and confirms optimistically.
Wire `onSubmit` in `src/components/sections/Contact.tsx` to a route handler at
`app/api/booking/route.ts` or your form provider.

---

## Design tokens

Defined once in `src/app/globals.css` and consumed as Tailwind utilities.

| Token | Value | Role |
| --- | --- | --- |
| `--color-meadow-cream` | `#f7f4e8` | Page canvas, cards, inverse text |
| `--color-hillside-ink` | `#000000` | Headings, body, hairline borders, filled buttons |
| `--color-stone-border` | `#c6c3ba` | Muted dividers, low-contrast borders |
| `--color-drone-violet` | `#643aed` | The one chromatic surface — cards and feature blocks only |
| `--radius-card` | `20px` | Every button, card, image and tag |

Type comes in two roles and does not mix: the display face (`type-display`,
`type-heading-lg`, `type-heading`, `type-heading-sm`) at 40px and up with
line-height 0.85 and no letter-spacing, and the grotesque
(`text-caption`/`text-body`/`text-body-lg`/`text-subheading`) for everything
else. The display utilities clamp fluidly so the fixed token sizes hold their
proportions down to phone widths. Elevation is a 1px border, never a shadow.

# RagaCenter

An interactive web app for exploring **Hindustani classical music**. Built with
Vite + React + TypeScript and [Tone.js](https://tonejs.github.io/) for audio.
No backend — everything runs in the browser.

This is being built in phases. **Phases 1–5 are implemented.**

## Run it

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
```

Then open the printed local URL. **Click "Play drone" first** — browsers only
allow audio to start in response to a user gesture.

## Live site (GitHub Pages)

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the app and
publishes it to GitHub Pages on every push. **One-time setup:** in the repo,
go to **Settings → Pages → Build and deployment → Source** and choose
**"GitHub Actions"**. After the next push the site is served at
`https://<your-username>.github.io/<repo>/`.

## What's here

- **Phase 1 — Drone.** A tanpura-style drone (Sa + Pa, with Sa reinforced an
  octave up) on a soft sustained synth voice. Choose the pitch of Sa (C, C#, …).
- **Phase 2 — Raga data model.** `src/music/ragas.ts` defines a typed `Raga`
  object (name, thaat, aroha, avaroha, pakad, vadi, samvadi, timeOfDay, mood),
  seeded with **Yaman, Bhairav, Bhairavi, Bhimpalasi**.
- **Phase 3 — Scale strip + playback.** A 12-position swara strip with the
  selected raga highlighted, and buttons to play the aroha / avaroha / pakad
  over the drone — each note lights up on the strip in real time. Adjustable
  tempo.
- **Phase 4 — Raga comparison.** A "Compare" tab overlays two ragas on one
  strip, colour-coded by membership (shared / only A / only B), with a swara
  diff summary and side-by-side facts plus per-raga phrase playback over the
  shared drone.
- **Phase 5 — Performance timeline.** A "Perform" tab showing a raga
  performance as a proportional, colour-coded arc of sections (alap → jod →
  jhala → composition → climax) for khyal, dhrupad, and instrumental formats.
  Each section explains its rhythm/tempo and can play a demo of the selected
  raga at that section's tempo, lighting a mini scale strip.

## Musical assumptions (read me!)

These choices are deliberate simplifications, documented so they're easy to
revisit in later phases:

1. **Tuning: 12-tone equal temperament (12-TET).** Real tanpuras use
   just-intonation ratios and the exact shruti can vary by raga. We use equal
   temperament because it's unambiguous and cheap to compute. **All** frequency
   math goes through a single helper (`swaraToFrequency` in
   `src/music/theory.ts`), so swapping in just intonation later is a one-file
   change.
2. **Sa is movable (relative).** Every swara is stored as a **semitone offset
   from Sa** (0–11). Choosing a different Sa just shifts a base frequency; the
   raga data never changes.
3. **Octave handling is arithmetic.** Phrase notes may be negative (lower
   octave) or above 11 (upper octave); frequency is `SaFreq × 2^(semitones/12)`.
4. **Swara naming:** UPPERCASE = shuddha, lowercase = komal, and the lone sharp
   `M` = tivra Madhyam. The semitone offset is always the source of truth.
5. **The seed ragas' phrases are simplified, representative forms.** Real ragas
   have richer chalan and alternate phrases; these capture each raga's skeleton.

## Project structure

```
src/
  music/
    theory.ts     # pitch "kernel": swara table + frequency math (12-TET)
    ragas.ts      # Raga type + seed data + helpers (Phase 2)
  audio/
    audioContext.ts  # unlock Web Audio on user gesture
    drone.ts         # DroneEngine — Phase 1
    sequencer.ts     # Sequencer — schedules phrases + visual sync (Phase 3)
  hooks/
    useDrone.ts      # React glue for the drone
    useSequencer.ts  # React glue for phrase playback
  components/        # ScaleStrip, DroneControls, PlaybackControls, RagaInfo, …
  App.tsx            # composes everything; owns Sa / raga / tempo state
```

## Designed for what's next

The data-first design anticipates the planned phases:

- **Raga comparison** — `Raga` objects are plain data keyed by semitone, so two
  ragas can be diffed/overlaid on the strip directly.
- **Performance-structure timeline** — the `Sequencer` already schedules notes
  on Tone's Transport with audio/visual sync, a natural base for a timeline.
